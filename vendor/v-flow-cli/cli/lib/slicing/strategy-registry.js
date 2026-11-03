/**
 * Strategy Registry — built-in strategies + project strategies in .v-flow/slicing/strategies/*.js
 */
const path = require('path');
const fs = require('fs-extra');

const BUILT_IN = ['manual', 'per-uc', 'per-flow', 'main-first', 'size-capped', 'seam'];

/** Parameters every strategy accepts. */
const COMMON_PARAMS = {
  foundation: { type: 'string', default: 'auto', enum: ['auto', 'none'], description: 'auto = task không phục vụ luồng nào vào SLICE-0' },
  hub_policy: { type: 'string', default: 'first-consumer', enum: ['first-consumer', 'own-slice'], description: 'Task dùng chung: ở slice đầu tiên cần nó, hoặc tách slice riêng' },
};

function customDir(projectRoot) {
  return path.join(projectRoot, '.v-flow', 'slicing', 'strategies');
}

/**
 * @returns {Map<string, object>} name → strategy (with `source`: 'built-in' | file path)
 */
function getStrategyRegistry(projectRoot = process.cwd()) {
  const registry = new Map();
  for (const name of BUILT_IN) {
    registry.set(name, { ...require(`./strategies/${name}`), source: 'built-in' });
  }
  const dir = customDir(projectRoot);
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) {
      const full = path.join(dir, file);
      let mod;
      try {
        delete require.cache[require.resolve(full)];
        mod = require(full);
      } catch (err) {
        throw new Error(`Không nạp được strategy ${file}: ${err.message}`);
      }
      if (!mod || typeof mod.name !== 'string' || typeof mod.plan !== 'function') {
        throw new Error(`Strategy ${file} phải export { name, plan(graph, params, helpers) }`);
      }
      registry.set(mod.name, { ...mod, source: full });
    }
  }
  return registry;
}

function getStrategy(name, projectRoot = process.cwd()) {
  return getStrategyRegistry(projectRoot).get(name) || null;
}

module.exports = {
  COMMON_PARAMS,
  getStrategyRegistry,
  getStrategy,
};
