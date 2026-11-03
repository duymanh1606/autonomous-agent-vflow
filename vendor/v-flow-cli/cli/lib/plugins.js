/**
 * Plugin System — V-Flow Extension Architecture
 *
 * Discovers, loads, and registers custom plugins from:
 *   1. .v-flow/plugins/       (project-level)
 *   2. ~/.v-flow/plugins/     (user-level, future)
 *
 * Plugin Structure:
 *   my-plugin/
 *   ├── plugin.json           ← Manifest (name, version, type, entry)
 *   ├── agent.md              ← Custom agent definition (optional)
 *   ├── workflow.md           ← Custom slash command (optional)
 *   └── skill/                ← Custom skill directory (optional)
 *       ├── SKILL.md
 *       ├── config.json
 *       └── gotchas.md
 */

const path = require('path');
const fs = require('fs-extra');

/**
 * Plugin manifest schema (plugin.json)
 */
const REQUIRED_MANIFEST_FIELDS = ['name', 'version', 'type'];
const VALID_TYPES = ['agent', 'workflow', 'skill', 'composite'];

/**
 * Discover plugins from .v-flow/plugins/ directory
 *
 * @param {string} projectRoot - Project root directory
 * @returns {Array<{ name, version, type, dir, manifest }>} Discovered plugins
 */
async function discoverPlugins(projectRoot) {
  const pluginsDir = path.join(projectRoot, '.v-flow', 'plugins');
  if (!fs.existsSync(pluginsDir)) return [];

  const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
  const plugins = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;

    const pluginDir = path.join(pluginsDir, entry.name);
    const manifestPath = path.join(pluginDir, 'plugin.json');

    if (!fs.existsSync(manifestPath)) continue;

    try {
      const manifest = await fs.readJson(manifestPath);
      const validation = validateManifest(manifest);

      if (validation.valid) {
        plugins.push({
          name: manifest.name,
          version: manifest.version,
          type: manifest.type,
          description: manifest.description || '',
          dir: pluginDir,
          manifest,
        });
      }
    } catch {
      // Skip invalid plugins silently during discovery
    }
  }

  return plugins;
}

/**
 * Validate plugin manifest
 *
 * @param {object} manifest - Parsed plugin.json
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateManifest(manifest) {
  const errors = [];

  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (manifest.type && !VALID_TYPES.includes(manifest.type)) {
    errors.push(`Invalid type: ${manifest.type}. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
    errors.push(`Invalid version format: ${manifest.version}. Use semver (e.g., 1.0.0)`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Load a single plugin — resolves its assets
 *
 * @param {{ name, dir, manifest }} plugin - Discovered plugin info
 * @returns {{ name, type, agents, workflows, skills }}
 */
async function loadPlugin(plugin) {
  const result = {
    name: plugin.name,
    type: plugin.manifest.type,
    agents: [],
    workflows: [],
    skills: [],
  };

  // Discover agent definitions (.md files in plugin root or agents/ subdir)
  const agentFiles = await findMdFiles(plugin.dir, 'agent');
  result.agents = agentFiles;

  // Discover workflows (.md files)
  const workflowFiles = await findMdFiles(plugin.dir, 'workflow');
  result.workflows = workflowFiles;

  // Discover skills (directories with SKILL.md)
  const skillDir = path.join(plugin.dir, 'skill');
  if (fs.existsSync(skillDir) && fs.existsSync(path.join(skillDir, 'SKILL.md'))) {
    result.skills.push({
      name: plugin.name,
      dir: skillDir,
      hasConfig: fs.existsSync(path.join(skillDir, 'config.json')),
      hasGotchas: fs.existsSync(path.join(skillDir, 'gotchas.md')),
    });
  }

  // Also check skills/ subdirectory for multiple skills
  const skillsDir = path.join(plugin.dir, 'skills');
  if (fs.existsSync(skillsDir)) {
    const skillEntries = await fs.readdir(skillsDir, { withFileTypes: true });
    for (const entry of skillEntries) {
      if (entry.isDirectory()) {
        const subSkillDir = path.join(skillsDir, entry.name);
        if (fs.existsSync(path.join(subSkillDir, 'SKILL.md'))) {
          result.skills.push({
            name: entry.name,
            dir: subSkillDir,
            hasConfig: fs.existsSync(path.join(subSkillDir, 'config.json')),
            hasGotchas: fs.existsSync(path.join(subSkillDir, 'gotchas.md')),
          });
        }
      }
    }
  }

  return result;
}

/**
 * Install plugin assets to agent targets
 *
 * @param {string} projectRoot
 * @param {object} loadedPlugin - Result from loadPlugin()
 * @param {object} options - { dryRun, verbose }
 * @returns {{ installed: number, skipped: number }}
 */
