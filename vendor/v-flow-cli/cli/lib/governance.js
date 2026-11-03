/**
 * Governance — risk-tier gate + approval metadata (lightweight schema check).
 *
 * Declared in a feature's .flow-state.yaml:
 *   risk_tier: low | medium | high | critical
 *   approvals:
 *     - role: spec            # which gate this approval covers
 *       actor: "Nguyen Van A"
 *       decision: approved
 *       timestamp: "2026-06-06T10:00:00Z"
 *
 * GATE_MATRIX maps each tier → the approval roles it requires. checkGovernance
 * returns warnings (surfaced by `v-flow validate`; `--strict` blocks CI). This is
 * intentionally lightweight — it checks the PRESENCE + structural validity of
 * approvals (actor/timestamp), NOT whether an approval was semantically warranted.
 */

const TIERS = ['low', 'medium', 'high', 'critical'];

// Required approval roles per risk tier (escalating). Tune per organisation.
const GATE_MATRIX = {
  low: [],
  medium: ['spec'],
  high: ['spec', 'security'],
  critical: ['spec', 'security', 'tech_lead'],
};

/**
 * @param {object} state - normalized flow state ({ riskTier, approvals })
 * @returns {{ tier: string|null, issues: string[], warnings: string[], ok: string[] }}
 */
function checkGovernance(state) {
  const issues = [];
  const warnings = [];
  const ok = [];

  const tier = state && state.riskTier ? String(state.riskTier).toLowerCase() : null;

  if (!tier) {
    warnings.push('Chưa khai báo risk_tier trong .flow-state.yaml (low|medium|high|critical) — không xác định được gate bắt buộc');
    return { tier: null, issues, warnings, ok };
  }
  if (!TIERS.includes(tier)) {
    warnings.push(`risk_tier không hợp lệ: "${tier}" — dùng low|medium|high|critical`);
    return { tier, issues, warnings, ok };
  }

  const required = GATE_MATRIX[tier];
  const approvals = Array.isArray(state.approvals) ? state.approvals : [];

  // Structural validity — an approval without actor + timestamp is not auditable.
  for (const a of approvals) {
    const role = a.role || a.gate || '(không rõ role)';
    if (!a.actor || !a.timestamp) {
      warnings.push(`Approval "${role}" thiếu actor/timestamp — không audit được`);
    }
  }

  // Each required gate must have an "approved" approval entry.
  const approvedRoles = new Set(
    approvals
      .filter((a) => !a.decision || String(a.decision).toLowerCase() === 'approved')
      .map((a) => a.role || a.gate)
  );
  for (const role of required) {
    if (!approvedRoles.has(role)) {
      warnings.push(`Tier "${tier}" yêu cầu approval "${role}" — chưa có (cần actor + timestamp)`);
    }
  }

  if (warnings.length === 0) {
    ok.push(`Governance: tier "${tier}" đủ approval bắt buộc (${required.join(', ') || 'không yêu cầu'})`);
  }

  return { tier, issues, warnings, ok };
}

module.exports = { TIERS, GATE_MATRIX, checkGovernance };
