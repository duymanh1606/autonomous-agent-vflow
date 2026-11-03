const path = require('path');
const chalk = require('chalk');
const { runSync, selectTargets } = require('../lib/sync-core');
const { withErrorHandler } = require('../lib/cli-error');
const { createT } = require('../lib/i18n');

module.exports = function (program) {
  program
    .command('sync')
    .description('Sync commands, agents, skills + runtime assets to AI folders & .v-flow/')
    .option('--apply', 'Apply changes (default: dry-run)')
    .option('--verbose', 'Show detailed file-level changes')
    .option('--target <target>', 'Sync specific target only: antigravity, copilot, cursor, claude, all', 'all')
    .action(withErrorHandler(async (options) => {
      const t = createT();
      const projectRoot = process.cwd();
      const sourceRoot = path.resolve(__dirname, '../..');
      const isDryRun = !options.apply;
      const target = options.target.toLowerCase();

      console.log(chalk.cyan.bold(`\n${t('sync.title')}${isDryRun ? ' (DRY RUN)' : ''}\n`));
      if (isDryRun) {
        console.log(chalk.yellow('   ℹ️  Dry-run mode: no files will be changed.'));
        console.log(chalk.yellow('   Add --apply to execute changes.\n'));
      }

      // Single source of truth — the SAME engine `init` / `upgrade` use (no duplicate logic).
      const stats = await runSync({
        projectRoot,
        sourceRoot,
        dryRun: isDryRun,
        verbose: options.verbose,
        target,
        silent: true,
      });

      const targetLabel = selectTargets(target).map(t => t.label).join(' + ') || target;
      console.log(chalk.white(`   📂 ${targetLabel} (commands, agents, skills) + .v-flow/ (templates, skills)`));

      // Summary — counts reflect tracked .md / global files (hash-compared).
      // Skills/templates are bulk-copied (overwrite) so they don't show as numeric diffs.
      console.log(chalk.cyan.bold(`\n── Summary${isDryRun ? ' (DRY RUN)' : ''} ──\n`));
      console.log(`   ✨ Added:     ${chalk.green(stats.added)}`);
      console.log(`   🔄 Updated:   ${chalk.yellow(stats.synced)}`);
      console.log(`   ⏭️  Unchanged: ${chalk.dim(stats.skipped)}`);
      if (stats.errors > 0) {
        console.log(`   ❌ Errors:    ${chalk.red(stats.errors)}`);
      }

      if (isDryRun && (stats.added > 0 || stats.synced > 0)) {
        console.log(chalk.yellow(`\n   ℹ️  Run ${chalk.bold('v-flow sync --apply')} to execute these changes.`));
      } else if (!isDryRun) {
        console.log(chalk.green('\n   ✅ All files synced successfully.'));
      } else {
        console.log(chalk.green('\n   ✅ All files are up-to-date.'));
      }
      console.log('');
    }));
};
