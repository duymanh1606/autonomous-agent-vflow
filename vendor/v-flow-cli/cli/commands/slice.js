const chalk = require('chalk');
const { InvalidArgumentError } = require('commander');
const { withErrorHandler, CliError, printOk, printWarn, printError } = require('../lib/cli-error');
const service = require('../lib/slicing/service');

/** Collect repeatable `--param k=v` into an object. */
function collectParam(value, previous = {}) {
  const idx = value.indexOf('=');
  if (idx <= 0) throw new InvalidArgumentError(`--param phải có dạng k=v (nhận "${value}")`);
  return { ...previous, [value.slice(0, idx).trim()]: value.slice(idx + 1).trim() };
}

const csv = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);

/** Turn SliceError into CliError (exit code 1, hint, detail lines). */
function run(fn) {
  return withErrorHandler(async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      if (err instanceof service.SliceError) {
        for (const line of err.details || []) console.error(chalk.red(`   • ${line}`));
        throw new CliError(err.message, { hint: err.hint });
      }
      throw err;
    }
  });
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

function printEvaluation(evaluation, { limit = 20 } = {}) {
  const head = `Luật (profile ${evaluation.profile}): ${evaluation.errorCount} lỗi, ${evaluation.warnCount} cảnh báo`;
  if (evaluation.errorCount > 0) printError(head);
  else if (evaluation.warnCount > 0) printWarn(head);
  else printOk(head);
  for (const v of evaluation.violations.slice(0, limit)) {
    const color = v.severity === 'error' ? chalk.red : chalk.yellow;
    console.log(color(`      ${v.severity === 'error' ? '✖' : '!'} ${v.rule}${v.slice ? ` (${v.slice})` : ''}: ${v.message}`));
  }
  if (evaluation.violations.length > limit) console.log(chalk.dim(`      … và ${evaluation.violations.length - limit} vi phạm khác`));
}

function printSlices(variant) {
  for (const s of variant.slices) {
    console.log(`   ${chalk.cyan(s.id.padEnd(9))} ${chalk.white(s.name)} ${chalk.dim(`[${s.type}]`)}`);
    console.log(chalk.dim(`             luồng: ${s.flows.join(', ') || '—'} · task: ${s.units.join(', ') || '—'} · sau: ${s.depends_on.join(', ') || '—'}`));
  }
  for (const d of variant.deferred || []) console.log(chalk.dim(`   deferred  ${d.flow}: ${d.reason}`));
}

function printMetrics(metrics) {
  console.log(chalk.dim(`   ${metrics.map((m) => `${m.id}=${m.display}`).join(' · ')}`));
}

