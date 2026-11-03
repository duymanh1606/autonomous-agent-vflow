const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { isInitialized, getVFlowDir, copyTemplate, listFeatures } = require('../lib/templates');
const { withErrorHandler, requireInit } = require('../lib/cli-error');
const { readFlowState } = require('../lib/yaml-parser');

module.exports = function (program) {
  const feature = program
    .command('feature')
    .description('Manage V Flow features');

  // ── v-flow feature create <name> ──────────────────────────────────────
  feature
    .command('create')
    .description('Create a new feature with scaffolded artifacts')
    .argument('<name>', 'Feature name (e.g. "user-login" or "001-user-login")')
    .option('--type <type>', 'Project type: greenfield or legacy', 'greenfield')
    .option('--no-session', 'Skip creating _session.md')
    .action(withErrorHandler(async (name, options) => {
      const projectRoot = process.cwd();
      requireInit(projectRoot, isInitialized);

      const mfDir = getVFlowDir(projectRoot);
      const featuresDir = path.join(mfDir, 'features');

      // Auto-prefix with next number if name doesn't start with digits
      let featureDirName = name;
      if (!/^\d{3}/.test(name)) {
        const existing = await listFeatures(projectRoot);
        const nextNum = existing.length > 0
          ? Math.max(...existing.map(f => parseInt(f.split('-')[0]) || 0)) + 1
          : 1;
        featureDirName = `${String(nextNum).padStart(3, '0')}-${name}`;
      }

      const featureDir = path.join(featuresDir, featureDirName);

      // Check if feature already exists
      if (fs.existsSync(featureDir)) {
        console.log(chalk.yellow(`\n⚠️  Feature "${featureDirName}" already exists.`));
        console.log(chalk.dim(`   Path: ${featureDir}\n`));
        return;
      }

      console.log(chalk.cyan.bold(`\n🆕 Creating feature: ${featureDirName}\n`));

      // Create feature directory
      await fs.ensureDir(featureDir);
      console.log(chalk.green(`   ✅ Directory created: .v-flow/features/${featureDirName}/`));

      const today = new Date().toISOString().split('T')[0];
      const featureDisplayName = featureDirName.replace(/^\d+-/, '').replace(/-/g, ' ');
      const featureId = featureDirName.split('-')[0];

      // 1. Create spec.md from template
      const specDest = path.join(featureDir, 'spec.md');
      try {
        await copyTemplate('spec-template.md', specDest, {
          'TÊN FEATURE': featureDisplayName,
          'YYYY-MM-DD': today,
        });
        console.log(chalk.green('   ✅ spec.md (specification template)'));
      } catch {
        // Create minimal spec if template not found
        await fs.writeFile(specDest, `# Specification — ${featureDisplayName}\n\n> 📌 **Single Source of Truth** — Spec thắng khi có conflict với plan/tasks/tests.\n> Feature: ${featureDisplayName}\n\n## 1. Tổng quan\n\n*(BA Agent sẽ điền khi chạy /v.specify)*\n\n## 7. Status\n\n| Thông tin | Giá trị |\n|-----------|--------|\n| **Spec Version** | v1.0 |\n| **Trạng thái** | Draft |\n| **Ngày tạo** | ${today} |\n`, 'utf8');
        console.log(chalk.green('   ✅ spec.md (minimal template)'));
      }

      // 2. Create .flow-state.yaml
      const flowStateDest = path.join(featureDir, '.flow-state.yaml');
      const flowStateContent = `# V Flow State — ${featureDirName}
# Tạo tự động bởi v-flow feature create
# ⚠️ KHÔNG sửa tay — dùng /v.status để xem

# ── IDENTITY ──
feature_id: "${featureId}"
feature_name: "${featureDirName}"
created_at: "${today}"
last_updated: "${today}"
project_type: "${options.type}"
schema_version: "2.0"   # khớp SCHEMA_VERSION trong cli/commands/validate.js — feature mới phải theo schema hiện hành
pipeline_type: "full"   # full | quickfix | hotfix — drive "lite" profile của validator

# ── PIPELINE STATE ──
current_phase: "S.1"
phase_status: "pending"

phase_history:
  - phase: "S.1"
    entered_at: "${today}"
    exited_at: null
    reason: "feature created via CLI"

# ── ARTIFACTS ──
artifacts:
  spec:
    exists: true
    version: "v1.0"
    status: "draft"
    human_approved: false
  plan:
    exists: false
    synced_to_spec: null
    human_approved: false
  tasks:
    exists: false
    synced_to_spec: null
    total: 0
    completed: 0
  test_cases:
    exists: false
    synced_to_spec: null
    total: 0
    human_approved: false
  validation_report:
    exists: false
    verdict: null
    concerns_count: 0
  code_review:
    exists: false
    verdict: null

# ── ROUTING ──
routing:
  after_master_check:
    last_verdict: null
    route_decision: null
  after_review:
    last_verdict: null
    route_decision: null

# ── HUMAN CHECKPOINTS ──
human_checkpoints:
  spec_approved: false
  plan_approved: false
  master_check_approved: false
  implementation_approved: false
  review_approved: false

awaiting_checkpoint: "spec_approved"

# ── CONCERNS ──
active_concerns: []

# ── BLOCKED ──
blocked: false
blocked_reason: null

# ── METADATA ──
spec_version_latest: "v1.0"
session_file: ".v-flow/features/${featureDirName}/_session.md"
notes: ""
`;
      await fs.writeFile(flowStateDest, flowStateContent, 'utf8');
      console.log(chalk.green('   ✅ .flow-state.yaml (pipeline state)'));

      // 3. Create _session.md
      if (options.session !== false) {
        const sessionDest = path.join(featureDir, '_session.md');
        try {
          await copyTemplate('session-template.md', sessionDest);
          // Replace placeholders
          let content = await fs.readFile(sessionDest, 'utf8');
          content = content
            .replace(/\[Feature Name\]/g, featureDisplayName)
            .replace(/NNN-feature-name/g, featureDirName)
            .replace(/NNN/g, featureId);
          await fs.writeFile(sessionDest, content, 'utf8');
          console.log(chalk.green('   ✅ _session.md (working memory)'));
        } catch {
          await fs.writeFile(sessionDest, `# Session Memory — ${featureDisplayName}\n\n> Working memory cho feature này.\n\n## 📋 Tóm Tắt Nhanh\n\n\`\`\`\nPhase hiện tại : S.1\nBắt đầu lúc   : ${today}\nSpec version   : v1.0\n\`\`\`\n\n## 🧠 Key Decisions\n\n*(Chưa có)*\n\n## ❓ Open Questions\n\n*(Chưa có)*\n\n## ⚡ Execution Trace\n\n*(Agent sẽ append khi hoàn thành mỗi phase)*\n`, 'utf8');
          console.log(chalk.green('   ✅ _session.md (minimal template)'));
        }
      }

      // Summary
      console.log(chalk.cyan.bold(`\n🎉 Feature "${featureDirName}" created!\n`));
      console.log(chalk.white('Files created:'));
      console.log(chalk.dim(`   📂 .v-flow/features/${featureDirName}/`));
      console.log(chalk.dim(`   ├── spec.md           ← Write spec here (or run /v.specify)`));
      console.log(chalk.dim(`   ├── .flow-state.yaml  ← Pipeline state (auto-managed)`));
      if (options.session !== false) {
        console.log(chalk.dim(`   └── _session.md       ← Working memory`));
      }
      console.log('');
      console.log(chalk.white('Next steps:'));
      console.log(chalk.yellow(`  1. Run /v.specify to generate spec from requirements`));
      console.log(chalk.dim(`  2. Or edit spec.md manually, then run /v.plan`));
      console.log('');
    }));

  // ── v-flow feature list ───────────────────────────────────────────────
  feature
    .command('list')
    .alias('ls')
    .description('List all features and their current phase')
    .action(withErrorHandler(async () => {
      const projectRoot = process.cwd();
      requireInit(projectRoot, isInitialized);

      const features = await listFeatures(projectRoot);

      if (features.length === 0) {
        console.log(chalk.yellow('\nNo features found.'));
        console.log(chalk.dim('Create one: v-flow feature create <name>\n'));
        return;
      }

      console.log(chalk.cyan.bold(`\n📋 Features (${features.length})\n`));

      const mfDir = getVFlowDir(projectRoot);

      for (const feature of features) {
        const featureDir = path.join(mfDir, 'features', feature);
        const flowStatePath = path.join(featureDir, '.flow-state.yaml');

        let phase = '?';
        let status = '';

        if (fs.existsSync(flowStatePath)) {
          const flowState = await readFlowState(featureDir);
          if (flowState) {
            if (flowState.currentPhase) phase = flowState.currentPhase;
            if (flowState.phaseStatus) status = flowState.phaseStatus;
          }
        } else {
          // Infer from existing files
          const hasSpec = fs.existsSync(path.join(featureDir, 'spec.md'));
          const hasPlan = fs.existsSync(path.join(featureDir, 'plan.md'));
          const hasTests = fs.existsSync(path.join(featureDir, 'test-cases.md'));
          const hasValidation = fs.existsSync(path.join(featureDir, 'validation-report.md'));
          if (!hasSpec) phase = 'S.1';
          else if (!hasPlan) phase = 'B.0a';
          else if (!hasTests) phase = 'B.0b';
          else if (!hasValidation) phase = 'R.0';
          else phase = 'B.1';
        }

        const statusIcon = {
          'pending': '⏳',
          'in_progress': '🔄',
          'awaiting_human': '👤',
          'done': '✅',
          'blocked': '🚫',
        }[status] || '📂';

        const phaseColor = phase.startsWith('S') ? chalk.blue
          : phase.startsWith('B') ? chalk.yellow
          : phase.startsWith('R') ? chalk.magenta
          : phase.startsWith('M') ? chalk.green
          : chalk.cyan;

        console.log(`   ${statusIcon} ${chalk.white.bold(feature)}  ${phaseColor(`[${phase}]`)}  ${chalk.dim(status)}`);
      }

      console.log('');
    }));
};
