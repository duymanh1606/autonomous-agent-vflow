/**
 * Sync Core — Shared sync logic for CLI
 *
 * Used by both `v-flow sync` and `v-flow init` commands.
 * Single source of truth for file synchronization.
 */

const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const { TARGETS, convertToMdc, convertAgentToMdc } = require('./sync-targets');

/**
 * Compute SHA256 hash of content (first 12 chars)
 */
function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
}

/**
 * Sync a single file from source to destination
 *
 * @param {string} srcPath - Source file path
 * @param {string} destPath - Destination file path
 * @param {object} options - { dryRun, verbose, transform, stats }
 * @returns {'added'|'updated'|'unchanged'}
 */
async function syncFile(srcPath, destPath, options = {}) {
  const { dryRun = false, verbose = false, transform = null, stats = null } = options;

  const srcContent = await fs.readFile(srcPath, 'utf8');
  const destContent = transform ? transform(srcContent, path.basename(srcPath)) : srcContent;

  if (fs.existsSync(destPath)) {
    const existingContent = await fs.readFile(destPath, 'utf8');
    const srcHash = hashContent(destContent);
    const destHash = hashContent(existingContent);

    if (srcHash === destHash) {
      if (stats) stats.skipped++;
      return 'unchanged';
    }

    if (stats) stats.synced++;
    if (!dryRun) {
      await fs.writeFile(destPath, destContent, 'utf8');
    }
    return 'updated';
  } else {
    if (stats) stats.added++;
    if (!dryRun) {
      await fs.ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, destContent, 'utf8');
    }
    return 'added';
  }
}

/**
 * Sync all .md files from a source directory to a destination directory
 *
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {object} options - { dryRun, verbose, transform, ext, stats }
 * @returns {{ added: number, updated: number, unchanged: number }}
 */
async function syncDir(srcDir, destDir, options = {}) {
  const { dryRun = false, verbose = false, transform = null, ext = '.md', stats = null } = options;

  if (!fs.existsSync(srcDir)) return { added: 0, updated: 0, unchanged: 0 };

  if (!dryRun) await fs.ensureDir(destDir);

  const files = await fs.readdir(srcDir);
  const targetFiles = files.filter(f => f.endsWith('.md'));

  const result = { added: 0, updated: 0, unchanged: 0 };

  for (const file of targetFiles) {
    const srcPath = path.join(srcDir, file);
    const destFileName = ext === '.mdc' ? file.replace(/\.md$/, '.mdc') : file;
    const destPath = path.join(destDir, destFileName);

    // Explicit transform wins; else `.mdc` implies the Cursor command transform.
    const fileTransform = transform || (ext === '.mdc' ? convertToMdc : null);

    try {
      const status = await syncFile(srcPath, destPath, { dryRun, verbose, transform: fileTransform, stats });
      result[status]++;
    } catch (err) {
      if (stats) stats.errors = (stats.errors || 0) + 1;
    }
  }

  return result;
}

/**
 * Copy framework RUNTIME ASSETS (templates + skills) into .v-flow/.
 * Canonical locations agents reference: `.v-flow/templates/X` and
 * `.v-flow/skills/.../scripts/*.sh`. Populated in EVERY project — INCLUDING the framework
 * repo itself — so those paths resolve everywhere. Independent of AI-tool file sync, so it
 * runs even with `init --skip-ai` (these are framework runtime, not AI integration files).
 *
 * @returns {{ templates: number, skills: number }} source-side file counts
 */
async function syncVFlowAssets({ projectRoot, sourceRoot, dryRun = false }) {
  const vFlowDir = path.join(projectRoot, '.v-flow');
  const out = { templates: 0, skills: 0 };

  const countFiles = async (dir) => {
    if (!fs.existsSync(dir)) return 0;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let n = 0;
    for (const e of entries) {
      if (e.isFile()) n++;
      else if (e.isDirectory()) n += await countFiles(path.join(dir, e.name));
    }
    return n;
  };

  for (const name of ['templates', 'skills']) {
    const src = path.join(sourceRoot, name);
    if (!fs.existsSync(src)) continue;
    out[name] = await countFiles(src);
    if (!dryRun) {
      const dest = path.join(vFlowDir, name);
      await fs.ensureDir(dest);
      await fs.copy(src, dest, { overwrite: true });
    }
  }
  return out;
}

/**
 * Select target descriptors from the registry for a given selector.
 *
 * @param {string} target - 'all' (or falsy) → every target; else match by key
 * @returns {Array<object>} matching entries from TARGETS
 */
function selectTargets(target) {
  return TARGETS.filter((t) => !target || target === 'all' || t.key === target);
}

/**
 * Run full sync operation — sync commands, agents, skills, and global files
 * for every selected target. Target specifics live in the config-driven
 * registry (`sync-targets.js`); this function only walks it.
 *
 * @param {object} config
 * @param {string} config.projectRoot - Target project root
 * @param {string} config.sourceRoot - ADLC source root
 * @param {boolean} [config.dryRun=false] - Dry run mode
 * @param {boolean} [config.verbose=false] - Verbose output
 * @param {string} [config.target='all'] - 'all' or a target key (antigravity, copilot, cursor, claude)
 * @returns {{ added: number, synced: number, skipped: number, errors: number }}
 */
async function runSync(config) {
  const {
    projectRoot,
    sourceRoot,
    dryRun = false,
    verbose = false,
    target = 'all',
  } = config;

  const stats = { synced: 0, skipped: 0, added: 0, errors: 0 };
  const syncOpts = { dryRun, verbose, stats };

  // Source directories — vendor-neutral single source of truth.
  const COMMANDS_DIR = path.join(sourceRoot, 'commands');
  const AGENTS_DIR = path.join(sourceRoot, 'agents');
  const SKILLS_DIR = path.join(sourceRoot, 'skills');

  for (const t of selectTargets(target)) {
    const dest = (segs) => path.join(projectRoot, ...segs);

    // ── Commands ──
    await syncDir(COMMANDS_DIR, dest(t.commands.dir), {
      ...syncOpts,
      ext: t.commands.ext || '.md',
      transform: t.commands.transform || null,
    });

    // ── Agents ──
    await syncDir(AGENTS_DIR, dest(t.agents.dir), {
      ...syncOpts,
      ext: t.agents.ext || '.md',
      transform: t.agents.transform || null,
    });

    // ── Skills (bulk copy — preserves nested SKILL.md structure) ──
    if (fs.existsSync(SKILLS_DIR) && !dryRun) {
      await fs.copy(SKILLS_DIR, dest(t.skills.dir), { overwrite: true });
    }

    // ── Global instruction file(s) ──
    for (const g of t.globals || []) {
      const srcPath = path.join(sourceRoot, ...g.src);
      if (!fs.existsSync(srcPath)) continue;
      const destPath = dest(g.dest);
      // noClobber: never overwrite a hand-authored file (e.g. CLAUDE.md).
      if (g.noClobber && fs.existsSync(destPath)) {
        stats.skipped++;
        continue;
      }
      try {
        await syncFile(srcPath, destPath, syncOpts);
      } catch (err) {
        stats.errors++;
      }
    }
  }

  // ── SYNC RUNTIME ASSETS (templates + skills) → .v-flow/ ──
  // Extracted to syncVFlowAssets so `init --skip-ai` and `v-flow sync` install them too.
  await syncVFlowAssets({ projectRoot, sourceRoot, dryRun });

  return stats;
}

module.exports = {
  hashContent,
  convertToMdc,
  convertAgentToMdc,
  syncFile,
  syncDir,
  runSync,
  syncVFlowAssets,
  selectTargets,
  TARGETS,
};
