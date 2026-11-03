const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const crypto = require('crypto');
const { isInitialized, getVFlowDir, listFeatures } = require('../lib/templates');
const { withErrorHandler, requireInit, formatBytes } = require('../lib/cli-error');
const { readFlowState } = require('../lib/yaml-parser');
const { createT } = require('../lib/i18n');

module.exports = function (program) {
  program
    .command('doctor')
    .description('Deep health check — verify V Flow installation integrity')
    .option('--fix', 'Attempt to fix issues automatically')
    .action(withErrorHandler(async (options) => {
      const t = createT();
      const projectRoot = process.cwd();
      const sourceRoot = path.resolve(__dirname, '../..');

      console.log(chalk.cyan.bold(`\n${t('doctor.title')}\n`));

      const issues = [];
      const warnings = [];
      const ok = [];

      // ════════════════════════════════════════════════════════════════════
      // 1. Core Structure
      // ════════════════════════════════════════════════════════════════════
      console.log(chalk.white.bold(t('doctor.core_structure')));

      const mfDir = getVFlowDir(projectRoot);
      if (!isInitialized(projectRoot)) {
        issues.push('V Flow is not initialized (.v-flow/ not found)');
        console.log(chalk.red('   ❌ .v-flow/ not found — run: v-flow init'));
        printSummary(issues, warnings, ok);
        return;
      }
      ok.push('.v-flow/ directory exists');
      console.log(chalk.green('   ✅ .v-flow/ directory exists'));

      const requiredDirs = [
        'features',
        'knowledge',
        'knowledge/architecture-decisions',
        'knowledge/patterns',
        'knowledge/golden-tests',
        'knowledge/lessons-learned',
        'incidents',
      ];

      for (const dir of requiredDirs) {
        const dirPath = path.join(mfDir, dir);
        if (fs.existsSync(dirPath)) {
          ok.push(`${dir}/ exists`);
        } else {
          warnings.push(`Missing directory: .v-flow/${dir}/`);
          console.log(chalk.yellow(`   ⚠️  Missing: .v-flow/${dir}/`));
          if (options.fix) {
            await fs.ensureDir(dirPath);
            console.log(chalk.green(`      → Fixed: created ${dir}/`));
          }
        }
      }

      // ════════════════════════════════════════════════════════════════════
      // 2. Core Files
      // ════════════════════════════════════════════════════════════════════
      console.log(chalk.white.bold(`\n${t('doctor.core_files')}`));

      const coreFiles = [
        { file: 'constitution.md', label: 'Constitution', severity: 'error' },
        { file: 'agent-config.md', label: 'Agent Config', severity: 'error' },
        { file: 'context.md', label: 'Context (U.0)', severity: 'warning' },
        { file: 'knowledge/domain-glossary.md', label: 'Domain Glossary', severity: 'warning' },
      ];

      for (const { file, label, severity } of coreFiles) {
        const filePath = path.join(mfDir, file);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const content = await fs.readFile(filePath, 'utf8');
          const lines = content.split('\n').length;

          // Check if file is still template (mostly placeholders)
          const placeholderCount = (content.match(/\*(tự điền|chưa phát hiện|tự xác định|xyz)\*/g) || []).length;
          if (placeholderCount > 3) {
            warnings.push(`${label}: still has ${placeholderCount} unfilled placeholders`);
            console.log(chalk.yellow(`   ⚠️  ${label}: ${placeholderCount} placeholders still unfilled — needs Tech Lead review`));
          } else {
            ok.push(`${label} exists (${lines} lines)`);
            console.log(chalk.green(`   ✅ ${label} ${chalk.dim(`(${lines} lines, ${formatBytes(stats.size)})`)}`));
          }
        } else {
          if (severity === 'error') {
            issues.push(`Missing required file: ${file}`);
            console.log(chalk.red(`   ❌ ${label}: MISSING`));
          } else {
            warnings.push(`Missing optional file: ${file}`);
            console.log(chalk.yellow(`   ⚠️  ${label}: not found`));
          }
        }
      }

      // ════════════════════════════════════════════════════════════════════
      // 3. AI Agent Integration — Sync Check
      // ════════════════════════════════════════════════════════════════════
      console.log(chalk.white.bold(`\n${t('doctor.ai_sync')}`));

      const syncChecks = [
        {
          label: 'Antigravity',
          checks: [
            { src: null, dest: 'AGENTS.md', root: true },
            { src: 'commands', dest: '.agents/workflows', root: true, isDir: true },
            { src: 'agents', dest: '.agents/agents', root: true, isDir: true },
          ],
        },
        {
          label: 'Copilot',
          checks: [
            { src: null, dest: '.github/copilot-instructions.md', root: true },
            { src: 'commands', dest: '.github/prompts', root: true, isDir: true },
          ],
        },
        {
          label: 'Cursor',
          checks: [
            { src: null, dest: '.cursorrules', root: true },
            { src: 'commands', dest: '.cursor/rules', root: true, isDir: true },
          ],
        },
      ];

      for (const { label, checks } of syncChecks) {
        let allGood = true;
        for (const check of checks) {
          const destPath = check.root
            ? path.join(projectRoot, check.dest)
            : path.join(mfDir, check.dest);

          if (!fs.existsSync(destPath)) {
            allGood = false;
            warnings.push(`${label}: missing ${check.dest}`);
          } else if (check.isDir && check.src) {
            // Count files and compare with source
            const srcDir = path.join(sourceRoot, check.src);
            if (fs.existsSync(srcDir)) {
              const srcFiles = (await fs.readdir(srcDir)).filter(f => f.endsWith('.md'));
              const destFiles = await fs.readdir(destPath);
              const destMdFiles = destFiles.filter(f => f.endsWith('.md') || f.endsWith('.mdc'));

              if (destMdFiles.length < srcFiles.length) {
                allGood = false;
                warnings.push(`${label} ${check.dest}: ${destMdFiles.length}/${srcFiles.length} files — needs sync`);
              }

              // Check for stale files (hash mismatch)
              let staleCount = 0;
              for (const srcFile of srcFiles) {
                const srcContent = await fs.readFile(path.join(srcDir, srcFile), 'utf8');
                const destFile = check.dest.includes('.cursor')
                  ? srcFile.replace(/\.md$/, '.mdc')
                  : srcFile;
                const destFilePath = path.join(destPath, destFile);

                if (fs.existsSync(destFilePath)) {
                  // Simple length check (full hash would be expensive)
                  const destContent = await fs.readFile(destFilePath, 'utf8');
                  // For cursor files, skip the added frontmatter
                  const cleanDest = destContent.replace(/^---[\s\S]*?---\n/, '');
                  const cleanSrc = srcContent.replace(/^---[\s\S]*?---\n/, '');
                  if (cleanDest.trim() !== cleanSrc.trim()) {
                    staleCount++;
                  }
                }
              }

              if (staleCount > 0) {
                allGood = false;
                warnings.push(`${label} ${check.dest}: ${staleCount} file(s) out of sync`);
              }
            }
          }
        }

        if (allGood) {
          ok.push(`${label}: all files synced`);
          console.log(chalk.green(`   ✅ ${label}: up-to-date`));
        } else {
          console.log(chalk.yellow(`   ⚠️  ${label}: needs sync — run: v-flow sync --apply`));
        }
      }

      // ════════════════════════════════════════════════════════════════════
      // 4. Feature Health
      // ════════════════════════════════════════════════════════════════════
      const features = await listFeatures(projectRoot);
      console.log(chalk.white.bold(`\n${t('doctor.feature_health', { count: features.length })}`));

      if (features.length === 0) {
        console.log(chalk.dim('   No features yet'));
      }

      for (const feature of features) {
        const featureDir = path.join(mfDir, 'features', feature);
        const featureIssues = [];

        // Check .flow-state.yaml
        const flowStatePath = path.join(featureDir, '.flow-state.yaml');
        if (!fs.existsSync(flowStatePath)) {
          featureIssues.push('missing .flow-state.yaml');
          if (options.fix) {
            // Can't auto-fix this meaningfully
          }
        }

        // Check spec.md
        const specPath = path.join(featureDir, 'spec.md');
        if (!fs.existsSync(specPath)) {
          featureIssues.push('missing spec.md');
        }

        // Check _session.md
        const sessionPath = path.join(featureDir, '_session.md');
        if (!fs.existsSync(sessionPath)) {
          featureIssues.push('missing _session.md');
        }

        // Check for artifact consistency
        // Use shared YAML parser for robust .flow-state.yaml reading
        const flowState = await readFlowState(featureDir);
        if (flowState) {
          const phase = flowState.currentPhase || '';

          // If phase is past B.0a, plan should exist
          const postPlanPhases = ['B.0b', 'R.0', 'B.1', 'R.1', 'M.0', 'O.0'];
          if (postPlanPhases.includes(phase) && !fs.existsSync(path.join(featureDir, 'plan.md'))) {
            featureIssues.push(`phase is ${phase} but plan.md is missing`);
          }

          // If phase is past R.0, validation should exist
          const postCheckPhases = ['B.1', 'R.1', 'M.0', 'O.0'];
          if (postCheckPhases.includes(phase) && !fs.existsSync(path.join(featureDir, 'validation-report.md'))) {
            featureIssues.push(`phase is ${phase} but validation-report.md is missing`);
          }
        }

        if (featureIssues.length === 0) {
          ok.push(`Feature ${feature}: healthy`);
          console.log(chalk.green(`   ✅ ${feature}`));
        } else {
          for (const issue of featureIssues) {
            warnings.push(`Feature ${feature}: ${issue}`);
          }
          console.log(chalk.yellow(`   ⚠️  ${feature}: ${featureIssues.join(', ')}`));
        }
      }

      // ════════════════════════════════════════════════════════════════════
      // 5. Templates Check
      // ════════════════════════════════════════════════════════════════════
      console.log(chalk.white.bold(`\n${t('doctor.templates')}`));

      const templatesDir = path.join(mfDir, 'templates');
      if (fs.existsSync(templatesDir)) {
        // Count all files recursively
        const countAllFiles = async (dir) => {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          let count = 0;
          for (const e of entries) {
            if (e.isFile()) count++;
            else if (e.isDirectory()) count += await countAllFiles(path.join(dir, e.name));
          }
          return count;
        };
        const totalTemplates = await countAllFiles(templatesDir);
        const hasModuleCard = fs.existsSync(path.join(templatesDir, 'module-card'));
        const hasKnowledge = fs.existsSync(path.join(templatesDir, 'knowledge'));
        ok.push(`Templates: ${totalTemplates} files`);
        console.log(chalk.green(`   ✅ .v-flow/templates/ — ${totalTemplates} files`));
        console.log(chalk.green(`   ✅ module-card/ ${hasModuleCard ? 'present' : chalk.red('MISSING')}`));
        console.log(chalk.green(`   ✅ knowledge/    ${hasKnowledge ? 'present' : chalk.red('MISSING')}`));
      } else {
        warnings.push('Templates directory missing');
        console.log(chalk.yellow('   ⚠️  .v-flow/templates/ missing — run: v-flow sync --apply'));
      }

      // ════════════════════════════════════════════════════════════════════
      // SUMMARY
      // ════════════════════════════════════════════════════════════════════
      printSummary(issues, warnings, ok, t);
    }));
};

