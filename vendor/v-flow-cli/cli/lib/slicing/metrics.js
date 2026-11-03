/**
 * Metrics — built-in (metrics/) + project metrics (.v-flow/slicing/metrics/*.js).
 * Each metric: { id, name?, better?: 'low' | 'high' | null, compute(graph, variant) → number | { value, display } }
 */
const fs = require('fs');
const path = require('path');

const BUILT_IN_ORDER = [
  'slice-count', 'points-per-slice', 'size-cv', 'first-demo-points', 'foundation-ratio',
  'critical-path', 'parallel-width', 'cross-slice-ratio', 'uc-spread', 'rework-exposure',
];

function loadMetrics(projectRoot = process.cwd()) {
  const metrics = BUILT_IN_ORDER.map((f) => require(`./metrics/${f}`));
  const dir = path.join(projectRoot, '.v-flow', 'slicing', 'metrics');
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) {
      const full = path.join(dir, file);
      delete require.cache[require.resolve(full)];
      const m = require(full);
      if (!m || typeof m.id !== 'string' || typeof m.compute !== 'function') {
        throw new Error(`Metric ${file} phải export { id, compute(graph, variant) }`);
      }
      const idx = metrics.findIndex((x) => x.id === m.id);
      if (idx >= 0) metrics[idx] = m;
      else metrics.push(m);
    }
  }
  return metrics;
}

/** @returns {Array<{ id, name, better, value, display }>} */
function computeMetrics(graph, variant, metrics) {
  return metrics.map((m) => {
    const raw = m.compute(graph, variant);
    const value = raw && typeof raw === 'object' ? raw.value : raw;
    const display = raw && typeof raw === 'object' && raw.display !== undefined ? raw.display : String(value);
    return { id: m.id, name: m.name || m.id, better: m.better || null, value, display };
  });
}

module.exports = { loadMetrics, computeMetrics };
