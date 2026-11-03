/**
 * v-flow score-card — Objective scoring for module cards (Decision 3).
 *
 * Emits a re-runnable scorecard: the objective half (6 pts) is computed from
 * machine-checkable facts via a KnowledgeOracle, with an evidence trail. The
 * subjective half (business/dev correctness, depth — 4 pts) needs human + AI
 * graders and is intentionally NOT produced here.
 *
 * Usage:
 *   v-flow score-card [module]            # one card, or all if omitted
 *   v-flow score-card orders --json       # machine-readable scorecard.json
 *   v-flow score-card --oracle none       # declared-only mode (no verification)
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { isInitialized, getVFlowDir } = require('../lib/templates');
const { withErrorHandler, requireInit, printWarn } = require('../lib/cli-error');
const { getOracle } = require('../lib/knowledge-oracle');
const { scoreModuleCard } = require('../lib/module-card-score');

const DIM_LABEL = {
  structural: 'Structural completeness',
  grounded: 'Evidence-grounded',
  freshness: 'Freshness / no-drift',
  coverage: 'Coverage',
};

function evidenceLine(dim) {
  const e = dim.evidence || {};
  switch (dim.key) {
    case 'structural':
      return `${e.issues} issue · ${e.warnings} warning`;
    case 'grounded':
      return dim.verified
        ? `${e.refs_resolved}/${e.refs_total} ref resolve` + (e.broken && e.broken.length ? ` · gãy: ${e.broken.length}` : '')
        : e.reason;
    case 'freshness':
      return dim.verified
        ? `${e.files_checked} file kiểm · drift: ${e.drifted ? e.drifted.length : 0}` + (e.last_verified ? ` (từ ${e.last_verified})` : '')
        : e.reason;
    case 'coverage':
      return dim.verified ? `${e.symbols_mentioned}/${e.symbols_total} symbol` : e.reason;
    default:
      return '';
  }
}

// Turn a scorecard into concrete remediation steps — the "what do I do now"
// the bare numbers don't answer. Only emits for dimensions below their max;
// each line names the dimension, its score, and the exact fix.
function nextSteps(sc) {
  const steps = [];
  for (const dim of sc.dimensions) {
    if (dim.verified && dim.score >= dim.max) continue; // chiều này đã trọn điểm
    const e = dim.evidence || {};
    const at = `(${dim.score}/${dim.max})`;
    switch (dim.key) {
      case 'structural':
        if (e.issues > 0 || e.warnings > 0) {
          steps.push(`Cấu trúc ${at}: chạy \`v-flow validate --module-cards ${sc.module}\` để xem ${e.issues} issue + ${e.warnings} warning cụ thể, rồi bổ sung file/heading còn thiếu.`);
        }
        break;
      case 'grounded':
        if (e.broken && e.broken.length) {
          steps.push(`Bằng chứng ${at}: sửa ${e.broken.length} ref code gãy — vd: ${e.broken[0]}`);
        } else if (!dim.verified && e.refs_total === 0) {
          steps.push(`Bằng chứng ${at}: card chưa neo về code — thêm refs dạng  Source: \`đường-dẫn/file.ext:dòng\`, hàm \`tên\`  vào card.`);
        } else if (!dim.verified) {
          steps.push(`Bằng chứng ${at}: ${e.reason || 'oracle chưa kiểm được'}.`);
        }
        break;
      case 'freshness':
        if (e.drifted && e.drifted.length) {
          steps.push(`Độ mới ${at}: ${e.drifted.length} file đã đổi sau ${e.last_verified} — review & cập nhật card rồi bump **Last verified** (vd: ${e.drifted[0]}).`);
        } else if (!dim.verified && /Last verified/i.test(e.reason || '')) {
          steps.push(`Độ mới ${at}: thêm \`**Last verified**: YYYY-MM-DD\` vào SKILL.md để bật kiểm drift.`);
        } else if (!dim.verified) {
          steps.push(`Độ mới ${at}: ${e.reason || 'chưa kiểm được'}.`);
        }
        break;
      case 'coverage':
        if (!dim.verified) {
          const r = e.reason || '';
          if (/cypher error/i.test(r)) {
            steps.push(`Coverage ${at}: "cypher error" là do GitNexus index/CLI (KHÔNG phải lỗi card). Chạy \`npx gitnexus analyze\` cho repo rồi thử lại; nếu vẫn lỗi, tạm bỏ qua chiều này.`);
          } else if (/full-graph/i.test(r)) {
            steps.push(`Coverage ${at}: cần full-graph — chạy lại với \`--oracle gitnexus\` sau khi \`npx gitnexus analyze\`.`);
          } else if (/no scope|code refs/i.test(r)) {
            steps.push(`Coverage ${at}: card chưa có ref code nên không xác định được phạm vi — thêm \`Source:\` refs trước (xem mục Bằng chứng).`);
          } else {
            steps.push(`Coverage ${at}: ${r || 'chưa kiểm được'}.`);
          }
        } else if (dim.score < dim.max) {
          steps.push(`Coverage ${at}: card mới nhắc ${e.symbols_mentioned}/${e.symbols_total} symbol — bổ sung các symbol quan trọng còn thiếu.`);
        }
        break;
    }
  }
  return steps;
}

function printNextSteps(sc) {
  const steps = nextSteps(sc);
  if (steps.length === 0) {
    console.log(chalk.green('      👉 Đã trọn điểm objective — chuyển sang chấm subjective (business/dev/depth) với human + AI.'));
    return;
  }
  console.log(chalk.white.bold('      👉 Cần làm gì tiếp:'));
  steps.forEach((s, i) => console.log(chalk.dim(`         ${i + 1}. `) + chalk.white(s)));
}

function printScorecard(sc) {
  const stamp = sc.stamp ? chalk.yellow(sc.stamp) : '';
  console.log(chalk.white.bold(`\n   📦 ${sc.module}`));
  console.log(
    chalk.cyan.bold(`   Objective: ${sc.objective_total}/${sc.objective_max}${stamp}`) +
      chalk.dim(`  (oracle: ${sc.oracle}${sc.fully_verified ? '' : ' — có chiều chưa kiểm chứng'})`)
  );
  for (const dim of sc.dimensions) {
    const icon = dim.verified ? '✅' : '⚠️ ';
    const label = DIM_LABEL[dim.key] || dim.key;
    const verifiedTag = dim.verified ? '' : chalk.yellow(' [unverified]');
    console.log(
      `      ${icon} ${chalk.white(label.padEnd(24))} ${chalk.bold(`${dim.score}/${dim.max}`)}${verifiedTag} ` +
        chalk.dim(`— ${evidenceLine(dim)}`)
    );
  }
}

module.exports = function (program) {
  program
    .command('score-card [module]')
    .description('Chấm điểm objective cho module card (.v-flow/modules/) — provable, có evidence trail')
    .option('--json', 'Xuất scorecard dạng JSON (machine-readable)')
    .option('--oracle <mode>', 'Oracle: lightweight | gitnexus (full-graph) | none (declared-only)', 'lightweight')
    .option('--repo <name>', 'Tên repo GitNexus (khi --oracle gitnexus, nếu cần chỉ định)')
    .action(
      withErrorHandler(async (moduleName, options) => {
        const projectRoot = process.cwd();
        requireInit(projectRoot, isInitialized);

        if (!['lightweight', 'gitnexus', 'none'].includes(options.oracle)) {
          printWarn(`--oracle "${options.oracle}" không hợp lệ → dùng "lightweight"`);
          options.oracle = 'lightweight';
        }

        const modulesDir = path.join(getVFlowDir(projectRoot), 'modules');
        const allCards = fs.existsSync(modulesDir)
          ? (await fs.readdir(modulesDir, { withFileTypes: true }))
              .filter((d) => d.isDirectory())
              .map((d) => d.name)
              .sort()
          : [];

        if (allCards.length === 0) {
          if (options.json) {
            console.log('[]');
          } else {
            console.log(chalk.dim('\n   Chưa có module card nào (.v-flow/modules/) — chạy /v.understand trước.\n'));
          }
          return;
        }

        const cards = moduleName
          ? allCards.filter((c) => c === moduleName || c === `domain-${moduleName}`)
          : allCards;

        if (cards.length === 0) {
          printWarn(`Không tìm thấy module card "${moduleName}". Có: ${allCards.join(', ')}`);
          return;
        }

        const oracle = getOracle(options.oracle, projectRoot, { repo: options.repo });
        const results = cards.map((card) => {
          const cardPath = path.join(modulesDir, card);
          const readFile = (f) => {
            const p = path.join(cardPath, f);
            return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
          };
          return scoreModuleCard(card, readFile, oracle);
        });

        if (options.json) {
          console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
          return;
        }

        console.log(chalk.cyan.bold('\n🏅 V Flow — Module Card Scorecard (objective tier)'));
        for (const sc of results) {
          printScorecard(sc);
          printNextSteps(sc);
        }
        console.log(
          chalk.dim(
            '\n   Chú thích: * = thiếu full-graph (coverage chưa kiểm) · † = declared-only (chưa máy nào kiểm).' +
              '\n   Objective = chứng minh được; phần subjective (business/dev/depth, 4đ) do human + AI độc lập chấm.\n'
          )
        );
      })
    );
};
