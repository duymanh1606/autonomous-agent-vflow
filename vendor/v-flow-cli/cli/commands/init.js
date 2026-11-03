const path = require('path');
const chalk = require('chalk');
const {
  isInitialized,
  scaffoldDirectories,
  copyTemplate,
  getVFlowDir,
  scanCodebase,
  generateContextMd,
} = require('../lib/templates');
const { runSync, syncVFlowAssets, selectTargets } = require('../lib/sync-core');
const { withErrorHandler } = require('../lib/cli-error');
const { createT } = require('../lib/i18n');

module.exports = function (program) {
  program
    .command('init')
    .description('Initialize V Flow in the current project')
    .argument('[project-name]', 'Project name (optional)', '')
    .option('--ai <agents>', 'AI agents to setup: antigravity, copilot, cursor, claude, all (default: all)', 'all')
    .option('--skip-ai', 'Skip AI agent file setup')
    .option('--force', 'Force reinitialize (overwrite existing files)')
    .action(withErrorHandler(async (projectName, options) => {
      const t = createT();
      const projectRoot = process.cwd();
      const sourceRoot = path.resolve(__dirname, '../..');

      console.log(chalk.cyan.bold(`\n${t('init.title')}\n`));

      // Check if already initialized
      if (isInitialized(projectRoot) && !options.force) {
        console.log(chalk.yellow(t('init.already_exists')));
        console.log(chalk.dim(t('init.already_exists_hint') + '\n'));
      }

      // Step 1: Scaffold directories
      console.log(chalk.white(t('init.creating_dirs')));
      await scaffoldDirectories(projectRoot);
      console.log(chalk.green(`   ${t('init.dir_created')}`));

      // Step 2: Copy constitution template
      const mfDir = getVFlowDir(projectRoot);
      const constitutionDest = path.join(mfDir, 'constitution.md');
      const fs = require('fs-extra');

      if (!fs.existsSync(constitutionDest) || options.force) {
        const today = new Date().toISOString().split('T')[0];
        await copyTemplate('constitution-template.md', constitutionDest, {
          'TÊN DỰ ÁN': projectName || path.basename(projectRoot),
          'YYYY-MM-DD': today,
        });
        console.log(chalk.green(`   ${t('init.constitution_created')}`));
      } else {
        console.log(chalk.dim(`   ${t('init.constitution_exists')}`));
      }

      // Step 3: Copy agent-config template
      const agentConfigDest = path.join(mfDir, 'agent-config.md');
      if (!fs.existsSync(agentConfigDest) || options.force) {
        await copyTemplate('agent-config-template.md', agentConfigDest);
        console.log(chalk.green(`   ${t('init.agent_config_created')}`));
      } else {
        console.log(chalk.dim(`   ${t('init.agent_config_exists')}`));
      }

      // Step 4: Scan codebase & create context.md
      const contextDest = path.join(mfDir, 'context.md');
      if (!fs.existsSync(contextDest) || options.force) {
        process.stdout.write(chalk.white(`\n${t('init.scanning')}`));
        try {
          const scan = await scanCodebase(projectRoot);
          const contextContent = generateContextMd(scan);
          await fs.writeFile(contextDest, contextContent, 'utf8');
          process.stdout.write(' ' + chalk.green('✅\n'));
          console.log(chalk.green(`   ${t('init.scan_complete', { count: scan.totalFiles })}`));
          if (scan.languages.length > 0) {
            console.log(chalk.dim(t('init.scan_languages', { languages: scan.languages.join(', ') })));
          }
          if (scan.frameworks.length > 0) {
            console.log(chalk.dim(t('init.scan_frameworks', { frameworks: scan.frameworks.join(', ') })));
          }
          console.log(chalk.yellow(`   ${t('init.scan_warning')}`));
        } catch (err) {
          process.stdout.write(' ' + chalk.yellow(`${t('init.scan_failed')}\n`));
          await copyTemplate('context-template.md', contextDest);
          console.log(chalk.dim(`   ${t('init.scan_template')}`));
        }
      } else {
        console.log(chalk.dim(`   ${t('init.context_exists')}`));
      }

      // Step 5: Seed Knowledge Base
      const knowledgeDir = path.join(mfDir, 'knowledge');
      const knowledgeTemplateDir = path.join(sourceRoot, 'templates', 'knowledge');

      const knowledgeFiles = [
        { template: 'domain-glossary.md', dest: 'domain-glossary.md' },
        { template: 'patterns.md', dest: 'patterns/v-flow-patterns.md' },
        { template: 'lessons-learned.md', dest: 'lessons-learned/v-flow-lessons.md' },
      ];

      let kbCreated = 0;
      for (const kf of knowledgeFiles) {
        const destPath = path.join(knowledgeDir, kf.dest);
        const srcPath = path.join(knowledgeTemplateDir, kf.template);
        if (!fs.existsSync(destPath) || options.force) {
          await fs.ensureDir(path.dirname(destPath));
          if (fs.existsSync(srcPath)) {
            await fs.copy(srcPath, destPath);
          }
          kbCreated++;
        }
      }
      if (kbCreated > 0) {
        console.log(chalk.green(`   ${t('init.knowledge_seeded', { count: kbCreated })}`));
      } else {
        console.log(chalk.dim(`   ${t('init.knowledge_exists')}`));
      }

      // Step 7: Copy DESIGN.md into .v-flow/DESIGN.md
      const designDest = path.join(mfDir, 'DESIGN.md');
      if (!fs.existsSync(designDest) || options.force) {
        await copyTemplate('DESIGN.md', designDest);
        console.log(chalk.green(`   ✅ Design system: .v-flow/DESIGN.md`));
      } else {
        console.log(chalk.dim(`   .v-flow/DESIGN.md already exists`));
      }

      // Step 8: Scaffold CI gate — runs `v-flow validate --strict` on PRs so
      // spec/plan/tasks can't drift. Without this the validator gates nothing.
      const ciDest = path.join(projectRoot, '.github', 'workflows', 'v-flow-validate.yml');
      if (!fs.existsSync(ciDest) || options.force) {
        await fs.ensureDir(path.dirname(ciDest));
        await copyTemplate('github/workflows/v-flow-validate.yml', ciDest);
        console.log(chalk.green('   ✅ CI gate: .github/workflows/v-flow-validate.yml'));
      } else {
        console.log(chalk.dim('   .github/workflows/v-flow-validate.yml already exists'));
      }

      // Step 6: Sync AI agent files using shared sync-core
      if (!options.skipAi) {
        console.log(chalk.white(`\n${t('init.syncing')}`));

        const ai = options.ai.toLowerCase();

        // Use the shared sync engine — same logic as `v-flow sync --apply`
        const stats = await runSync({
          projectRoot,
          sourceRoot,
          dryRun: false,
          verbose: false,
          target: ai,
          silent: true,
        });

        // Per-target summary — derived from the same registry runSync walks,
        // so a new vendor shows up here automatically (no edits needed).
        for (const tgt of selectTargets(ai)) {
          const cmdDir = path.join(projectRoot, ...tgt.commands.dir);
          const ext = tgt.commands.ext || '.md';
          const cmdCount = fs.existsSync(cmdDir)
            ? (await fs.readdir(cmdDir)).filter(f => f.endsWith(ext)).length
            : 0;
          const globals = (tgt.globals || []).map(g => path.join(...g.dest)).join(', ');
          console.log(chalk.green(`   ✅ ${tgt.label}: ${globals}`));
          console.log(chalk.green(`      ${path.join(...tgt.commands.dir)}/ (${cmdCount} slash commands) + agents + skills`));
        }

        console.log(chalk.green('   ✅ Templates: .v-flow/templates/ (all templates synced)'));
        console.log(chalk.dim(`\n   ${t('init.sync_stats', { added: stats.added, synced: stats.synced, skipped: stats.skipped })}`));
      } else {
        // --skip-ai bỏ qua file AI-tool, NHƯNG vẫn cài runtime assets (.v-flow/templates + skills)
        // để agent path `.v-flow/...` resolve được (chúng là framework runtime, không phải AI files).
        const assets = await syncVFlowAssets({ projectRoot, sourceRoot, dryRun: false });
        console.log(chalk.green(`   ✅ Runtime assets → .v-flow/ (${assets.templates} templates + ${assets.skills} skill files; AI agent files skipped)`));
      }

      // Summary
      console.log(chalk.cyan.bold(`\n${t('init.complete')}\n`));
      console.log(chalk.white(t('init.next_steps')));
      console.log(chalk.yellow(`  ${t('init.review_context')}`));
      console.log(chalk.dim(`  ${t('init.edit_constitution')}`));
      console.log(chalk.dim(`  ${t('init.edit_agent_config')}`));
      console.log(chalk.dim(`  ${t('init.import_ba_docs')}`));
      console.log(chalk.dim(`  ${t('init.start_feature')}`));
      console.log(chalk.dim(`  ${t('init.sync_hint')}`));
      console.log('');
    }));
};
