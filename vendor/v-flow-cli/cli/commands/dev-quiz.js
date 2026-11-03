/**
 * v-flow dev-quiz — Machine-graded technical verification (Decision 2: Dev = graph key).
 *
 * The dev counterpart of business-quiz: instead of a human answer key, the GRAPH
 * is the key. Each question declares a `target` symbol; ground truth = its real
 * blast radius from GitNexus `impact`.
 *
 * Usage:
 *   v-flow dev-quiz <module>                  # print graph-derived answer key (tech-lead briefing)
 *   v-flow dev-quiz <module> --answers a.md   # grade an answers file (F1 vs graph)
 *   v-flow dev-quiz <module> --json [--repo R]
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { isInitialized, getVFlowDir } = require('../lib/templates');
const { withErrorHandler, requireInit, printWarn, printError } = require('../lib/cli-error');
const { getOracle } = require('../lib/knowledge-oracle');
const { generateGroundTruth, gradeDevQuiz } = require('../lib/dev-quiz-grade');

function resolveCard(modulesDir, moduleName) {
  for (const cand of [moduleName, `domain-${moduleName}`]) {
    if (fs.existsSync(path.join(modulesDir, cand, 'dev-quiz.md'))) return cand;
  }
  return null;
}

module.exports = function (program) {
  program
    .command('dev-quiz <module>')
    .description('Kiểm chứng kỹ thuật module card — chấm máy theo GitNexus impact (graph = answer key)')
    .option('--answers <file>', 'File trả lời để chấm (F1 vs ground truth); bỏ trống = in answer key từ graph')
    .option('--oracle <mode>', 'Oracle: gitnexus (mặc định, cần full-graph) | none', 'gitnexus')
    .option('--repo <name>', 'Tên repo GitNexus (nếu cần chỉ định)')
    .option('--json', 'Xuất JSON')
    .action(
      withErrorHandler(async (moduleName, options) => {
        const projectRoot = process.cwd();
        requireInit(projectRoot, isInitialized);

        const modulesDir = path.join(getVFlowDir(projectRoot), 'modules');
        const card = resolveCard(modulesDir, moduleName);
        if (!card) {
          printError(`Không tìm thấy dev-quiz.md cho module "${moduleName}" trong .v-flow/modules/`);
          return;
        }
        const quizContent = fs.readFileSync(path.join(modulesDir, card, 'dev-quiz.md'), 'utf8');
        const oracle = getOracle(options.oracle, projectRoot, { repo: options.repo });

        if (oracle.name !== 'full-graph') {
          printWarn(`Oracle "${oracle.name}" không có impact() → dev-quiz cần --oracle gitnexus để chấm.`);
        }

        // ── Grade mode ──────────────────────────────────────
        if (options.answers) {
          const ansPath = path.resolve(projectRoot, options.answers);
          if (!fs.existsSync(ansPath)) {
            printError(`--answers: file không tồn tại: ${options.answers}`);
            return;
          }
          const result = gradeDevQuiz(quizContent, fs.readFileSync(ansPath, 'utf8'), oracle);
          if (options.json) {
            console.log(JSON.stringify({ module: card, ...result }, null, 2));
            return;
          }
          console.log(chalk.cyan.bold(`\n🧠 Dev-Quiz — ${card} (chấm máy theo graph)\n`));
          for (const q of result.questions) {
            if (!q.verified) {
              console.log(`   ⚠️  ${q.id} ${chalk.dim(`[${q.target}]`)} — ${chalk.yellow('unverified')}: ${q.reason}`);
              continue;
            }
            const icon = q.f1 >= 0.8 ? '✅' : q.f1 >= 0.5 ? '🟡' : '❌';
            console.log(
              `   ${icon} ${q.id} ${chalk.dim(`[${q.target}]`)}  F1=${chalk.bold(q.f1)} ` +
                chalk.dim(`(P=${q.precision} R=${q.recall} · risk=${q.risk} · truth=${q.truth.length})`)
            );
          }
          const tag = result.verified ? chalk.bold(`${result.score}/1`) : chalk.yellow('unverified');
          console.log(chalk.cyan.bold(`\n   Dev-correctness: ${tag}\n`));
          return;
        }

        // ── Generate mode (graph-derived answer key) ────────
        const gt = generateGroundTruth(quizContent, oracle);
        if (options.json) {
          console.log(JSON.stringify({ module: card, ...gt }, null, 2));
          return;
        }
        console.log(chalk.cyan.bold(`\n🧠 Dev-Quiz Answer Key — ${card} (sinh từ GitNexus)\n`));
        if (gt.questions.length === 0) {
          console.log(chalk.dim('   dev-quiz.md chưa khai báo câu hỏi nào ([target: <symbol> | direction: …]).\n'));
          return;
        }
        for (const q of gt.questions) {
          if (!q.found) {
            console.log(`   ⚠️  ${q.id} ${chalk.dim(`[${q.target}]`)} — ${chalk.yellow(q.reason)}`);
            continue;
          }
          console.log(`   ▸ ${chalk.white.bold(q.id)} ${chalk.dim(`[${q.target} · ${q.direction} · risk=${q.risk}]`)}`);
          console.log(chalk.dim(`     ${q.name}`));
          console.log(`     ${chalk.green('Đáp án (graph):')} ${q.truth.length ? q.truth.join(', ') : chalk.dim('(không có dependent)')}`);
        }
        console.log(chalk.dim('\n   Đây là answer key máy sinh — agent/dev trả lời độc lập rồi chấm bằng: dev-quiz --answers <file>.\n'));
      })
    );
};
