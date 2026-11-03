#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');
const activityLog = require('./lib/activity-log');

// Capture all CLI output + persist a per-command record to .v-flow/logs/.
activityLog.install();

program
  .name('v-flow')
  .description('🚀 V Flow CLI — Agentic AI Software Development Process')
  .version(pkg.version)
  // ── Global Options ──
  .option('--verbose', 'Show detailed output')
  .option('--lang <language>', 'Set language (vi, en)', process.env.VFLOW_LANG || 'vi');

// Make global options accessible to all commands via environment
program.hook('preAction', (thisCommand, actionCommand) => {
  const opts = program.opts();
  if (opts.verbose) {
    process.env.VFLOW_VERBOSE = '1';
  }
  if (opts.lang) {
    process.env.VFLOW_LANG = opts.lang;
  }
  activityLog.setCommand(actionCommand.name(), process.argv.slice(2));
});

// Register commands
require('./commands/init')(program);
require('./commands/check')(program);
require('./commands/status')(program);
require('./commands/feature')(program);
require('./commands/sync')(program);
require('./commands/doctor')(program);
require('./commands/upgrade')(program);
require('./commands/validate')(program);
require('./commands/score-card')(program);
require('./commands/dev-quiz')(program);
require('./commands/plugin')(program);
require('./commands/log')(program);
require('./commands/hooks')(program);
require('./commands/watch')(program);
require('./commands/extract-log')(program);
require('./commands/slice')(program);

program.parse();
