/**
 * Markdown / CSV / Mermaid renderers for slice planning.
 */
const { slicePoints } = require('./helpers');
const { acsOfSlice, testsOfSlice } = require('./derive');

const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const list = (xs) => ((xs || []).length ? xs.join(', ') : '—');

function mermaid(variant) {
  const lines = ['```mermaid', 'graph LR'];
  for (const s of variant.slices || []) {
    const node = s.id.replace('-', '_');
    lines.push(`  ${node}["${s.id}: ${String(s.name || '').replace(/"/g, "'")}"]`);
    for (const d of s.depends_on || []) lines.push(`  ${d.replace('-', '_')} --> ${node}`);
  }
  lines.push('```');
  return lines.join('\n');
}

function slicesTable(graph, variant, entries = null) {
  const pts = slicePoints(graph, variant);
  const byId = new Map((entries || []).map((e) => [e.id, e]));
  const head = entries
    ? '| Slice | Tên | Luồng | Task | Điểm | Phụ thuộc | Loại | Trạng thái |\n|---|---|---|---|---:|---|---|---|'
    : '| Slice | Tên | Luồng | Task | Điểm | Phụ thuộc | Loại |\n|---|---|---|---|---:|---|---|';
  const rows = (variant.slices || []).map((s) => {
    const cols = [s.id, esc(s.name), list(s.flows), list(s.units), pts.get(s.id), list(s.depends_on), s.type];
    if (entries) cols.push((byId.get(s.id) || {}).status || 'pending');
    return `| ${cols.join(' | ')} |`;
  });
  return [head, ...rows].join('\n');
}

function sliceDetails(graph, variant) {
  return (variant.slices || []).map((s) => [
    `### ${s.id}: ${s.name}`,
    '',
    `- **Demo**: ${s.demo}`,
    `- **Luồng**: ${list(s.flows)}`,
    `- **Task**: ${list(s.units)}`,
    `- **AC (suy ra từ graph)**: ${list(acsOfSlice(graph, s).map((a) => a.id))}`,
    `- **TC (suy ra từ graph)**: ${list(testsOfSlice(graph, s).map((t) => t.id))}`,
    `- **Phụ thuộc**: ${list(s.depends_on)} · **Loại**: ${s.type}`,
  ].join('\n')).join('\n\n');
}

function deferredSection(variant) {
  if (!(variant.deferred || []).length) return '';
  return `\n## Deferred\n\n${variant.deferred.map((d) => `- ${d.flow}: ${d.reason || '(thiếu lý do)'}`).join('\n')}\n`;
}

/** slices.md — rendered from the active variant, for people. */
function renderSlicesMd(graph, variant, slicing = {}) {
  const p = variant.provenance || {};
  const lock = slicing.locked
    ? `🔒 Khóa bởi ${slicing.locked_by || '?'} lúc ${slicing.locked_at || '?'}`
    : '🔓 Chưa khóa';
  return `# Slice Plan — ${variant.variant}

> Sinh tự động từ \`slicing/variants/${variant.variant}.yaml\` bởi \`v-flow slice use\`. Không sửa tay —
> sửa variant rồi chạy lại \`v-flow slice use\`.

| Thông tin | Giá trị |
|---|---|
| Variant | ${variant.variant} |
| Strategy | ${p.strategy || '?'} |
| Tham số | ${esc(JSON.stringify(p.params || {}))} |
| Graph hash | ${p.graph_hash || '?'} |
| Spec version | ${p.spec_version || '?'} |
| Trạng thái | ${lock} |

## Các slice (theo thứ tự)

${slicesTable(graph, variant)}

## Đồ thị phụ thuộc

${mermaid(variant)}

## Chi tiết

${sliceDetails(graph, variant)}
${deferredSection(variant)}`;
}

function violationLines(evaluation) {
  if (evaluation.violations.length === 0) return '_Không có vi phạm._';
  return evaluation.violations.map((v) => `- **${v.severity.toUpperCase()}** \`${v.rule}\`${v.slice ? ` (${v.slice})` : ''}: ${v.message}`).join('\n');
}

