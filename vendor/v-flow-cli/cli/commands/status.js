const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { isInitialized, getVFlowDir, listFeatures, checkFeatureArtifacts } = require('../lib/templates');
const { withErrorHandler, requireInit } = require('../lib/cli-error');
const { readFlowState } = require('../lib/yaml-parser');
const { createT } = require('../lib/i18n');

module.exports = function (program) {
  program
    .command('status')
    .description('Show pipeline status for features')
    .argument('[feature]', 'Feature name (optional, shows all if omitted)')
    .option('--json', 'Output as JSON')
    .action(withErrorHandler(async (featureName, options) => {
      const t = createT();
      const projectRoot = process.cwd();
      requireInit(projectRoot, isInitialized);

      const mfDir = getVFlowDir(projectRoot);
      const features = await listFeatures(projectRoot);

      if (features.length === 0) {
        console.log(chalk.yellow(`\n${t('status.no_features')}`));
        console.log(chalk.dim(`${t('status.no_features_hint')}\n`));
        return;
      }

      // Filter to specific feature if provided
      const targetFeatures = featureName
        ? features.filter(f => f.includes(featureName))
        : features;

      if (targetFeatures.length === 0) {
        console.log(chalk.red(t('status.feature_not_found', { name: featureName })));
        console.log(chalk.dim(`${t('status.available_features', { features: features.join(', ') })}\n`));
        return;
      }

      if (!options.json) {
        console.log(chalk.cyan.bold(`\n${t('status.title')}\n`));
      }

      const allStatuses = [];

      for (const feature of targetFeatures) {
        const featureDir = path.join(mfDir, 'features', feature);
        const artifacts = await checkFeatureArtifacts(projectRoot, feature);

        // Use shared YAML parser
        const state = await readFlowState(featureDir);
        const hasFlowState = state !== null;

        if (options.json) {
          allStatuses.push({ feature, state, artifacts });
          continue;
        }

        // ── Visual output ──
        const completed = artifacts.filter(a => a.exists).length;
        const total = artifacts.length;
        const progress = Math.round((completed / total) * 100);

        // Progress bar
        const barLength = 25;
        const filledLength = Math.round((completed / total) * barLength);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        const barColor = progress === 100 ? chalk.green : progress > 50 ? chalk.yellow : chalk.red;

        console.log(chalk.white.bold(`📂 ${feature}`));

        // If we have flow state, show rich info
        if (state) {
          const phaseLabel = PHASE_LABELS[state.currentPhase] || state.currentPhase;
          const statusIcon = STATUS_ICONS[state.phaseStatus] || '📂';

          console.log(`   ${barColor(bar)} ${progress}%`);
          console.log('');
          console.log(`   ${chalk.cyan('Phase:')}    ${statusIcon} ${chalk.bold(state.currentPhase)} — ${phaseLabel}`);
          console.log(`   ${chalk.cyan('Status:')}   ${state.phaseStatus}`);
          console.log(`   ${chalk.cyan('Spec:')}     ${state.specVersion || 'v1.0'} (${state.artifacts.spec?.status || 'draft'})`);
          console.log(`   ${chalk.cyan('Type:')}     ${state.projectType || 'unknown'}`);

          if (state.blocked) {
            console.log(chalk.red(`   🚫 BLOCKED: ${state.blockedReason || 'reason unknown'}`));
          }

          if (state.awaitingCheckpoint && state.awaitingCheckpoint !== 'null') {
            console.log(chalk.yellow(`   👤 Awaiting: ${state.awaitingCheckpoint.replace(/_/g, ' ')}`));
          }

          if (state.artifacts.tasks.total > 0) {
            console.log(`   ${chalk.cyan('Tasks:')}    ${state.artifacts.tasks.completed}/${state.artifacts.tasks.total}`);
          }

          if (state.concernsCount > 0) {
            console.log(chalk.yellow(`   ⚡ Concerns: ${state.concernsCount} active`));
          }

          if (state.slicing?.active_variant) {
            const lock = state.slicing.locked ? `🔒 ${state.slicing.locked_by || ''}`.trim() : '🔓';
            console.log(`   ${chalk.cyan('Slices:')}   ${state.slicing.active_variant} ${lock}`);
            for (const sl of state.slices) {
              const flags = [
                sl.review_verdict ? `review ${sl.review_verdict}` : null,
                sl.demo_approved ? 'demo ✅' : null,
                sl.needs_recheck ? chalk.red('needs_recheck') : null,
                sl.needs_regression ? chalk.yellow('needs_regression') : null,
              ].filter(Boolean).join(' · ');
              console.log(`     ${STATUS_ICONS[sl.status] || '⏳'} ${String(sl.id).padEnd(9)} ${String(sl.status).padEnd(11)} ${flags}`);
            }
          }

          if (state.artifacts.validation_report?.verdict) {
            const verdict = state.artifacts.validation_report.verdict;
            const verdictColor = verdict === 'PASS' ? chalk.green
              : verdict === 'PASS_WITH_CONCERNS' ? chalk.yellow
              : chalk.red;
            console.log(`   ${chalk.cyan('Verdict:')}  ${verdictColor(verdict)}`);
          }
        } else {
          console.log(`   ${barColor(bar)} ${progress}% (${completed}/${total})`);
        }

        console.log('');

        // Artifact list
        for (const artifact of artifacts) {
          const icon = artifact.exists ? chalk.green('✅') : chalk.dim('⬜');
          const name = artifact.exists ? chalk.white(artifact.name) : chalk.dim(artifact.name);
          const phase = chalk.dim(` → ${artifact.phase}`);
          console.log(`   ${icon} ${name}${phase}`);
        }

        // Current phase / next step
        const currentPhase = state
          ? getNextStep(state)
          : determineCurrentPhase(artifacts);

        console.log(`\n   ${chalk.cyan('▶ Next:')} ${currentPhase}\n`);

        // Pipeline visualization
        if (state) {
          renderPipeline(state.currentPhase);
        }

        console.log(chalk.dim('   ' + '─'.repeat(50)));
        console.log('');
      }

      if (options.json) {
        console.log(JSON.stringify(buildStatusIndex(allStatuses), null, 2));
      }
    }));
};

