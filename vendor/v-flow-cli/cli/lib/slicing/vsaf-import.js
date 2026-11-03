/**
 * VSAF slice import — đọc slice manifest chuẩn VSAF (`SLICE-*.md` do `ntapp-slice-planning`
 * sinh) và dịch sang variant source của V-Flow.
 *
 * Vì sao cần dịch: hai engine nói hai thứ tiếng.
 *   - VSAF cắt theo **WBS unit** (OPS-01, BE-SUP-01, SCR-AUTH…) của toàn hệ thống as-built,
 *     và cho phép một luồng UC trải nhiều slice (cắt theo tầng kiến trúc).
 *   - V-Flow kiểm trên **task** (`T-xxx`) + **luồng UC** của một feature, và R2 đòi mỗi luồng
 *     thuộc đúng một slice.
 *
 * Nên module này: parse manifest → audit G1–G7 trên chính WBS unit → ánh xạ unit → task qua
 * `wbs-task-map.yaml` → gán task/luồng cho slice **sớm nhất** theo thứ tự topo của `blocked_by`.
 * G8 (Precedence) không tính ở đây: nó tương ứng R6 và do evaluator của V-Flow xác nhận trên
 * task graph — tính hai lần bằng hai nguồn dữ liệu khác nhau thì sớm muộn lệch nhau.
 *
 * Mọi hàm ở đây là hàm thuần trên nội dung file; I/O nằm ở service.js.
 */
const yaml = require('js-yaml');

const UNIT_PREFIXES = /^(OPS-\d+|BE-[A-Z]+-\d+|INT-[A-Z]+-\d+|SCR-[A-Z0-9-]+|WGT-[A-Z0-9-]+)$/;

/** Số thứ tự trong `SLICE-12` → 12. Không khớp → vô cực để nó xuống cuối, không throw. */
function sliceNum(id) {
  const m = /(\d+)\s*$/.exec(String(id || ''));
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

function unquote(v) {
  const s = String(v).trim();
  if (s.length >= 2 && s[0] === s[s.length - 1] && (s[0] === '"' || s[0] === "'")) return s.slice(1, -1);
  return s;
}

function parseInlineList(v) {
  let s = String(v).trim();
  if (s.startsWith('[') && s.endsWith(']')) s = s.slice(1, -1);
  return s.split(',').map((x) => unquote(x)).filter(Boolean);
}

/**
 * Parse front-matter của một `SLICE-*.md`.
 *
 * Cố ý KHÔNG dùng js-yaml cho khối này: front-matter VSAF chứa chuỗi tiếng Việt không quote
 * (`demoable`, `seam_rationale`) có dấu `:` ở giữa câu — YAML loader sẽ throw hoặc, tệ hơn,
 * đọc được một nửa. Hình dạng của template thì cố định, nên parse theo dòng là đủ và không bao
 * giờ nổ giữa một lượt import.
 */
function parseManifest(text, fileName = '<manifest>') {
  if (!/^---\r?\n/.test(text)) throw new Error(`${fileName}: thiếu front-matter`);
  const end = text.indexOf('\n---', 3);
  if (end === -1) throw new Error(`${fileName}: front-matter không đóng`);
  const fm = text.slice(text.indexOf('\n') + 1, end);
  const body = text.slice(end + 4);

  const out = { file: fileName, units: [], blocked_by: [], enhanced_by: [], hub_extends: [], parent_epics: [] };
  let inUnits = false;
  for (const raw of fm.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (inUnits && /^\s*-\s/.test(line)) {
      const m = /\{\s*(.*?)\s*\}/.exec(line);
      if (!m) continue;
      const entry = {};
      for (const part of m[1].split(',')) {
        const i = part.indexOf(':');
        if (i === -1) continue;
        entry[part.slice(0, i).trim()] = unquote(part.slice(i + 1));
      }
      if (entry.id) out.units.push(entry);
      continue;
    }
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    inUnits = key === 'units';
    if (inUnits) continue;
    if (['blocked_by', 'enhanced_by', 'hub_extends', 'parent_epics'].includes(key)) out[key] = parseInlineList(val);
    else out[key] = unquote(val);
  }
  if (!out.slice_id) throw new Error(`${fileName}: thiếu slice_id`);

  const what = /##\s*What to build\s*\r?\n([\s\S]*?)(?:\r?\n##|$)/.exec(body);
  out.what = what ? what[1].trim() : '';
  return out;
}

/** Tập WBS unit hợp lệ, đọc từ cột đầu của Work Unit Catalog trong `project_wbs.md`. */
function parseWbsUnits(text) {
  const ids = new Set();
  const re = /^\|\s*\**([A-Z][A-Z0-9-]*)\**\s*\|/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (UNIT_PREFIXES.test(m[1])) ids.add(m[1]);
  }
  return ids;
}