// formatBytes is now imported from cli-error.js

function printSummary(issues, warnings, ok, t) {
  console.log(chalk.cyan.bold(`\n${t('doctor.diagnosis')}\n`));

  const total = issues.length + warnings.length + ok.length;
  const healthScore = total > 0 ? Math.round((ok.length / total) * 100) : 0;

  // Health bar
  const barLength = 30;
  const filledLength = Math.round((healthScore / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  const barColor = healthScore >= 80 ? chalk.green
    : healthScore >= 50 ? chalk.yellow
    : chalk.red;

  console.log(`   ${t('doctor.health')}: ${barColor(bar)} ${healthScore}%\n`);

  if (issues.length > 0) {
    console.log(chalk.red(`   ${t('doctor.errors', { count: issues.length })}`));
    for (const issue of issues) {
      console.log(chalk.red(`      • ${issue}`));
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow(`   ${t('doctor.warnings', { count: warnings.length })}`));
    for (const warning of warnings) {
      console.log(chalk.yellow(`      • ${warning}`));
    }
    console.log('');
  }

  console.log(chalk.green(`   ${t('doctor.passed', { count: ok.length })}`));

  // Recommendations
  if (issues.length > 0 || warnings.length > 0) {
    console.log(chalk.white.bold(`\n   ${t('doctor.recommendations')}`));
    if (issues.some(i => i.includes('not initialized'))) {
      console.log(chalk.dim(`      ${t('doctor.run_init')}`));
    }
    if (warnings.some(w => w.includes('needs sync') || w.includes('out of sync'))) {
      console.log(chalk.dim(`      ${t('doctor.run_sync')}`));
    }
    if (warnings.some(w => w.includes('placeholders'))) {
      console.log(chalk.dim(`      ${t('doctor.review_context')}`));
    }
    if (warnings.some(w => w.includes('.flow-state.yaml'))) {
      console.log(chalk.dim(`      ${t('doctor.run_feature')}`));
    }
  }

  console.log('');
}