/** `slice show --format md` */
function renderShowMd(graph, variant, evaluation, metrics, stale) {
  return `# Variant ${variant.variant}${stale ? ' ⚠️ stale' : ''}

${slicesTable(graph, variant)}

${mermaid(variant)}

## Chi tiết

${sliceDetails(graph, variant)}
${deferredSection(variant)}
## Luật (profile ${evaluation.profile}): ${evaluation.errorCount} lỗi, ${evaluation.warnCount} cảnh báo

${violationLines(evaluation)}

## Metrics

${metrics.map((m) => `- ${m.id}: ${m.display}`).join('\n')}
`;
}

function renderCompareMd(result) {
  const names = result.columns.map((c) => `${c.name}${c.stale ? ' ⚠️ stale' : ''}`);
  const out = [
    '# So sánh variant',
    '',
    `> Profile luật: \`${result.profile}\` · graph hash: \`${result.graph_hash}\`. **In đậm** = tốt nhất của dòng. Hệ thống không tự chọn variant.`,
    '',
    `| Metric | ${names.join(' | ')} |`,
    `|---|${result.columns.map(() => '---:').join('|')}|`,
    `| strategy | ${result.columns.map((c) => c.strategy).join(' | ')} |`,
  ];
  for (const r of result.rows) {
    const cells = r.values.map((v, i) => (r.best.includes(i) ? `**${v.display}**` : v.display));
    out.push(`| ${r.id}${r.better ? ` (${r.better === 'low' ? '↓' : '↑'})` : ''} | ${cells.join(' | ')} |`);
  }
  out.push(`| vi phạm error | ${result.columns.map((c) => c.errors).join(' | ')} |`);
  out.push(`| vi phạm warn | ${result.columns.map((c) => c.warns).join(' | ')} |`);
  if (result.ranking) {
    const rank = new Map(result.ranking.map((r) => [r.name, r]));
    out.push(`| xếp hạng (rank_weights) | ${result.columns.map((c) => `#${rank.get(c.name).rank} (${rank.get(c.name).score})`).join(' | ')} |`);
  }
  if (result.columns.length > 1) {
    out.push('', '## Diff vị trí (luồng / task nằm ở slice khác nhau)', '');
    if (result.diff.length === 0) {
      out.push('_Mọi luồng và task nằm ở cùng slice ID trong tất cả variant._');
    } else {
      out.push(`| Loại | ID | ${result.columns.map((c) => c.name).join(' | ')} |`);
      out.push(`|---|---|${result.columns.map(() => '---').join('|')}|`);
      for (const d of result.diff) out.push(`| ${d.kind} | ${d.id} | ${d.where.join(' | ')} |`);
    }
  }
  return `${out.join('\n')}\n`;
}

function renderCompareCsv(result) {
  const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [['metric', ...result.columns.map((c) => c.name)].map(q).join(',')];
  lines.push(['stale', ...result.columns.map((c) => c.stale)].map(q).join(','));
  for (const r of result.rows) lines.push([r.id, ...r.values.map((v) => v.value)].map(q).join(','));
  lines.push(['errors', ...result.columns.map((c) => c.errors)].map(q).join(','));
  lines.push(['warns', ...result.columns.map((c) => c.warns)].map(q).join(','));
  return `${lines.join('\n')}\n`;
}

function renderBenchMd(result, metrics) {
  const out = [
    `# Bench (profile ${result.profile})`,
    '',
    `| Strategy | runs | lỗi chạy | error TB | warn TB | ${metrics.map((m) => m.id).join(' | ')} |`,
    `|---|---:|---:|---:|---:|${metrics.map(() => '---:').join('|')}|`,
  ];
  for (const s of result.summary) {
    out.push(`| ${s.strategy} | ${s.runs} | ${s.failed} | ${s.errors ?? '—'} | ${s.warns ?? '—'} | ${s.metrics.map((m) => m.mean ?? '—').join(' | ')} |`);
  }
  const failed = result.runs.filter((r) => !r.ok);
  if (failed.length > 0) {
    out.push('', '## Lỗi', '', ...failed.map((r) => `- ${r.feature} × ${r.strategy}: ${r.error}`));
  }
  return `${out.join('\n')}\n`;
}

module.exports = {
  mermaid,
  slicesTable,
  renderSlicesMd,
  renderShowMd,
  renderCompareMd,
  renderCompareCsv,
  renderBenchMd,
};