/** `wbs-task-map.yaml` → Map(unitId → [taskId]). Thiếu `units:` → map rỗng, không throw. */
function parseTaskMap(text) {
  let doc;
  try {
    doc = yaml.load(text) || {};
  } catch (err) {
    throw new Error(`wbs-task-map.yaml không hợp lệ: ${err.message}`);
  }
  const map = new Map();
  for (const [unit, tasks] of Object.entries(doc.units || {})) {
    map.set(unit, Array.isArray(tasks) ? tasks.map(String) : [String(tasks)]);
  }
  return map;
}

/** Thứ tự topo theo `blocked_by`; có chu trình thì phần còn lại nối vào cuối (G3 sẽ bắt). */
function topoOrder(slices) {
  const byId = new Map(slices.map((s) => [s.slice_id, s]));
  const done = new Set();
  const order = [];
  let pending = [...slices].sort((a, b) => sliceNum(a.slice_id) - sliceNum(b.slice_id));
  while (pending.length > 0) {
    const ready = pending.filter((s) => (s.blocked_by || []).filter((d) => byId.has(d)).every((d) => done.has(d)));
    if (ready.length === 0) return [...order, ...pending];
    for (const s of ready) {
      order.push(s);
      done.add(s.slice_id);
    }
    pending = pending.filter((s) => !done.has(s.slice_id));
  }
  return order;
}

/**
 * Audit G1–G7 trên slice manifest. Trả về danh sách { id, name, pass, note }.
 * G8 cố ý không có ở đây — xem ghi chú đầu file.
 */
