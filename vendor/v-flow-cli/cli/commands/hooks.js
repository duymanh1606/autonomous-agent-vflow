/**
 * v-flow hooks — install / inspect / remove activity-logging lifecycle hooks
 * for the supported AI coding tools.
 *
 * Subcommands:
 *   v-flow hooks install   [--target <key|all>] — write `v-flow log --hook` hooks
 *   v-flow hooks status                          — show which tools have it installed
 *   v-flow hooks uninstall [--target <key|all>] — remove v-flow's hooks (keep user's)
 *
 * Each tool's hook calls `v-flow log --hook <provider>`, which logs every agent
 * tool-use / session boundary into .v-flow/logs/. Configs are merged, never
 * clobbered, and the operation is idempotent.
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { withErrorHandler, ValidationError, printOk, printWarn, printError, printDim } = require('../lib/cli-error');
const { isInitialized } = require('../lib/templates');
const { PROVIDERS, getProvider, mergeConfig, removeConfig, isInstalled } = require('../lib/hook-targets');

module.exports = function (program) {
  const hooksCmd = program
    .command('hooks')
    .description('🪝 Activity-logging hooks for AI tools (claude, cursor, copilot, codex, antigravity)');

  // ── v-flow hooks install ──
  hooksCmd
    .command('install')
    .description('Install v-flow logging hooks into AI tool configs')
    .option('--target <key>', 'Only this tool (claude|cursor|copilot|codex|antigravity); default all')
    .option('--abs', 'Use an absolute node + CLI path instead of `v-flow` (avoids PATH issues in GUI IDEs)')
    .action(
      withErrorHandler(async (options) => {
        const projectRoot = process.cwd();
        const targets = resolveTargets(options.target);
        const bin = options.abs
          ? `"${process.execPath}" "${path.resolve(__dirname, '..', 'index.js')}"`
          : 'v-flow';

        console.log(chalk.cyan.bold('\n🪝 Installing activity-logging hooks\n'));

        let installed = 0;
        for (const provider of targets) {
          const filePath = path.join(projectRoot, ...provider.file);
          const rel = path.relative(projectRoot, filePath) || filePath;

          const existing = await readJsonSafe(filePath);
          if (existing === PARSE_ERROR) {
            printError(`${provider.label}: ${rel} is not valid JSON — skipped (won't clobber)`);
            continue;
          }

          const merged = mergeConfig(provider, existing || {}, { bin });
          await fs.ensureDir(path.dirname(filePath));
          await fs.writeJson(filePath, merged, { spaces: 2 });
          printOk(`${provider.label} → ${rel}`);
          installed++;
        }

        console.log('');
        printDim(`Installed for ${installed}/${targets.length} tool(s). Hooks call: ${bin} log --hook <provider>`);
        if (options.abs) {
          printWarn('Absolute paths are machine-specific — re-run `v-flow hooks install --abs` on each machine; do not commit these configs.');
        } else {
          printDim('Tip: `v-flow` must be on PATH for the hook to run. GUI IDEs may not inherit your shell PATH — use --abs if hooks do not fire.');
        }
        if (!isInitialized(projectRoot)) {
          printWarn('No .v-flow/ here yet — hook entries will be logged only after `v-flow init` (or set VFLOW_LOG_DIR).');
        }
        console.log('');
      })
    );

  // ── v-flow hooks status ──
  hooksCmd
    .command('status')
    .description('Show which AI tools have v-flow logging hooks installed')
    .action(
      withErrorHandler(async () => {
        const projectRoot = process.cwd();
        console.log(chalk.cyan.bold('\n🪝 Hook status\n'));

        for (const provider of PROVIDERS) {
          const filePath = path.join(projectRoot, ...provider.file);
          const rel = path.relative(projectRoot, filePath) || filePath;
          const existing = await readJsonSafe(filePath);

          let mark;
          if (existing === PARSE_ERROR) {
            mark = chalk.red('invalid JSON');
          } else if (existing && isInstalled(provider, existing)) {
            mark = chalk.green('✅ installed');
          } else if (existing) {
            mark = chalk.yellow('⬜ config exists, no v-flow hook');
          } else {
            mark = chalk.dim('— not configured');
          }
          console.log(`   ${chalk.white(provider.label.padEnd(16))} ${mark}  ${chalk.dim(rel)}`);
        }
        console.log('');
      })
    );

  // ── v-flow hooks uninstall ──
  hooksCmd
    .command('uninstall')
    .description("Remove v-flow's logging hooks (leaves your own hooks intact)")
    .option('--target <key>', 'Only this tool (claude|cursor|copilot|codex|antigravity); default all')
    .action(
      withErrorHandler(async (options) => {
        const projectRoot = process.cwd();
        const targets = resolveTargets(options.target);

        console.log(chalk.cyan.bold('\n🪝 Removing activity-logging hooks\n'));

        for (const provider of targets) {
          const filePath = path.join(projectRoot, ...provider.file);
          const rel = path.relative(projectRoot, filePath) || filePath;
          const existing = await readJsonSafe(filePath);

          if (existing === PARSE_ERROR) {
            printError(`${provider.label}: ${rel} is not valid JSON — skipped`);
            continue;
          }
          if (!existing || !isInstalled(provider, existing)) {
            printDim(`${provider.label}: nothing to remove`);
            continue;
          }
          const stripped = removeConfig(provider, existing);
          await fs.writeJson(filePath, stripped, { spaces: 2 });
          printOk(`${provider.label} → removed from ${rel}`);
        }
        console.log('');
      })
    );
};

// ── helpers ──────────────────────────────────────────────────────────────

const PARSE_ERROR = Symbol('parse-error');

function resolveTargets(targetKey) {
  if (!targetKey || targetKey === 'all') return PROVIDERS;
  const provider = getProvider(targetKey);
  if (!provider) {
    throw new ValidationError(
      `Unknown target: ${targetKey}`,
      `Valid: ${PROVIDERS.map((p) => p.key).join(', ')}, all`
    );
  }
  return [provider];
}

/** Read JSON if present; null if missing; PARSE_ERROR sentinel if unparseable. */
async function readJsonSafe(filePath) {
  if (!(await fs.pathExists(filePath))) return null;
  try {
    return await fs.readJson(filePath);
  } catch (_) {
    return PARSE_ERROR;
  }
}
