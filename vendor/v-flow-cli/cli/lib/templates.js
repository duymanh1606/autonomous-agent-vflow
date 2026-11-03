const path = require('path');
const fs = require('fs-extra');

const MASTER_FLOW_DIR = '.v-flow';

// ============================================================
// CODEBASE SCANNER — Delegated to scanner.js (Phase 3 refactor)
// ============================================================
const { scanCodebase, generateContextMd } = require('./scanner');


const COMMANDS_SOURCE = path.resolve(__dirname, '../../commands');
const TEMPLATES_SOURCE = path.resolve(__dirname, '../../templates');

/**
 * Get the .v-flow directory path for a given project root
 */
function getVFlowDir(projectRoot) {
  return path.join(projectRoot, MASTER_FLOW_DIR);
}

/**
 * Check if v-flow is initialized in the given directory
 */
function isInitialized(projectRoot) {
  return fs.existsSync(getVFlowDir(projectRoot));
}

/**
 * Create the .v-flow directory structure
 */
async function scaffoldDirectories(projectRoot) {
  const mfDir = getVFlowDir(projectRoot);
  const dirs = [
    mfDir,
    path.join(mfDir, 'features'),
    path.join(mfDir, 'modules'),
    path.join(mfDir, 'knowledge'),
    path.join(mfDir, 'knowledge', 'architecture-decisions'),
    path.join(mfDir, 'knowledge', 'patterns'),
    path.join(mfDir, 'knowledge', 'lessons-learned'),
    path.join(mfDir, 'knowledge', 'golden-tests'),
    path.join(mfDir, 'incidents'),
  ];

  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
}

/**
 * Copy a template file to destination, replacing placeholders
 */
