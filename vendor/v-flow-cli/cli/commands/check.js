const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { isInitialized, getVFlowDir, listFeatures } = require('../lib/templates');
const { withErrorHandler, requireInit, formatBytes } = require('../lib/cli-error');
const { createT } = require('../lib/i18n');

module.exports = function (program) {
  program
    .command('check')
    .description('Check V Flow setup and artifacts status')
    .action(withErrorHandler(async () => {
      const t = createT();
      const projectRoot = process.cwd();
      requireInit(projectRoot, isInitialized);

      console.log(chalk.cyan.bold(`\n${t('check.title')}\n`));
      console.log(chalk.green(`${t('check.vflow_found')}\n`));

      const mfDir = getVFlowDir(projectRoot);

      // Check core files
      console.log(chalk.white.bold(t('check.core_files')));
      const coreFiles = [
        { file: 'constitution.md', label: 'Constitution (S.0a)', required: true },
        { file: 'agent-config.md', label: 'Agent Config (S.0b)', required: true },
        { file: 'context.md', label: 'Context (U.0)', required: false },
      ];

      for (const { file, label, required } of coreFiles) {
        const filePath = path.join(mfDir, file);
        const exists = fs.existsSync(filePath);
        const icon = exists ? chalk.green('✅') : (required ? chalk.red('❌') : chalk.yellow('⚠️'));
        const status = exists ? chalk.dim(` (${formatBytes(fs.statSync(filePath).size)})`) : chalk.dim(' → missing');
        console.log(`   ${icon} ${label}${status}`);
      }

      // Check knowledge base
      console.log(chalk.white.bold(`\n${t('check.knowledge')}`));
      const knowledgeItems = [
        { dir: 'knowledge/domain-glossary.md', label: 'Domain Glossary', isFile: true },
        { dir: 'knowledge/architecture-decisions', label: 'Architecture Decisions' },
        { dir: 'knowledge/patterns', label: 'Patterns' },
        { dir: 'knowledge/golden-tests', label: 'Golden Tests (Ground Truth)' },
        { dir: 'knowledge/lessons-learned', label: 'Lessons Learned' },
      ];

      for (const item of knowledgeItems) {
        const itemPath = path.join(mfDir, item.dir);
        const exists = fs.existsSync(itemPath);
        if (item.isFile) {
          const icon = exists ? chalk.green('✅') : chalk.yellow('⚠️');
          console.log(`   ${icon} ${item.label}`);
        } else {
          if (exists) {
            const count = (await fs.readdir(itemPath)).filter(f => f.endsWith('.md')).length;
            console.log(`   ${chalk.green('✅')} ${item.label} ${chalk.dim(`(${count} files)`)}`);
          } else {
            console.log(`   ${chalk.yellow('⚠️')} ${item.label} ${chalk.dim('→ empty')}`);
          }
        }
      }

      // Check features
      const features = await listFeatures(projectRoot);
      console.log(chalk.white.bold(`\n${t('check.features', { count: features.length })}`));

      if (features.length > 0) {
        for (const feature of features) {
          console.log(chalk.dim(`   📂 ${feature}`));
        }
      } else {
        console.log(chalk.dim(`   ${t('check.no_features')}`));
      }

      // Check AI agent setup
      console.log(chalk.white.bold(`\n${t('check.ai_agents')}`));
      const aiChecks = [
        { path: 'AGENTS.md', label: 'Antigravity (AGENTS.md)', root: true },
        { path: '.agents/workflows', label: 'Antigravity Slash Commands (.agents/workflows/)', root: true },
        { path: '.github/copilot-instructions.md', label: 'Copilot (copilot-instructions.md)', root: true },
        { path: '.github/prompts', label: 'Copilot Slash Commands (.github/prompts/)', root: true },
        { path: '.cursorrules', label: 'Cursor (.cursorrules)', root: true },
        { path: '.cursor/rules', label: 'Cursor Slash Commands (.cursor/rules/)', root: true },
      ];

      for (const check of aiChecks) {
        const checkPath = check.root
          ? path.join(projectRoot, check.path)
          : path.join(mfDir, check.path);
        const exists = fs.existsSync(checkPath);
        const icon = exists ? chalk.green('✅') : chalk.yellow('⚠️');
        console.log(`   ${icon} ${check.label}`);
      }

      console.log('');
    }));
};
