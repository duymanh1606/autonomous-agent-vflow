const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { isInitialized, getVFlowDir } = require('../lib/templates');
const { runSync } = require('../lib/sync-core');
const { withErrorHandler, requireInit } = require('../lib/cli-error');
const { createT } = require('../lib/i18n');

module.exports = function (program) {
  program
    .command('upgrade')
    .description('Upgrade templates, agents, and skills to the latest version')
    .option('--dry-run', 'Preview changes without applying')
    .option('--templates-only', 'Only upgrade templates')
    .option('--agents-only', 'Only upgrade agent definitions')
    .action(withErrorHandler(async (options) => {
      const t = createT();
      const projectRoot = process.cwd();
      const sourceRoot = path.resolve(__dirname, '../..');
      const isDryRun = options.dryRun;

      console.log(chalk.cyan.bold(`\n${t('upgrade.title', { mode: isDryRun ? ' (DRY RUN)' : '' })}\n`));

      requireInit(projectRoot, isInitialized);

      const mfDir = getVFlowDir(projectRoot);
      const stats = { updated: 0, added: 0, skipped: 0 };

      // ── Read current version from installed package.json ──
      const sourcePkg = await fs.readJson(path.join(sourceRoot, 'package.json'));
      const sourceVersion = sourcePkg.version;
      console.log(chalk.white(t('upgrade.source_version', { version: chalk.cyan.bold(sourceVersion) })));

      // Check and display installed version
      const versionFile = path.join(mfDir, '.v-flow-version');
      let installedVersion = 'unknown';
      if (fs.existsSync(versionFile)) {
        installedVersion = (await fs.readFile(versionFile, 'utf8')).trim();
      }
      console.log(chalk.white(t('upgrade.installed_version', { version: chalk.dim(installedVersion) })));

      if (installedVersion === sourceVersion && !isDryRun) {
        console.log(chalk.green(`\n   ${t('upgrade.up_to_date')}\n`));
        return;
      }

      console.log('');

      // ════════════════════════════════════════════════════════════════════
      // 1. Upgrade Templates
      // ════════════════════════════════════════════════════════════════════
      if (!options.agentsOnly) {
        console.log(chalk.white.bold(t('upgrade.templates')));

        const templatesSrc = path.join(sourceRoot, 'templates');
        const templatesDest = path.join(mfDir, 'templates');

        if (fs.existsSync(templatesSrc)) {
          // Walk source tree and compare with dest to count new vs updated
          const walk = async (srcDir, destDir) => {
            const entries = await fs.readdir(srcDir, { withFileTypes: true });
            let added = 0, updated = 0;
            for (const e of entries) {
              const srcPath = path.join(srcDir, e.name);
              const destPath = path.join(destDir, e.name);
              if (e.isDirectory()) {
                const sub = await walk(srcPath, destPath);
                added += sub.added;
                updated += sub.updated;
              } else {
                if (!fs.existsSync(destPath)) {
                  added++;
                } else {
                  const srcContent = await fs.readFile(srcPath, 'utf8');
                  const destContent = await fs.readFile(destPath, 'utf8');
                  if (srcContent !== destContent) updated++;
                }
              }
            }
            return { added, updated };
          };

          const { added: newFiles, updated: changedFiles } = await walk(templatesSrc, templatesDest);
          stats.added += newFiles;
          stats.updated += changedFiles;

          if (!isDryRun) {
            await fs.ensureDir(templatesDest);
            await fs.copy(templatesSrc, templatesDest, { overwrite: true });
          }

          console.log(chalk.green(`   ✅ .v-flow/templates/ — synced`));
          if (newFiles > 0) console.log(chalk.green(`      ✨ ${newFiles} new file(s)`));
          if (changedFiles > 0) console.log(chalk.yellow(`      🔄 ${changedFiles} updated file(s)`));
          if (newFiles === 0 && changedFiles === 0) console.log(chalk.dim(`      ⏭️  All templates up-to-date`));
        }
      }

      // ════════════════════════════════════════════════════════════════════
      // 2. Upgrade Agent Definitions & Commands
      // ════════════════════════════════════════════════════════════════════
      if (!options.templatesOnly) {
        console.log(chalk.white.bold(`\n${t('upgrade.agents')}`));
        console.log(chalk.dim(t('upgrade.agents_hint') + '\n'));

        const syncStats = await runSync({
          projectRoot,
          sourceRoot,
          dryRun: isDryRun,
          verbose: false,
          target: 'all',
          silent: true,
        });

        const syncTotal = syncStats.added + syncStats.synced + syncStats.skipped;
        console.log(chalk.green(`   ${t('upgrade.synced', { added: syncStats.added, synced: syncStats.synced, skipped: syncStats.skipped })}`));
        if (syncStats.errors > 0) {
          console.log(chalk.yellow(`   ${t('upgrade.sync_errors', { count: syncStats.errors })}`));
        }

        stats.added += syncStats.added;
        stats.updated += syncStats.synced;
        stats.skipped += syncStats.skipped;
      }

      // ════════════════════════════════════════════════════════════════════
      // 3. Update version marker
      // ════════════════════════════════════════════════════════════════════
      if (!isDryRun) {
        await fs.writeFile(versionFile, sourceVersion, 'utf8');
      }

      // ════════════════════════════════════════════════════════════════════
      // SUMMARY
      // ════════════════════════════════════════════════════════════════════
      console.log(chalk.cyan.bold(`\n${t('sync.summary', { mode: isDryRun ? ' (DRY RUN)' : '' })}\n`));
      console.log(`   ✨ ${t('common.added')}:     ${chalk.green(stats.added)}`);
      console.log(`   🔄 ${t('common.updated')}:   ${chalk.yellow(stats.updated)}`);
      console.log(`   ⏭️  ${t('common.unchanged')}: ${chalk.dim(stats.skipped)}`);

      if (!isDryRun) {
        console.log(chalk.green(`\n   ${t('upgrade.upgraded', { version: sourceVersion })}`));
        console.log(chalk.dim(`   ${t('upgrade.verify_hint')}`));
      } else if (stats.added > 0 || stats.updated > 0) {
        console.log(chalk.yellow(`\n   ${t('upgrade.apply_hint')}`));
      } else {
        console.log(chalk.green(`\n   ${t('upgrade.templates_uptodate')}`));
      }

      console.log('');
    }));
};
