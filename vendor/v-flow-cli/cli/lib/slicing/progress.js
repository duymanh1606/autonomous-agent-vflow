/**
 * Per-slice progress (UC-04) — pure functions over the `slices:` entries of .flow-state.yaml.
 *
 *   pending ──start──▶ in_progress ──submit──▶ review ──review APPROVED──▶ demo ──demo approve──▶ done
 *                          ▲                     │ CHANGES_REQUESTED          │ demo reject
 *                          └─────────────────────┘                            ▼
 *                                                                          blocked (→ spec change, UC-05)
 */

const APPROVED_VERDICTS = ['APPROVED', 'APPROVED_WITH_NOTES'];
const REJECTED_VERDICTS = ['CHANGES_REQUESTED', 'REJECTED'];
const ACTIONS = ['start', 'submit', 'review', 'demo', 'recheck'];

function newEntry(id) {
  return {
    id,
    status: 'pending',
    review_verdict: null,
    demo_approved: false,
    needs_recheck: false,
    needs_regression: false,
    recheck_reason: null,
    review_rounds: 0,
    recheck_count: 0,
  };
}

/** One entry per slice of the variant, in variant order; existing entries keep their progress. */
function syncEntries(variant, entries = []) {
  const byId = new Map((entries || []).map((e) => [e.id, e]));
  return (variant.slices || []).map((s) => ({ ...newEntry(s.id), ...(byId.get(s.id) || {}) }));
}

function readySlices(variant, entries) {
  const status = new Map(entries.map((e) => [e.id, e.status]));
  return (variant.slices || [])
    .filter((s) => status.get(s.id) === 'pending' && (s.depends_on || []).every((d) => status.get(d) === 'done'))
    .map((s) => s.id);
}

/**
 * Apply one action to one slice.
 * @returns {{ entries: Array, message: string, unlocked: string[] }}
 * @throws {Error} when the transition is not allowed
 */
function transition(variant, entries, sliceId, action, opts = {}) {
  if (!ACTIONS.includes(action)) throw new Error(`Hành động không hợp lệ: ${action} (${ACTIONS.join(' | ')})`);
  const slice = (variant.slices || []).find((s) => s.id === sliceId);
  if (!slice) throw new Error(`Variant không có ${sliceId}`);
  const next = syncEntries(variant, entries).map((e) => ({ ...e }));
  const e = next.find((x) => x.id === sliceId);
  const status = new Map(next.map((x) => [x.id, x.status]));
  const expect = (...allowed) => {
    if (!allowed.includes(e.status)) {
      throw new Error(`${sliceId} đang "${e.status}" — "${action}" chỉ dùng khi ${allowed.join(' / ')}`);
    }
  };
  let message = '';
  let unlocked = [];

  switch (action) {
    case 'start': {
      expect('pending', 'in_progress');
      const missing = (slice.depends_on || []).filter((d) => status.get(d) !== 'done');
      if (missing.length > 0) {
        throw new Error(`${sliceId} còn phụ thuộc chưa done: ${missing.join(', ')}`);
      }
      if (e.needs_recheck) {
        throw new Error(`${sliceId} đang needs_recheck (${e.recheck_reason || 'spec đổi'}) — chạy /v.check --slice ${sliceId} rồi \`mark ${sliceId} recheck\``);
      }
      e.status = 'in_progress';
      message = `${sliceId} → in_progress`;
      break;
    }
    case 'submit':
      expect('in_progress');
      e.status = 'review';
      message = `${sliceId} → review`;
      break;
    case 'review': {
      expect('review');
      const verdict = String(opts.verdict || '').toUpperCase();
      if (![...APPROVED_VERDICTS, ...REJECTED_VERDICTS].includes(verdict)) {
        throw new Error(`Cần --verdict: ${[...APPROVED_VERDICTS, ...REJECTED_VERDICTS].join(' | ')}`);
      }
      e.review_verdict = verdict;
      e.review_rounds = (e.review_rounds || 0) + 1;
      e.status = APPROVED_VERDICTS.includes(verdict) ? 'demo' : 'in_progress';
      message = `${sliceId} review ${verdict} → ${e.status}`;
      break;
    }
    case 'demo':
      expect('demo');
      if (opts.approve) {
        e.status = 'done';
        e.demo_approved = true;
        unlocked = readySlices(variant, next);
        message = `${sliceId} demo được duyệt → done`;
      } else if (opts.reject) {
        if (!opts.reason) throw new Error('Từ chối demo cần --reason');
        e.status = 'blocked';
        e.demo_approved = false;
        e.recheck_reason = `Demo bị từ chối: ${opts.reason}`;
        message = `${sliceId} demo bị từ chối → blocked. Đây là thay đổi spec: sửa spec → /v.sync → v-flow slice impact`;
      } else {
        throw new Error('demo cần --approve hoặc --reject --reason "…"');
      }
      break;
    case 'recheck':
      if (!e.needs_recheck && !e.needs_regression && e.status !== 'blocked') {
        throw new Error(`${sliceId} không có cờ recheck/regression`);
      }
      e.needs_recheck = false;
      e.needs_regression = false;
      e.recheck_reason = null;
      e.recheck_count = (e.recheck_count || 0) + 1;
      if (e.status === 'blocked') e.status = 'in_progress';
      message = `${sliceId} đã kiểm tra lại → cờ được xoá (${e.status})`;
      break;
    default:
      break;
  }
  return { entries: next, message, unlocked };
}

/** Mark slices from an impact result. Done slices that need recheck are reopened with the same ID. */
function applyImpact(variant, entries, impact, reason) {
  const recheck = new Set(impact.recheck);
  const regression = new Set(impact.regression);
  return syncEntries(variant, entries).map((e) => {
    const out = { ...e };
    if (recheck.has(e.id)) {
      out.needs_recheck = true;
      out.recheck_reason = reason;
      if (out.status === 'done') {
        out.status = 'in_progress';
        out.demo_approved = false;
      }
    }
    if (regression.has(e.id)) out.needs_regression = true;
    return out;
  });
}

module.exports = { ACTIONS, newEntry, syncEntries, readySlices, transition, applyImpact };