function auditInvariants(slices, wbsUnits = new Set()) {
  const rows = [];
  const byId = new Map(slices.map((s) => [s.slice_id, s]));

  // G1 Coverage
  const seen = new Map();
  for (const s of slices) {
    for (const u of s.units) {
      if (!seen.has(u.id)) seen.set(u.id, []);
      seen.get(u.id).push(s.slice_id);
    }
  }
  const dup = [...seen.entries()].filter(([, l]) => l.length > 1).map(([u, l]) => `${u} ∈ {${l.join(', ')}}`);
  const orphan = wbsUnits.size > 0 ? [...wbsUnits].filter((u) => !seen.has(u)).sort() : [];
  const unknown = wbsUnits.size > 0 ? [...seen.keys()].filter((u) => !wbsUnits.has(u)).sort() : [];
  rows.push({
    id: 'G1',
    name: 'Coverage',
    pass: dup.length === 0 && orphan.length === 0 && unknown.length === 0,
    note: [
      dup.length ? `unit ở nhiều slice: ${dup.join('; ')}` : '',
      orphan.length ? `unit chưa thuộc slice nào: ${orphan.join(', ')}` : '',
      unknown.length ? `unit không có trong WBS: ${unknown.join(', ')}` : '',
    ].filter(Boolean).join(' · ') || `${seen.size}/${wbsUnits.size || seen.size} unit thuộc đúng một slice`,
  });

  // G2 Demoability
  const noDemo = slices.filter((s) => !String(s.demoable || '').trim()).map((s) => s.slice_id);
  rows.push({
    id: 'G2',
    name: 'Demoability',
    pass: noDemo.length === 0,
    note: noDemo.length ? `thiếu demoable: ${noDemo.join(', ')}` : `${slices.length}/${slices.length} slice có câu demo`,
  });

  // G3 DAG
  const badRef = [];
  const edges = new Map();
  for (const s of slices) {
    for (const r of [...(s.blocked_by || []), ...(s.enhanced_by || []), ...(s.hub_extends || [])]) {
      if (!byId.has(r)) badRef.push(`${s.slice_id} → ${r}`);
    }
    edges.set(s.slice_id, (s.blocked_by || []).filter((d) => byId.has(d)));
  }
  const cycles = [];
  const state = new Map();
  const visit = (n, stack) => {
    if (state.get(n) === 'done') return;
    const at = stack.indexOf(n);
    if (at !== -1) {
      cycles.push([...stack.slice(at), n].join(' → '));
      return;
    }
    for (const m of edges.get(n) || []) visit(m, [...stack, n]);
    state.set(n, 'done');
  };
  for (const n of edges.keys()) visit(n, []);
  rows.push({
    id: 'G3',
    name: 'DAG',
    pass: badRef.length === 0 && cycles.length === 0,
    note: [
      badRef.length ? `ref hỏng: ${badRef.join(', ')}` : '',
      cycles.length ? `chu trình: ${cycles.join(' | ')}` : '',
    ].filter(Boolean).join(' · ') || 'mọi ref hợp lệ, không có chu trình',
  });

  // G4 Type marked
  const badType = slices.filter((s) => !['AFK', 'HITL'].includes(s.type)).map((s) => s.slice_id);
  const hitlNoReason = slices
    .filter((s) => s.type === 'HITL' && !/seam/i.test(s.seam_rationale || ''))
    .map((s) => s.slice_id);
  const afk = slices.filter((s) => s.type === 'AFK').length;
  rows.push({
    id: 'G4',
    name: 'Type marked',
    pass: badType.length === 0 && hitlNoReason.length === 0,
    note: [
      badType.length ? `type không phải AFK/HITL: ${badType.join(', ')}` : '',
      hitlNoReason.length ? `HITL không nêu seam trong seam_rationale: ${hitlNoReason.join(', ')}` : '',
    ].filter(Boolean).join(' · ') || `${afk} AFK / ${slices.length - afk} HITL, mọi HITL có lý do seam`,
  });

  // G5 Story-mappable — chỉ unit sinh story (backend / frontend) mới cần `story:`.
  // `integration` là hợp đồng và `infrastructure` là hạ tầng: rule Stage 4c không sinh story cho
  // chúng (story là per `feature_id` / `screen_id`), nên đòi story ở đây là đòi một thứ không có.
  const STORY_BEARING = new Set(['backend', 'frontend']);
  const noStory = [];
  for (const s of slices) {
    for (const u of s.units) {
      if (STORY_BEARING.has(u.type) && !u.story) noStory.push(`${s.slice_id}:${u.id}`);
    }
  }
  const borne = slices.reduce((n, s) => n + s.units.filter((u) => STORY_BEARING.has(u.type)).length, 0);
  rows.push({
    id: 'G5',
    name: 'Story-mappable',
    pass: noStory.length === 0,
    note: noStory.length
      ? `unit thiếu story ref: ${noStory.join(', ')}`
      : `${borne} unit backend/frontend đều có planned story ref`,
  });

  // G6 / G7 — phán đoán ngữ nghĩa (unit nào là external, seam nào bị cắt qua) không suy được từ
  // manifest. Báo cáo là "cần người xác nhận" thay vì in PASS cho một thứ chưa kiểm.
  const hitl = slices.filter((s) => s.type === 'HITL').map((s) => s.slice_id);
  rows.push({
    id: 'G6',
    name: 'AFK/HITL purity',
    pass: null,
    note: `người duyệt xác nhận: mọi unit buộc-HITL nằm trong ${hitl.length} slice HITL (${hitl.join(', ') || '—'}), không unit external nào bị bó với unit in-house vốn demo được mà không cần nó`,
  });
  const multiLayer = slices.filter((s) => new Set(s.units.map((u) => u.type)).size >= 3).map((s) => s.slice_id);
  rows.push({
    id: 'G7',
    name: 'Thinness',
    pass: null,
    note: `người duyệt xác nhận seam: slice cắt ≥3 loại tầng = ${multiLayer.join(', ') || '—'} (tracer bullet đầu được phép; slice khác thì xem lại seam)`,
  });

  return rows;
}