module.exports = function (program) {
  const slice = program
    .command('slice')
    .description('Slice Planning (B.0c) — cắt feature thành các lát dọc demo được, so sánh và khóa phương án');

  slice
    .command('graph')
    .description('Dựng slicing/graph.json từ spec + tasks + test-cases; in tham chiếu hỏng và task thiếu mapping luồng')
    .argument('<feature>', 'Tên/tiền tố feature hoặc đường dẫn thư mục feature')
    .option('--json', 'Xuất JSON')
    .option('--dry-run', 'Không ghi file')
    .action(run(async (feature, options) => {
      const r = service.graph(process.cwd(), feature, { dryRun: options.dryRun });
      const g = r.graph;
      if (options.json) return printJson(g);
      console.log(chalk.cyan.bold(`\n🧩 Slice graph — ${feature}\n`));
      console.log(`   spec ${g.spec_version} · hash ${chalk.bold(g.hash)} ${r.changed ? chalk.yellow('(mới)') : chalk.dim('(không đổi)')}`);
      console.log(`   ${g.flows.length} luồng · ${g.units.length} task · ${g.acs.length} AC · ${g.tests.length} TC`);
      if (!options.dryRun) console.log(chalk.dim(`   → ${r.file}`));
      const broken = service.brokenLines(g);
      if (broken.length > 0) {
        printError(`${broken.length} tham chiếu hỏng:`);
        broken.forEach((l) => console.log(chalk.red(`      ${l}`)));
      }
      for (const w of g.diagnostics.warnings) printWarn(w.message);
      if (broken.length === 0 && g.diagnostics.warnings.length === 0) printOk('Đầu vào sạch');
      console.log('');
      if (broken.length > 0) process.exitCode = 1;
    }));

  slice
    .command('strategies')
    .description('Liệt kê strategy có sẵn và tự viết, kèm tham số và giá trị mặc định')
    .option('--json', 'Xuất JSON')
    .action(run(async (options) => {
      const list = service.strategies(process.cwd());
      if (options.json) return printJson({ strategies: list, common_params: service.commonParams() });
      console.log(chalk.cyan.bold('\n🧭 Slice strategies\n'));
      for (const s of list) {
        const src = s.source === 'built-in' ? chalk.dim('built-in') : chalk.magenta(s.source);
        console.log(`   ${chalk.bold(s.name.padEnd(12))} ${s.description} ${src}`);
        for (const p of s.params) {
          console.log(chalk.dim(`      --param ${p.name}=${JSON.stringify(p.default)}  ${p.description}`));
        }
      }
      console.log(chalk.dim('\n   Tham số chung:'));
      for (const p of service.commonParams()) console.log(chalk.dim(`      --param ${p.name}=${p.default}  ${p.description}`));
      console.log('');
    }));

  slice
    .command('plan')
    .description('Sinh một variant bằng một strategy (UC-01) — không đụng spec/tasks/active variant')
    .argument('<feature>', 'Feature')
    .option('--strategy <s>', 'Strategy (mặc định: default_strategy trong config)')
    .option('--param <k=v>', 'Tham số strategy (lặp lại được)', collectParam, {})
    .option('--as <name>', 'Tên variant (mặc định: tên strategy)')
    .option('--from <file>', 'File YAML cho strategy manual')
    .option('--overwrite', 'Ghi đè variant cùng tên (variant đang khóa luôn bị từ chối)')
    .option('--keep-done', 'Giữ nguyên các slice in_progress/done của active variant')
    .option('--created-by <who>', 'cli | agent | manual')
    .option('--profile <p>', 'Profile luật để in tóm tắt')
    .option('--json', 'Xuất JSON')
    .option('--dry-run', 'Không ghi file')
    .action(run(async (feature, options) => {
      const r = service.plan(process.cwd(), feature, {
        strategy: options.strategy,
        params: options.param,
        as: options.as,
        from: options.from,
        overwrite: options.overwrite,
        keepDone: options.keepDone,
        createdBy: options.createdBy,
        profile: options.profile,
        dryRun: options.dryRun,
      });
      if (options.json) return printJson({ variant: r.variant, evaluation: r.evaluation, metrics: r.metrics });
      console.log(chalk.cyan.bold(`\n✂️  Variant ${r.variant.variant} (${r.variant.provenance.strategy})\n`));
      printSlices(r.variant);
      console.log('');
      printEvaluation(r.evaluation);
      printMetrics(r.metrics);
      if (r.file) console.log(chalk.dim(`\n   → ${r.file}`));
      console.log('');
    }));

  slice
    .command('import-vsaf')
    .description('Nạp slice manifest chuẩn VSAF (.v-flow/slices/SLICE-*.md) thành một variant — audit G1–G5 rồi luật R1–R11')
    .argument('<feature>', 'Feature')
    .option('--slices <dir>', 'Thư mục SLICE-*.md (mặc định .v-flow/slices)')
    .option('--wbs <file>', 'project_wbs.md (mặc định .v-flow/architecture/project_wbs.md)')
    .option('--task-map <file>', 'wbs-task-map.yaml (mặc định .v-flow/architecture/wbs-task-map.yaml)')
    .option('--as <name>', 'Tên variant (mặc định: vsaf)')
    .option('--check', 'Chỉ audit G1–G5 + in ánh xạ, không ghi file')
    .option('--force', 'Nạp dù audit VSAF có FAIL (chỉ dùng khi thử nghiệm)')
    .option('--overwrite', 'Ghi đè variant cùng tên')
    .option('--created-by <who>', 'cli | agent | manual | vsaf')
    .option('--profile <p>', 'Profile luật để in tóm tắt')
    .option('--json', 'Xuất JSON')
    .action(run(async (feature, options) => {
      const r = service.importVsaf(process.cwd(), feature, {
        slices: options.slices,
        wbs: options.wbs,
        taskMap: options.taskMap,
        as: options.as,
        check: options.check,
        force: options.force,
        overwrite: options.overwrite,
        createdBy: options.createdBy,
        profile: options.profile,
      });
      if (options.json) {
        return printJson({
          variant: r.variant, audit: r.audit, mapping: r.mapping,
          warnings: r.warnings, evaluation: r.evaluation, metrics: r.metrics,
        });
      }
      console.log(chalk.cyan.bold(`\n🧩 VSAF → V-Flow: ${r.manifests} manifest → variant ${r.variantName}\n`));

      console.log(chalk.white.bold('   Audit VSAF (G1–G7)'));
      for (const g of r.audit) {
        const mark = g.pass === true ? chalk.green('PASS') : g.pass === false ? chalk.red('FAIL') : chalk.yellow('người duyệt');
        console.log(`   ${mark}  ${g.id} ${g.name} — ${chalk.dim(g.note)}`);
      }

      console.log(chalk.white.bold('\n   Ánh xạ slice → task V-Flow'));
      for (const m of r.mapping) {
        console.log(`   ${m.id.padEnd(9)} ${m.wbsUnits.length} WBS unit · task: ${m.tasks.join(', ') || '—'} · luồng: ${m.flows.join(', ') || '—'}`);
      }
      for (const w of r.warnings) console.log(chalk.yellow(`   ⚠️  ${w}`));

      if (r.checkOnly) {
        console.log(chalk.dim('\n   --check: không ghi file.\n'));
        return;
      }
      console.log('');
      printEvaluation(r.evaluation);
      printMetrics(r.metrics);
      console.log(chalk.dim(`\n   → ${r.file}`));
      console.log(chalk.dim(`   → ${r.mapFile}`));
      console.log('');
    }));

  slice
    .command('sweep')
    .description('Sinh một variant cho mỗi giá trị tham số (vd --param max_points=4,6,8,10)')
    .argument('<feature>', 'Feature')
    .requiredOption('--strategy <s>', 'Strategy')
    .option('--param <k=v1,v2>', 'Tham số và danh sách giá trị (lặp lại được → tích Descartes)', collectParam, {})
    .option('--overwrite', 'Ghi đè variant đã có (mặc định: bỏ qua)')
    .option('--profile <p>', 'Profile luật để in tóm tắt')
    .option('--json', 'Xuất JSON')
    .option('--dry-run', 'Không ghi file')
    .action(run(async (feature, options) => {
      const r = service.sweep(process.cwd(), feature, {
        strategy: options.strategy, params: options.param, overwrite: options.overwrite, profile: options.profile, dryRun: options.dryRun,
      });
      if (options.json) return printJson(r.results);
      console.log(chalk.cyan.bold(`\n🔁 Sweep ${options.strategy}\n`));
      for (const x of r.results) {
        if (x.skipped) { console.log(chalk.dim(`   ${x.name}: đã có — bỏ qua (dùng --overwrite)`)); continue; }
        console.log(`   ${chalk.bold(x.name)}: ${x.evaluation.errorCount} lỗi, ${x.evaluation.warnCount} cảnh báo`);
        printMetrics(x.metrics);
      }
      console.log(chalk.dim(`\n   So sánh: v-flow slice compare ${feature}\n`));
    }));

  slice
    .command('check')
    .description('Chạy luật R1–R11 trên một variant, in vi phạm')
    .argument('<feature>', 'Feature')
    .option('--variant <v>', 'Variant (mặc định: active variant)')
    .option('--profile <p>', 'Profile luật (ghi đè active_profile)')
    .option('--json', 'Xuất JSON')
    .option('--dry-run', 'Không ghi file')
    .action(run(async (feature, options) => {
      const r = service.check(process.cwd(), feature, { variant: options.variant, profile: options.profile, dryRun: options.dryRun });
      if (options.json) return printJson({ variant: r.variant.variant, stale: r.stale, ...r.evaluation });
      console.log(chalk.cyan.bold(`\n🔎 Check ${r.variant.variant}${r.stale ? chalk.yellow(' ⚠️ stale') : ''}\n`));
      printEvaluation(r.evaluation, { limit: 200 });
      console.log('');
      if (!r.evaluation.pass) process.exitCode = 1;
    }));

  slice
    .command('compare')
    .description('Bảng metrics + diff giữa các variant, ghi slicing/compare.md (UC-02)')
    .argument('<feature>', 'Feature')
    .argument('[variants...]', 'Danh sách variant (mặc định: tất cả)')
    .option('--format <f>', 'md | json | csv', 'md')
    .option('--profile <p>', 'Profile luật (ghi đè active_profile)')
    .option('--json', 'Tương đương --format json')
    .option('--dry-run', 'Không ghi compare.md')
    .action(run(async (feature, variants, options) => {
      const format = options.json ? 'json' : options.format;
      if (!['md', 'json', 'csv'].includes(format)) throw new CliError('--format phải là md | json | csv');
      const r = service.compare(process.cwd(), feature, { names: variants, profile: options.profile, format, dryRun: options.dryRun });
      process.stdout.write(r.text);
      if (r.file && format === 'md') console.log(chalk.dim(`\n→ ${r.file}`));
    }));

  slice
    .command('show')
    .description('In các slice và đồ thị phụ thuộc (Mermaid)')
    .argument('<feature>', 'Feature')
    .option('--variant <v>', 'Variant (mặc định: active variant)')
    .option('--format <f>', 'md | mermaid', 'md')
    .option('--profile <p>', 'Profile luật')
    .option('--json', 'Xuất JSON')
    .option('--dry-run', 'Không ghi file')
    .action(run(async (feature, options) => {
      const r = service.show(process.cwd(), feature, { variant: options.variant, format: options.format, profile: options.profile, dryRun: options.dryRun });
      if (options.json) return printJson({ variant: r.variant, stale: r.stale, evaluation: r.evaluation, metrics: r.metrics });
      process.stdout.write(r.text);
    }));

  slice
    .command('use')
    .description('Đặt active variant, render slices.md (UC-03); --lock để khóa')
    .argument('<feature>', 'Feature')
    .argument('<variant>', 'Variant')
    .option('--lock', 'Khóa variant (ghi người duyệt + thời điểm)')
    .option('--by <name>', 'Người duyệt (mặc định: git user.name)')
    .option('--unlock', 'Mở khóa / cho phép đổi variant khi đã có slice chạy')
    .option('--reason <text>', 'Lý do mở khóa (bắt buộc với --unlock)')
    .option('--json', 'Xuất JSON')
    .option('--dry-run', 'Không ghi file')
    .action(run(async (feature, variant, options) => {
      const r = service.use(process.cwd(), feature, variant, {
        lock: options.lock, by: options.by, unlock: options.unlock, reason: options.reason, dryRun: options.dryRun,
      });
      if (options.json) return printJson({ slicing: r.slicing, evaluation: r.evaluation });
      console.log(chalk.cyan.bold(`\n📌 Active variant: ${variant}\n`));
      printEvaluation(r.evaluation);
      if (r.slicing.locked) printOk(`Đã khóa bởi ${r.slicing.locked_by} lúc ${r.slicing.locked_at} — ID slice không được đổi`);
      else printWarn('Chưa khóa — chạy lại với --lock khi người duyệt chốt');
      if (!options.dryRun) console.log(chalk.dim('   → slices.md, .flow-state.yaml (slicing/slices)'));
      console.log('');
    }));

  slice
    .command('impact')
    .description('Tính vùng ảnh hưởng theo slice khi spec đổi (UC-05); --simulate chỉ tính, không ghi')
    .argument('<feature>', 'Feature')
    .option('--since <hash>', 'So với graph cũ này (mặc định: graph_hash trong .flow-state.yaml)')
    .option('--simulate <change>', 'Giả lập thay đổi: UC-01:B2, UC-01-E1, REQ-E01, AC-03, T-004 (phân tách bằng dấu phẩy)')
    .option('--json', 'Xuất JSON')
    .option('--dry-run', 'Không ghi file')
    .action(run(async (feature, options) => {
      const r = service.impact(process.cwd(), feature, { since: options.since, simulate: options.simulate, dryRun: options.dryRun });
      if (options.json) return printJson(r);
      console.log(chalk.cyan.bold(`\n🌊 Impact${r.simulated ? ' (giả lập)' : ''} — ${feature}\n`));
      if (r.unchanged) {
        printOk(`Graph không đổi so với ${r.since}`);
        console.log('');
        return;
      }
      console.log(`   Thay đổi: ${r.summary}`);
      console.log(chalk.dim(`   Luồng: ${r.result.flows.join(', ') || '—'} · AC: ${r.result.acs.join(', ') || '—'} · task: ${r.result.units.join(', ') || '—'}`));
      console.log(`   ${chalk.red('needs_recheck')}:    ${r.result.recheck.join(', ') || '—'}`);
      console.log(`   ${chalk.yellow('needs_regression')}: ${r.result.regression.join(', ') || '—'}`);
      if (r.result.unassigned.length > 0) {
        printError(`Task chưa thuộc slice nào (R1): ${r.result.unassigned.join(', ')} — gán tay vào variant hoặc: v-flow slice plan ${feature} --keep-done`);
      }
      if (!r.simulated && !options.dryRun) console.log(chalk.dim('   → .flow-state.yaml (slices[].needs_recheck / needs_regression)'));
      console.log('');
    }));

  slice
    .command('mark')
    .description('Cập nhật tiến độ một slice (UC-04): start | submit | review | demo | recheck')
    .argument('<feature>', 'Feature')
    .argument('<slice>', 'ID slice, vd SLICE-1')
    .argument('<action>', 'start | submit | review | demo | recheck')
    .option('--verdict <v>', 'Với review: APPROVED | APPROVED_WITH_NOTES | CHANGES_REQUESTED | REJECTED')
    .option('--approve', 'Với demo: duyệt demo')
    .option('--reject', 'Với demo: từ chối demo (cần --reason)')
    .option('--reason <text>', 'Lý do từ chối demo')
    .option('--json', 'Xuất JSON')
    .option('--dry-run', 'Không ghi file')
    .action(run(async (feature, sliceId, action, options) => {
      const r = service.mark(process.cwd(), feature, sliceId, action, {
        verdict: options.verdict, approve: options.approve, reject: options.reject, reason: options.reason, dryRun: options.dryRun,
      });
      if (options.json) return printJson({ message: r.message, unlocked: r.unlocked, slices: r.entries });
      printOk(r.message);
      if (r.unlocked.length > 0) console.log(chalk.cyan(`   ▶ Slice đã mở: ${r.unlocked.join(', ')}`));
    }));

  slice
    .command('bench')
    .description('Chạy nhiều strategy trên nhiều feature, in metrics tổng hợp (UC-06)')
    .option('--features <list>', 'Danh sách feature, phân tách bằng dấu phẩy (mặc định: mọi feature)')
    .option('--fixtures <dir>', 'Thư mục chứa các feature fixture')
    .option('--strategies <list>', 'Danh sách strategy (mặc định: mọi strategy trừ manual)')
    .option('--profile <p>', 'Profile luật')
    .option('--json', 'Xuất JSON')
    .action(run(async (options) => {
      const r = service.bench(process.cwd(), {
        features: csv(options.features), fixtures: options.fixtures, strategies: csv(options.strategies), profile: options.profile,
      });
      if (options.json) return printJson(r.result);
      process.stdout.write(r.text);
    }));
};