/**
 * Build a queryable cross-feature index from collected statuses (H5).
 * Flattens the key fields + adds a summary so a dashboard / `jq` can answer
 * "which High-risk features lack approval / are blocked / sit at phase X"
 * without grepping markdown. No new dependency — plain JSON.
 */
function buildStatusIndex(allStatuses) {
  const features = allStatuses.map(({ feature, state, artifacts }) => ({
    feature,
    phase: state?.currentPhase || null,
    status: state?.phaseStatus || null,
    riskTier: state?.riskTier || null,
    approvals: state?.approvals || [],
    verdict: state?.artifacts?.validation_report?.verdict || null,
    blocked: state?.blocked || false,
    awaiting: state?.awaitingCheckpoint && state.awaitingCheckpoint !== 'null'
      ? state.awaitingCheckpoint
      : null,
    concerns: state?.concernsCount || 0,
    tasks: state
      ? { completed: state.artifacts.tasks.completed, total: state.artifacts.tasks.total }
      : null,
    slices: state?.slicing?.active_variant
      ? { variant: state.slicing.active_variant, locked: !!state.slicing.locked, items: state.slices }
      : null,
    artifactsComplete: artifacts.filter(a => a.exists).length,
    artifactsTotal: artifacts.length,
  }));

  const tally = (key, fallback) => features.reduce((acc, e) => {
    const k = e[key] || fallback;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return {
    schema: 'v-flow-status-index/1',
    total: features.length,
    summary: {
      byPhase: tally('phase', 'unknown'),
      byRiskTier: tally('riskTier', 'undeclared'),
      blocked: features.filter(e => e.blocked).length,
      awaiting: features.filter(e => e.awaiting).length,
    },
    features,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// Constants & Helpers
// ═══════════════════════════════════════════════════════════════════════

const PHASE_LABELS = {
  'U.0': 'Understanding',
  'S.0a': 'Constitution',
  'S.0b': 'Agent Setup',
  'S.1': 'Specification',
  'B.0a': 'Planning',
  'B.0b': 'Test Cases',
  'B.0c': 'Slice Planning',
  'R.0': 'Master Check',
  'B.1': 'Implementation',
  'R.1': 'Code Review',
  'M.0': 'Metrics',
  'O.0': 'Operations',
};

const STATUS_ICONS = {
  'pending': '⏳',
  'in_progress': '🔄',
  'awaiting_human': '👤',
  'done': '✅',
  'blocked': '🚫',
  'review': '🔍',
  'demo': '🎬',
};

const PIPELINE_PHASES = ['S.1', 'B.0a', 'B.0b', 'R.0', 'B.1', 'R.1', 'M.0', 'O.0'];

function renderPipeline(currentPhase) {
  const phases = PIPELINE_PHASES;
  const currentIdx = phases.indexOf(currentPhase);

  let pipeline = '   ';
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    if (i < currentIdx) {
      pipeline += chalk.green(`✓ ${phase}`);
    } else if (i === currentIdx) {
      pipeline += chalk.cyan.bold(`▶ ${phase}`);
    } else {
      pipeline += chalk.dim(`○ ${phase}`);
    }
    if (i < phases.length - 1) {
      pipeline += chalk.dim(' → ');
    }
  }
  console.log(pipeline);
}

function getNextStep(state) {
  if (state.blocked) return `🚫 Blocked: ${state.blockedReason || 'resolve blocker first'}`;

  if (state.awaitingCheckpoint && state.awaitingCheckpoint !== 'null') {
    return `👤 Awaiting human: ${state.awaitingCheckpoint.replace(/_/g, ' ')}`;
  }

  const phase = state.currentPhase;
  const nextSteps = {
    'S.1': '/v.specify → write specification',
    'B.0a': '/v.plan → create technical plan',
    'B.0b': '/v.test → generate test cases',
    'B.0c': '/v.slice → cắt slice, so sánh variant, khóa',
    'R.0': '/v.check → Master Check validation',
    'B.1': '/v.implement → start implementation',
    'R.1': '/v.review → adversarial code review',
    'M.0': '/v.metrics → collect metrics',
    'O.0': 'Operations monitoring',
  };

  return nextSteps[phase] || `Phase ${phase}`;
}

function determineCurrentPhase(artifacts) {
  const has = (name) => artifacts.find(a => a.name === name)?.exists;

  if (!has('spec.md')) return '[S.1] Specification needed → run /v.specify';
  if (!has('plan.md')) return '[B.0a] Planning needed → run /v.plan';
  if (!has('test-cases.md')) return '[B.0b] Test cases needed → run /v.test';
  if (!has('validation-report.md')) return '[R.0] Master Check needed → run /v.check';
  if (!has('metrics-report.md')) return '[B.1→R.1] Implementation & Verification → run /v.implement';
  if (!has('operations-report.md')) return '[M.0→O.0] Metrics collected, Operations monitoring';
  return '🎉 All phases complete!';
}