/**
 * Dịch slice manifest → `{ slices, deferred, provenance }` cho strategy `manual`.
 *
 * Task và luồng được gán cho slice **sớm nhất** chạm tới chúng (thứ tự topo), nên R1/R2 của
 * V-Flow ("thuộc đúng một slice") giữ được dù VSAF cố ý trải một luồng qua nhiều lát.
 */
function toVariantSource(slices, taskMap, graph, meta = {}) {
  const taskFlows = new Map((graph.units || []).map((u) => [u.id, [...(u.flows || [])]]));
  const ordered = topoOrder(slices);
  const takenTask = new Map();
  const takenFlow = new Map();
  const warnings = [];
  const mapping = [];

  const out = ordered.map((s) => {
    const wbsUnits = s.units.map((u) => u.id);
    const tasks = [];
    const flows = [];
    for (const uid of wbsUnits) {
      for (const t of taskMap.get(uid) || []) {
        if (!taskFlows.has(t)) {
          warnings.push(`${s.slice_id}: task ${t} (map của ${uid}) không có trong task graph`);
          continue;
        }
        if (takenTask.has(t)) continue;
        takenTask.set(t, s.slice_id);
        tasks.push(t);
      }
    }
    for (const t of tasks) {
      for (const f of taskFlows.get(t) || []) {
        if (takenFlow.has(f)) continue;
        takenFlow.set(f, s.slice_id);
        flows.push(f);
      }
    }
    mapping.push({ id: s.slice_id, title: s.title || s.slice_id, type: s.type, wbsUnits, tasks, flows, file: s.file });
    return {
      id: s.slice_id,
      name: s.title || s.slice_id,
      flows,
      units: tasks,
      depends_on: [...(s.blocked_by || [])],
      demo: s.demoable || '',
      type: ['AFK', 'HITL'].includes(s.type) ? s.type : 'AFK',
    };
  });

  const unassigned = (graph.units || []).map((u) => u.id).filter((t) => !takenTask.has(t));
  if (unassigned.length > 0) {
    warnings.push(`task chưa thuộc slice nào (R1 sẽ FAIL): ${unassigned.join(', ')} — bổ sung vào wbs-task-map.yaml`);
  }

  return {
    slices: out,
    deferred: [],
    provenance: { source: 'vsaf-slice-planning', ...meta },
    mapping,
    warnings,
  };
}

/**
 * Bảng ánh xạ slice ↔ WBS unit ↔ task, ghi cạnh variant.
 *
 * Cần file riêng vì schema variant của V-Flow chỉ giữ `id/name/flows/units/depends_on/demo/type`
 * — mọi khóa lạ bị `normalizeVariantBody` loại. Không có file này thì sau khi import, biết được
 * "slice này gồm WBS unit nào" phải mở lại 24 file manifest.
 */
function renderVsafMap({ feature, variant, mapping, slicesDir, wbsPath, taskMapPath, now }) {
  const lines = [
    `# Ánh xạ VSAF ↔ V-Flow — variant \`${variant}\``,
    '',
    '> Sinh tự động bởi `v-flow slice import-vsaf`. Không sửa tay — sửa `SLICE-*.md` rồi import lại.',
    '',
    `| Nguồn | Giá trị |`,
    `|---|---|`,
    `| Feature | ${feature} |`,
    `| Slice manifest | \`${slicesDir}\` |`,
    `| WBS | \`${wbsPath}\` |`,
    `| Task map | \`${taskMapPath}\` |`,
    `| Sinh lúc | ${now} |`,
    '',
    '## Slice',
    '',
    '| Slice | Tên | Loại | WBS unit | Task V-Flow | Luồng |',
    '|---|---|---|---|---|---|',
  ];
  for (const m of mapping) {
    lines.push(`| ${m.id} | ${m.title} | ${m.type} | ${m.wbsUnits.join(', ') || '—'} | ${m.tasks.join(', ') || '—'} | ${m.flows.join(', ') || '—'} |`);
  }
  lines.push('');
  return lines.join('\n');
}

module.exports = {
  UNIT_PREFIXES,
  sliceNum,
  parseManifest,
  parseWbsUnits,
  parseTaskMap,
  topoOrder,
  auditInvariants,
  toVariantSource,
  renderVsafMap,
};