async function installPlugin(projectRoot, loadedPlugin, options = {}) {
  const { dryRun = false } = options;
  const stats = { installed: 0, skipped: 0 };

  // Install agents
  for (const agentFile of loadedPlugin.agents) {
    const destAntigravity = path.join(projectRoot, '.agents', 'agents', path.basename(agentFile));
    const destCopilot = path.join(projectRoot, '.github', 'agents', path.basename(agentFile));

    if (!dryRun) {
      await fs.ensureDir(path.dirname(destAntigravity));
      await fs.ensureDir(path.dirname(destCopilot));
      await fs.copy(agentFile, destAntigravity);
      await fs.copy(agentFile, destCopilot);
    }
    stats.installed++;
  }

  // Install workflows
  for (const workflowFile of loadedPlugin.workflows) {
    const destAntigravity = path.join(projectRoot, '.agents', 'workflows', path.basename(workflowFile));
    const destCopilot = path.join(projectRoot, '.github', 'prompts', path.basename(workflowFile));

    if (!dryRun) {
      await fs.ensureDir(path.dirname(destAntigravity));
      await fs.ensureDir(path.dirname(destCopilot));
      await fs.copy(workflowFile, destAntigravity);
      await fs.copy(workflowFile, destCopilot);
    }
    stats.installed++;
  }

  // Install skills
  for (const skill of loadedPlugin.skills) {
    const destAntigravity = path.join(projectRoot, '.agents', 'skills', 'plugins', skill.name);
    const destCopilot = path.join(projectRoot, '.github', 'skills', 'plugins', skill.name);

    if (!dryRun) {
      await fs.ensureDir(destAntigravity);
      await fs.ensureDir(destCopilot);
      await fs.copy(skill.dir, destAntigravity, { overwrite: true });
      await fs.copy(skill.dir, destCopilot, { overwrite: true });
    }
    stats.installed++;
  }

  return stats;
}

/**
 * Scaffold a new plugin directory
 *
 * @param {string} projectRoot
 * @param {string} pluginName
 * @param {string} pluginType - 'agent' | 'workflow' | 'skill' | 'composite'
 */
async function scaffoldPlugin(projectRoot, pluginName, pluginType = 'composite') {
  const pluginDir = path.join(projectRoot, '.v-flow', 'plugins', pluginName);
  if (fs.existsSync(pluginDir)) {
    throw new Error(`Plugin already exists: ${pluginName}`);
  }

  await fs.ensureDir(pluginDir);

  // Create manifest
  const manifest = {
    name: pluginName,
    version: '1.0.0',
    type: pluginType,
    description: `Custom ${pluginType} plugin for V-Flow`,
    author: '',
    v_flow_version: '>=1.0.0',
  };
  await fs.writeJson(path.join(pluginDir, 'plugin.json'), manifest, { spaces: 2 });

  // Create type-specific files
  if (pluginType === 'agent' || pluginType === 'composite') {
    await fs.writeFile(path.join(pluginDir, 'agent.md'), `# ${pluginName} Agent

## Persona
You are the ${pluginName} Agent — *(describe role)*.

## Responsibilities
- *(list responsibilities)*

## Input
- *(what this agent reads)*

## Output
- *(what this agent produces)*

## Routing
- **On success**: → *(next phase)*
- **On failure**: → *(fallback)*
`, 'utf8');
  }

  if (pluginType === 'workflow' || pluginType === 'composite') {
    await fs.writeFile(path.join(pluginDir, 'workflow.md'), `---
description: ${pluginName} workflow
---

# /${pluginName}

## Mục đích
*(Describe what this workflow does)*

## Workflow Steps

### Step 1: *(Step name)*
*(Instructions)*

### Step 2: *(Step name)*
*(Instructions)*

## Output
*(What this workflow produces)*
`, 'utf8');
  }

  if (pluginType === 'skill' || pluginType === 'composite') {
    const skillDir = path.join(pluginDir, 'skill');
    await fs.ensureDir(skillDir);

    await fs.writeFile(path.join(skillDir, 'SKILL.md'), `---
name: ${pluginName}
version: 1.0.0
category: custom
agent: *(which agent uses this skill)*
trigger: manual
---

# ${pluginName}

## Purpose
*(Describe what this skill teaches the agent)*

## When to Use
- *(Trigger conditions)*

## Procedure
1. *(Step 1)*
2. *(Step 2)*
3. *(Step 3)*

## Quality Checklist
- [ ] *(Check 1)*
- [ ] *(Check 2)*
`, 'utf8');

    await fs.writeJson(path.join(skillDir, 'config.json'), {
      name: pluginName,
      version: '1.0.0',
      category: 'custom',
      triggers: ['manual'],
      input_artifacts: [],
      output_artifacts: [],
    }, { spaces: 2 });

    await fs.writeFile(path.join(skillDir, 'gotchas.md'), `# Gotchas — ${pluginName}

## Common Mistakes
1. *(Describe common mistake)*

## Edge Cases
1. *(Describe edge case)*
`, 'utf8');
  }

  return pluginDir;
}

