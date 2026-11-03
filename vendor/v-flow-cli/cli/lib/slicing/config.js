/**
 * Slicing configuration: .v-flow/slicing.config.yaml (project level). Missing file → defaults.
 */
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');

const DEFAULT_CONFIG = {
  enabled: true,
  default_strategy: 'main-first',
  strategy_params: {
    'main-first': { max_points: 8 },
  },
  profiles: {
    strict: { 'R7-thinness': 'warn', 'R8-size': 'warn', 'R11-type': 'warn' },
    experiment: {
      'R2-flow-coverage': 'warn',
      'R4-demoable': 'warn',
      'R7-thinness': 'off',
      'R8-size': 'off',
      'R9-has-tests': 'warn',
      'R10-branch-order': 'warn',
      'R11-type': 'off',
    },
  },
  active_profile: 'strict',
  seams: ['foundation', 'ownership', 'resilience'],
  size: { min_points: 2, max_points: 10 },
  rank_weights: null,
};

function configPath(projectRoot) {
  return path.join(projectRoot, '.v-flow', 'slicing.config.yaml');
}

/**
 * Load and merge with defaults. Profiles merge per profile, strategy_params per strategy.
 * Invalid YAML throws (silently falling back would hide a broken experiment setup).
 */
function loadSlicingConfig(projectRoot = process.cwd()) {
  const file = configPath(projectRoot);
  const base = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  if (!fs.existsSync(file)) return base;
  let loaded;
  try {
    loaded = yaml.load(fs.readFileSync(file, 'utf8')) || {};
  } catch (err) {
    throw new Error(`slicing.config.yaml không hợp lệ: ${err.message}`);
  }
  const merged = { ...base, ...loaded };
  merged.profiles = { ...base.profiles };
  for (const [name, sev] of Object.entries(loaded.profiles || {})) {
    merged.profiles[name] = { ...(base.profiles[name] || {}), ...(sev || {}) };
  }
  merged.strategy_params = { ...base.strategy_params };
  for (const [name, params] of Object.entries(loaded.strategy_params || {})) {
    merged.strategy_params[name] = { ...(base.strategy_params[name] || {}), ...(params || {}) };
  }
  merged.size = { ...base.size, ...(loaded.size || {}) };
  return merged;
}

module.exports = { DEFAULT_CONFIG, configPath, loadSlicingConfig };
