/**
 * v-flow watch — tool-agnostic activity safety net.
 *
 * Watches `.v-flow/**` and logs every file create/modify/delete to
 * `.v-flow/logs/`. Because it observes the real artifacts agents produce, it
 * captures activity from ANY AI tool (even ones without hooks) and from manual
 * edits — a deterministic fallback complementing per-tool hooks.
 *
 * Portable recursive watch: watches each directory individually (and adds
 * watchers for new ones) instead of relying on fs.watch({recursive:true}),
 * which is unavailable on Linux before Node 20.
 */

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { withErrorHandler, requireInit } = require('../lib/cli-error');
const { isInitialized, getVFlowDir } = require('../lib/templates');
const activityLog = require('../lib/activity-log');

// First path segment under .v-flow/ to never watch. `logs` is mandatory (we
// write there — watching it would loop). The others are gitignored runtime
// copies that would only add noise.
const EXCLUDE_TOP = new Set(['logs', 'templates', 'skills']);
const IGNORE_BASENAMES = new Set(['.DS_Store']);
const DEBOUNCE_MS = 200;

module.exports = function (program) {
  program
    .command('watch')
    .description('Watch .v-flow/ and log every file change (tool-agnostic safety net)')
    .option('--timeout <seconds>', 'Stop automatically after N seconds (0 = run until Ctrl-C)', '0')
    .action(
      withErrorHandler((options) => {
        const projectRoot = process.cwd();
        requireInit(projectRoot, isInitialized);
        const vflowDir = getVFlowDir(projectRoot);

        const watchers = [];
        const known = new Set(); // paths seen → distinguish created vs modified
        const timers = new Map(); // debounce per path
        let stopped = false;

        const relTop = (full) => path.relative(vflowDir, full).split(path.sep)[0];
        const isExcluded = (full) => EXCLUDE_TOP.has(relTop(full));

        function watchDir(dir) {
          let watcher;
          try {
            watcher = fs.watch(dir, (eventType, filename) => {
              if (!filename) return;
              const full = path.join(dir, filename);
              if (isExcluded(full) || IGNORE_BASENAMES.has(path.basename(full))) return;
              schedule(full);
            });
          } catch (_) {
            return; // dir vanished before we could watch it
          }
          watcher.on('error', () => {});
          watchers.push(watcher);
        }

        // emit(full) is called for each newly-discovered path so a directory
        // created together with its files in one tick still logs those files.
        function addTree(dir, emit) {
          watchDir(dir);
          let entries = [];
          try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
          } catch (_) {
            return;
          }
          for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (isExcluded(full) || IGNORE_BASENAMES.has(ent.name)) continue;
            const isNew = !known.has(full);
            known.add(full);
            if (isNew && emit) emit(full);
            if (ent.isDirectory()) addTree(full, emit);
          }
        }

        function schedule(full) {
          if (timers.has(full)) clearTimeout(timers.get(full));
          timers.set(
            full,
            setTimeout(() => {
              timers.delete(full);
              handleChange(full);
            }, DEBOUNCE_MS)
          );
        }

        function logFs(full, action) {
          const rel = path.relative(vflowDir, full);
          activityLog.event({ type: 'fs', action, path: rel }, `[fs] ${action} ${rel}`);
          const colors = { created: chalk.green, modified: chalk.yellow, deleted: chalk.red };
          const color = colors[action] || chalk.white;
          console.log(`${chalk.dim(new Date().toISOString())}  ${color(action.padEnd(8))} ${rel}`);
        }

        function handleChange(full) {
          const exists = fs.existsSync(full);
          if (exists && !known.has(full)) {
            known.add(full);
            logFs(full, 'created');
            try {
              if (fs.statSync(full).isDirectory()) addTree(full, (child) => logFs(child, 'created'));
            } catch (_) {
              /* ignore */
            }
          } else if (exists) {
            logFs(full, 'modified');
          } else if (known.has(full)) {
            known.delete(full);
            logFs(full, 'deleted');
          }
          // else: spurious event for an unknown, non-existent path — ignore
        }

        function stop(reason) {
          if (stopped) return;
          stopped = true;
          for (const t of timers.values()) clearTimeout(t);
          for (const w of watchers) {
            try {
              w.close();
            } catch (_) {
              /* ignore */
            }
          }
          activityLog.event({ type: 'watch', event: 'stop', reason }, `[watch] stop (${reason})`);
          console.log(chalk.dim(`\n🛑 watch stopped (${reason})`));
          process.exit(0);
        }

        addTree(vflowDir);
        activityLog.event({ type: 'watch', event: 'start' }, '[watch] start');
        console.log(chalk.cyan.bold(`\n👀 Watching ${path.relative(projectRoot, vflowDir) || '.v-flow'}/ — logging changes to .v-flow/logs/`));
        console.log(chalk.dim(`   (excluding: ${[...EXCLUDE_TOP].join(', ')}) — Ctrl-C to stop\n`));

        process.on('SIGINT', () => stop('SIGINT'));
        process.on('SIGTERM', () => stop('SIGTERM'));

        const timeout = parseInt(options.timeout, 10) || 0;
        if (timeout > 0) {
          setTimeout(() => stop(`timeout ${timeout}s`), timeout * 1000);
        }
      })
    );
};