// ============================================================
// Internal Helpers
// ============================================================

/**
 * Find .md files matching a pattern name in a plugin directory
 */
async function findMdFiles(dir, pattern) {
  const found = [];
  const entries = await fs.readdir(dir);

  for (const file of entries) {
    if (file.endsWith('.md') && file.toLowerCase().includes(pattern)) {
      found.push(path.join(dir, file));
    }
  }

  return found;
}

// ============================================================
// Lifecycle Hooks
// ============================================================

/**
 * Execute plugin lifecycle hook (onInstall / onUninstall).
 *
 * Hooks are defined in plugin.json:
 *   "hooks": {
 *     "onInstall": "echo 'Plugin installed'",
 *     "onUninstall": "echo 'Plugin uninstalled'"
 *   }
 *
 * @param {object} plugin - Plugin info with manifest
 * @param {'onInstall'|'onUninstall'} hookName
 * @param {object} context - { projectRoot, dryRun }
 * @returns {{ executed: boolean, message: string }}
 */
async function executeLifecycleHook(plugin, hookName, context = {}) {
  const hooks = plugin.manifest.hooks || {};
  const hookValue = hooks[hookName];

  if (!hookValue) {
    return { executed: false, message: `No ${hookName} hook defined` };
  }

  if (context.dryRun) {
    return { executed: false, message: `[dry-run] Would execute ${hookName}: ${hookValue}` };
  }

  // Hook can be a plain message string (logged only) or a script path
  if (typeof hookValue === 'string') {
    // Check if it's a file path (starts with ./ or has extension)
    const isScript = hookValue.startsWith('./') || hookValue.endsWith('.js');
    if (isScript) {
      const scriptPath = path.resolve(plugin.dir, hookValue);
      if (fs.existsSync(scriptPath)) {
        try {
          const hookModule = require(scriptPath);
          if (typeof hookModule === 'function') {
            await hookModule({ projectRoot: context.projectRoot, plugin });
          }
          return { executed: true, message: `Executed hook script: ${hookValue}` };
        } catch (err) {
          return { executed: false, message: `Hook error: ${err.message}` };
        }
      }
      return { executed: false, message: `Hook script not found: ${hookValue}` };
    }
    // Plain message — just log it
    return { executed: true, message: hookValue };
  }

  return { executed: false, message: `Invalid hook format for ${hookName}` };
}

/**
 * Uninstall a plugin — remove installed assets from agent targets
 *
 * @param {string} projectRoot
 * @param {object} loadedPlugin - Result from loadPlugin()
 * @param {object} options - { dryRun }
 * @returns {{ removed: number }}
 */
async function uninstallPlugin(projectRoot, loadedPlugin, options = {}) {
  const { dryRun = false } = options;
  const stats = { removed: 0 };

  // Remove agents
  for (const agentFile of loadedPlugin.agents) {
    const basename = path.basename(agentFile);
    const targets = [
      path.join(projectRoot, '.agents', 'agents', basename),
      path.join(projectRoot, '.github', 'agents', basename),
    ];
    for (const target of targets) {
      if (fs.existsSync(target)) {
        if (!dryRun) await fs.remove(target);
        stats.removed++;
      }
    }
  }

  // Remove workflows
  for (const workflowFile of loadedPlugin.workflows) {
    const basename = path.basename(workflowFile);
    const targets = [
      path.join(projectRoot, '.agents', 'workflows', basename),
      path.join(projectRoot, '.github', 'prompts', basename),
    ];
    for (const target of targets) {
      if (fs.existsSync(target)) {
        if (!dryRun) await fs.remove(target);
        stats.removed++;
      }
    }
  }

  // Remove skills
  for (const skill of loadedPlugin.skills) {
    const targets = [
      path.join(projectRoot, '.agents', 'skills', 'plugins', skill.name),
      path.join(projectRoot, '.github', 'skills', 'plugins', skill.name),
    ];
    for (const target of targets) {
      if (fs.existsSync(target)) {
        if (!dryRun) await fs.remove(target);
        stats.removed++;
      }
    }
  }

  return stats;
}

module.exports = {
  VALID_TYPES,
  REQUIRED_MANIFEST_FIELDS,
  discoverPlugins,
  validateManifest,
  loadPlugin,
  installPlugin,
  uninstallPlugin,
  scaffoldPlugin,
  findMdFiles,
  executeLifecycleHook,
};

