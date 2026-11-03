/**
 * v-flow plugin — Plugin management commands
 *
 * Subcommands:
 *   v-flow plugin list          — List discovered plugins
 *   v-flow plugin create <name> — Scaffold a new plugin
 *   v-flow plugin install       — Install all plugin assets to agent targets
 *   v-flow plugin validate      — Validate plugin manifests
 */

const path = require('path');
const chalk = require('chalk');
const { isInitialized, getVFlowDir } = require('../lib/templates');
const { withErrorHandler, requireInit, printOk, printWarn, printError, printDim } = require('../lib/cli-error');
const { createT } = require('../lib/i18n');
const {
  discoverPlugins,
  validateManifest,
  loadPlugin,
  installPlugin,
  scaffoldPlugin,
  VALID_TYPES,
} = require('../lib/plugins');

module.exports = function (program) {
  const pluginCmd = program
    .command('plugin')
    .description('🔌 Plugin management — create, list, install, validate');

  // ════════════════════════════════════════════════════════════
  // v-flow plugin list
  // ════════════════════════════════════════════════════════════
  pluginCmd
    .command('list')
    .description('List discovered plugins')
    .action(withErrorHandler(async () => {
      const t = createT();
      const projectRoot = process.cwd();
      requireInit(projectRoot, isInitialized);

      console.log(chalk.cyan.bold(`\n${t('plugin.title')}\n`));

      const plugins = await discoverPlugins(projectRoot);

      if (plugins.length === 0) {
        console.log(chalk.dim(`   ${t('plugin.no_plugins')}`));
        console.log(chalk.dim(`   ${t('plugin.create_hint')}\n`));
        return;
      }

      console.log(chalk.white.bold(`   Found ${plugins.length} plugin(s):\n`));

      for (const plugin of plugins) {
        const typeColor = {
          agent: chalk.blue,
          workflow: chalk.green,
          skill: chalk.yellow,
          composite: chalk.magenta,
        }[plugin.type] || chalk.white;

        console.log(`   📦 ${chalk.bold(plugin.name)} ${chalk.dim(`v${plugin.version}`)} ${typeColor(`[${plugin.type}]`)}`);
        if (plugin.description) {
          console.log(chalk.dim(`      ${plugin.description}`));
        }
      }
      console.log('');
    }));

  // ════════════════════════════════════════════════════════════
  // v-flow plugin create <name>
  // ════════════════════════════════════════════════════════════
  pluginCmd
    .command('create')
    .description('Scaffold a new plugin')
    .argument('<name>', 'Plugin name (kebab-case)')
    .option('--type <type>', `Plugin type: ${VALID_TYPES.join(', ')}`, 'composite')
    .action(withErrorHandler(async (name, options) => {
      const t = createT();
      const projectRoot = process.cwd();
      requireInit(projectRoot, isInitialized);

      if (!VALID_TYPES.includes(options.type)) {
        throw new (require('../lib/cli-error').ValidationError)(
          `Invalid plugin type: ${options.type}`,
          `Valid types: ${VALID_TYPES.join(', ')}`
        );
      }

      console.log(chalk.cyan.bold(`\n${t('plugin.create_title')}\n`));

      const pluginDir = await scaffoldPlugin(projectRoot, name, options.type);

      printOk(`Plugin created: .v-flow/plugins/${name}/`);
      printOk(`Type: ${options.type}`);
      console.log('');
      console.log(chalk.white.bold('   📁 Created files:'));
      printDim(`plugin.json — manifest`);

      if (options.type === 'agent' || options.type === 'composite') {
        printDim(`agent.md — agent definition`);
      }
      if (options.type === 'workflow' || options.type === 'composite') {
        printDim(`workflow.md — slash command`);
      }
      if (options.type === 'skill' || options.type === 'composite') {
        printDim(`skill/SKILL.md — skill definition`);
        printDim(`skill/config.json — skill config`);
        printDim(`skill/gotchas.md — common gotchas`);
      }

      console.log('');
      console.log(chalk.white.bold('   💡 Next steps:'));
      printDim(`1. Edit files in .v-flow/plugins/${name}/`);
      printDim(`2. Run: v-flow plugin install`);
      console.log('');
    }));

  // ════════════════════════════════════════════════════════════
  // v-flow plugin install
  // ════════════════════════════════════════════════════════════
  pluginCmd
    .command('install')
    .description('Install all plugin assets to agent targets')
    .option('--dry-run', 'Preview without making changes')
    .action(withErrorHandler(async (options) => {
      const t = createT();
      const projectRoot = process.cwd();
      requireInit(projectRoot, isInitialized);

      console.log(chalk.cyan.bold(`\n${t('plugin.install_title')}\n`));

      const plugins = await discoverPlugins(projectRoot);

      if (plugins.length === 0) {
        console.log(chalk.dim('   No plugins to install.\n'));
        return;
      }

      let totalInstalled = 0;
      let totalSkipped = 0;

      for (const plugin of plugins) {
        console.log(chalk.white.bold(`   📦 ${plugin.name} v${plugin.version}:`));

        const loaded = await loadPlugin(plugin);
        const stats = await installPlugin(projectRoot, loaded, {
          dryRun: options.dryRun,
        });

        if (loaded.agents.length > 0) {
          printOk(`${loaded.agents.length} agent(s) → .agents/agents/ & .github/agents/`);
        }
        if (loaded.workflows.length > 0) {
          printOk(`${loaded.workflows.length} workflow(s) → .agents/workflows/ & .github/prompts/`);
        }
        if (loaded.skills.length > 0) {
          printOk(`${loaded.skills.length} skill(s) → .agents/skills/plugins/ & .github/skills/plugins/`);
        }

        totalInstalled += stats.installed;
        totalSkipped += stats.skipped;
        console.log('');
      }

      if (options.dryRun) {
        console.log(chalk.yellow(`   🔍 Dry run — ${totalInstalled} asset(s) would be installed\n`));
      } else {
        console.log(chalk.green(`   ✅ Installed ${totalInstalled} asset(s) from ${plugins.length} plugin(s)\n`));
      }
    }));

  // ════════════════════════════════════════════════════════════
  // v-flow plugin validate
  // ════════════════════════════════════════════════════════════
  pluginCmd
    .command('validate')
    .description('Validate all plugin manifests')
    .action(withErrorHandler(async () => {
      const t = createT();
      const projectRoot = process.cwd();
      requireInit(projectRoot, isInitialized);

      console.log(chalk.cyan.bold(`\n${t('plugin.validate_title')}\n`));

      const fs = require('fs-extra');
      const pluginsDir = path.join(projectRoot, '.v-flow', 'plugins');
      if (!fs.existsSync(pluginsDir)) {
        console.log(chalk.dim('   No plugins directory found.\n'));
        return;
      }

      const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
      let valid = 0;
      let invalid = 0;

      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

        const manifestPath = path.join(pluginsDir, entry.name, 'plugin.json');
        if (!fs.existsSync(manifestPath)) {
          printError(`${entry.name}: missing plugin.json`);
          invalid++;
          continue;
        }

        try {
          const manifest = await fs.readJson(manifestPath);
          const result = validateManifest(manifest);

          if (result.valid) {
            printOk(`${manifest.name} v${manifest.version} [${manifest.type}]`);
            valid++;
          } else {
            printError(`${entry.name}: ${result.errors.join(', ')}`);
            invalid++;
          }
        } catch (err) {
          printError(`${entry.name}: invalid JSON — ${err.message}`);
          invalid++;
        }
      }

      console.log('');
      if (invalid === 0) {
        console.log(chalk.green(`   ✅ All ${valid} plugin(s) valid\n`));
      } else {
        console.log(chalk.yellow(`   ${valid} valid, ${invalid} invalid\n`));
      }
    }));
};