async function copyTemplate(templateName, destPath, replacements = {}) {
  const srcPath = path.join(TEMPLATES_SOURCE, templateName);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Template not found: ${templateName}`);
  }

  let content = await fs.readFile(srcPath, 'utf8');

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
  }

  await fs.writeFile(destPath, content, 'utf8');
}

const AGENTS_SOURCE = path.resolve(__dirname, '../../agents');
const SKILLS_SOURCE = path.resolve(__dirname, '../../skills');
const MODULE_CARD_TEMPLATES_SOURCE = path.resolve(__dirname, '../../templates/module-card');
const PTYC_SCRIPTS_SOURCE = path.resolve(__dirname, '../../scripts/ptyc');
const PTYC_TEMPLATES_SOURCE = path.resolve(__dirname, '../../templates/ptyc');

/**
 * Setup AI agent integration files (workflows, skills, agents)
 */
async function setupAgentFiles(projectRoot) {
  // ==============================
  // Antigravity: .agents/
  // ==============================

  // 1. Workflows (slash commands)
  const agentsWorkflowDir = path.join(projectRoot, '.agents', 'workflows');
  await fs.ensureDir(agentsWorkflowDir);

  // 2. Skills (agent definitions as skills with SKILL.md)
  const agentsSkillsDir = path.join(projectRoot, '.agents', 'skills');
  await fs.ensureDir(agentsSkillsDir);

  // ==============================
  // GitHub Copilot: .github/
  // ==============================

  // 1. Prompts (slash commands)
  const githubPromptsDir = path.join(projectRoot, '.github', 'prompts');
  await fs.ensureDir(githubPromptsDir);

  // 2. Agents (custom agent definitions)
  const githubAgentsDir = path.join(projectRoot, '.github', 'agents');
  await fs.ensureDir(githubAgentsDir);

  // ==============================
  // Cursor: .cursor/
  // ==============================

  // 1. Rules (slash commands)
  const cursorRulesDir = path.join(projectRoot, '.cursor', 'rules');
  await fs.ensureDir(cursorRulesDir);

  // --- Copy command files to workflows & prompts ---
  if (fs.existsSync(COMMANDS_SOURCE)) {
    const commandFiles = await fs.readdir(COMMANDS_SOURCE);
    for (const file of commandFiles) {
      if (file.endsWith('.md')) {
        const srcPath = path.join(COMMANDS_SOURCE, file);
        await fs.copy(srcPath, path.join(agentsWorkflowDir, file));
        await fs.copy(srcPath, path.join(githubPromptsDir, file));

        // Cursor expects .mdc extension for rules
        const mdcName = file.replace(/\.md$/, '.mdc');
        let content = await fs.readFile(srcPath, 'utf8');

        // If it already has YAML frontmatter, inject globs: *
        if (content.startsWith('---')) {
          content = content.replace(/^---\r?\n/, '---\nglobs: *\n');
        } else {
          // Otherwise prepend a basic frontmatter
          const cmdName = file.replace(/\.md$/, '');
          content = `---
description: Execute /${cmdName}
globs: *
---
${content}`;
        }
        await fs.writeFile(path.join(cursorRulesDir, mdcName), content, 'utf8');
      }
    }
  }

  // --- Copy skills to .agents/skills/ ---
  if (fs.existsSync(SKILLS_SOURCE)) {
    await fs.copy(SKILLS_SOURCE, agentsSkillsDir);
  }

  // --- Copy module-card templates to .v-flow/templates/module-card/ ---
  // These templates are used by understand-agent to generate module cards
  // with the correct structure (headings, tables, mermaid diagrams)
  const moduleCardTemplatesDir = path.join(getVFlowDir(projectRoot), 'templates', 'module-card');
  if (fs.existsSync(MODULE_CARD_TEMPLATES_SOURCE)) {
    await fs.ensureDir(moduleCardTemplatesDir);
    await fs.copy(MODULE_CARD_TEMPLATES_SOURCE, moduleCardTemplatesDir);
  }

  // --- Copy PTYC doc-export tooling INTO .v-flow/ (scripts + template) ---
  // Used by /v.ba-to-ptyc (ba-to-ptyc-agent). Paths MUST live under .v-flow so they
  // resolve in the target project — not the framework repo. render_ptyc.py finds its
  // template via ../../templates/ptyc, which holds inside .v-flow too. Skips sample/ fixture.
  const vflowRoot = getVFlowDir(projectRoot);
  if (fs.existsSync(PTYC_SCRIPTS_SOURCE)) {
    await fs.copy(PTYC_SCRIPTS_SOURCE, path.join(vflowRoot, 'scripts', 'ptyc'), {
      filter: (src) => path.basename(src) !== 'sample' && !src.includes('__pycache__'),
    });
  }
  if (fs.existsSync(PTYC_TEMPLATES_SOURCE)) {
    await fs.copy(PTYC_TEMPLATES_SOURCE, path.join(vflowRoot, 'templates', 'ptyc'));
  }

  // --- Copy agent definitions to .agents/agents/ & .github/agents/ & .cursor/agents/ ---
  if (fs.existsSync(AGENTS_SOURCE)) {
    // Antigravity: .agents/agents/ (flat .md files — personas)
    const antigravityAgentsDir = path.join(projectRoot, '.agents', 'agents');
    await fs.ensureDir(antigravityAgentsDir);

    // Cursor: .cursor/agents/ (.mdc files & agent personas)
    const cursorAgentsDir = path.join(projectRoot, '.cursor', 'agents');
    await fs.ensureDir(cursorAgentsDir);

    const agentFiles = await fs.readdir(AGENTS_SOURCE);
    for (const file of agentFiles) {
      if (file.endsWith('.md')) {
        const srcPath = path.join(AGENTS_SOURCE, file);

        // Antigravity: flat .md file in .agents/agents/
        await fs.copy(srcPath, path.join(antigravityAgentsDir, file));

        // Copilot: flat .md file in .github/agents/
        await fs.copy(srcPath, path.join(githubAgentsDir, file));

        // Cursor: .mdc file with frontmatter in .cursor/agents/
        const mdcName = file.replace(/\.md$/, '.mdc');
        let content = await fs.readFile(srcPath, 'utf8');
        const agentName = file.replace(/\.md$/, '');
        content = `---\ndescription: Agent persona - ${agentName}\nglobs: *\nalwaysApply: false\n---\n${content}`;
        await fs.writeFile(path.join(cursorAgentsDir, mdcName), content, 'utf8');
      }
    }
  }
}

/**
 * Copy AGENTS.md and copilot-instructions.md to project root
 */
async function setupAgentInstructionFiles(projectRoot, sourceRoot) {
  const agentsFile = path.join(sourceRoot, 'AGENTS.md');
  const copilotFile = path.join(sourceRoot, '.github', 'copilot-instructions.md');

  if (fs.existsSync(agentsFile)) {
    await fs.copy(agentsFile, path.join(projectRoot, 'AGENTS.md'));
    // For Cursor, we use AGENTS.md as the global .cursorrules
    await fs.copy(agentsFile, path.join(projectRoot, '.cursorrules'));
  }

  if (fs.existsSync(copilotFile)) {
    const destDir = path.join(projectRoot, '.github');
    await fs.ensureDir(destDir);
    await fs.copy(copilotFile, path.join(destDir, 'copilot-instructions.md'));
  }
}

/**
 * List all features in .v-flow/features/
 */
async function listFeatures(projectRoot) {
  const featuresDir = path.join(getVFlowDir(projectRoot), 'features');
  if (!fs.existsSync(featuresDir)) return [];

  const entries = await fs.readdir(featuresDir, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

/**
 * Check which artifacts exist for a feature
 */
async function checkFeatureArtifacts(projectRoot, featureName) {
  const featureDir = path.join(getVFlowDir(projectRoot), 'features', featureName);
  const artifacts = [
    { name: 'spec.md', phase: '[S.1] Specification' },
    { name: '.flow-state.yaml', phase: '[S.1] Pipeline State' },
    { name: 'plan.md', phase: '[B.0a] Planning' },
    { name: 'tasks.md', phase: '[B.0a] Task Breakdown' },
    { name: 'test-cases.md', phase: '[B.0b] Test Cases' },
    { name: 'validation-report.md', phase: '[R.0] Master Check' },
    { name: 'metrics-report.md', phase: '[M.0] Metrics' },
    { name: 'operations-report.md', phase: '[O.0] Operations' },
  ];

  return artifacts.map(a => ({
    ...a,
    exists: fs.existsSync(path.join(featureDir, a.name)),
  }));
}

module.exports = {
  MASTER_FLOW_DIR,
  getVFlowDir,
  isInitialized,
  scaffoldDirectories,
  copyTemplate,
  setupAgentFiles,
  setupAgentInstructionFiles,
  listFeatures,
  checkFeatureArtifacts,
  scanCodebase,
  generateContextMd,
};


