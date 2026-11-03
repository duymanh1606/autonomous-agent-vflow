/**
 * Compare variants (UC-02) and benchmark strategies (UC-06).
 * Same profile + same metrics for every variant; no automatic winner unless rank_weights is set.
 */
const { evaluateVariant } = require('./evaluator');
const { computeMetrics } = require('./metrics');
const { buildVariant, resolveParams } = require('./planner');

function evaluateAll(graph, variant, config, profile, metrics) {
  const evaluation = evaluateVariant(graph, variant, config, profile);
  return { evaluation, metrics: computeMetrics(graph, variant, metrics) };
}

function placement(variant, kind, id) {
  const s = (variant.slices || []).find((x) => (x[kind] || []).includes(id));
  if (s) return s.id;
  if (kind === 'flows' && (variant.deferred || []).some((d) => (d.flow || d) === id)) return 'deferred';
  return '—';
}

/**
 * @param {object} opts
 * @param {object} opts.graph
 * @param {Array<{ name, variant }>} opts.variants
 * @param {object} opts.config
 * @param {string} opts.profile
 * @param {Array} opts.metrics - loaded metric modules
 */
function compareVariants({ graph, variants, config, profile, metrics }) {
  const columns = variants.map(({ name, variant }) => {
    const { evaluation, metrics: values } = evaluateAll(graph, variant, config, profile, metrics);
    return {
      name,
      strategy: (variant.provenance || {}).strategy || '?',
      stale: (variant.provenance || {}).graph_hash !== graph.hash,
      errors: evaluation.errorCount,
      warns: evaluation.warnCount,
      metrics: values,
    };
  });

  const rows = metrics.map((m, i) => {
    const values = columns.map((c) => c.metrics[i]);
    const nums = values.map((v) => v.value).filter((v) => typeof v === 'number');
    let best = [];
    if (m.better && nums.length > 1) {
      const target = m.better === 'low' ? Math.min(...nums) : Math.max(...nums);
      if (!nums.every((n) => n === target)) best = values.map((v, j) => (v.value === target ? j : -1)).filter((j) => j >= 0);
    }
    return { id: m.id, name: m.name || m.id, better: m.better || null, values: values.map((v) => ({ value: v.value, display: v.display })), best };
  });

  let ranking = null;
  if (config.rank_weights && Object.keys(config.rank_weights).length > 0) {
    ranking = columns.map((c) => {
      const score = Object.entries(config.rank_weights).reduce((sum, [id, w]) => {
        const v = c.metrics.find((x) => x.id === id);
        return sum + (v && typeof v.value === 'number' ? v.value * Number(w) : 0);
      }, 0);
      return { name: c.name, score: Math.round(score * 100) / 100 };
    }).sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));
  }

  const diff = [];
  if (variants.length > 1) {
    for (const [kind, list] of [['flows', graph.flows || []], ['units', graph.units || []]]) {
      for (const item of list) {
        const where = variants.map(({ variant }) => placement(variant, kind, item.id));
        if (new Set(where).size > 1) diff.push({ kind: kind === 'flows' ? 'flow' : 'task', id: item.id, where });
      }
    }
  }

  return { profile, graph_hash: graph.hash, columns, rows, ranking, diff };
}

/**
 * Run several strategies on several features; collect per-run metrics and per-strategy means.
 * @param {object} opts
 * @param {Array<{ name, graph }>} opts.features
 * @param {Array<object>} opts.strategies
 */
function runBench({ features, strategies, config, profile, metrics, cliParams = {}, now }) {
  const runs = [];
  for (const { name: feature, graph } of features) {
    for (const strategy of strategies) {
      try {
        const params = resolveParams(strategy, (cliParams[strategy.name] || {}), config);
        const variant = buildVariant({ name: strategy.name, graph, strategy, params, now });
        const { evaluation, metrics: values } = evaluateAll(graph, variant, config, profile, metrics);
        runs.push({ feature, strategy: strategy.name, ok: true, errors: evaluation.errorCount, warns: evaluation.warnCount, metrics: values });
      } catch (err) {
        runs.push({ feature, strategy: strategy.name, ok: false, error: err.message });
      }
    }
  }

  const mean = (list) => (list.length === 0 ? null : Math.round((list.reduce((a, b) => a + b, 0) / list.length) * 100) / 100);
  const summary = strategies.map((s) => {
    const ok = runs.filter((r) => r.strategy === s.name && r.ok);
    return {
      strategy: s.name,
      runs: runs.filter((r) => r.strategy === s.name).length,
      failed: runs.filter((r) => r.strategy === s.name && !r.ok).length,
      errors: mean(ok.map((r) => r.errors)),
      warns: mean(ok.map((r) => r.warns)),
      metrics: metrics.map((m) => ({
        id: m.id,
        mean: mean(ok.map((r) => r.metrics.find((x) => x.id === m.id).value).filter((v) => typeof v === 'number')),
      })),
    };
  });
  return { profile, runs, summary };
}

module.exports = { compareVariants, runBench };
