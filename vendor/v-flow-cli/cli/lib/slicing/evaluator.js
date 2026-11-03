/**
 * Evaluator — runs every rule in rules/ with the severity of the chosen profile.
 * Default severity of a rule is `error`; a profile overrides it per rule ID (off | warn | error).
 */
const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname, 'rules');

const RULES = fs.readdirSync(RULES_DIR)
  .filter((f) => /^r\d+-.+\.js$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  .map((f) => require(path.join(RULES_DIR, f)));

const SEVERITIES = ['off', 'warn', 'error'];

function severityOf(ruleId, profile) {
  const sev = (profile || {})[ruleId];
  if (sev === undefined) return 'error';
  if (!SEVERITIES.includes(sev)) throw new Error(`Mức độ không hợp lệ cho ${ruleId}: "${sev}" (off | warn | error)`);
  return sev;
}

/**
 * @returns {{ profile: string, violations: Array, errorCount: number, warnCount: number, pass: boolean }}
 */
function evaluateVariant(graph, variant, config = {}, profileName = null) {
  const profile = profileName || config.active_profile || 'strict';
  const profiles = config.profiles || {};
  if (profileName && !profiles[profile]) {
    throw new Error(`Profile không tồn tại: ${profile} (có: ${Object.keys(profiles).join(', ')})`);
  }
  const violations = [];
  for (const rule of RULES) {
    const severity = severityOf(rule.id, profiles[profile]);
    if (severity === 'off') continue;
    for (const v of rule.check(graph, variant, config) || []) {
      violations.push({ rule: rule.id, severity, ...v });
    }
  }
  const errorCount = violations.filter((v) => v.severity === 'error').length;
  const warnCount = violations.filter((v) => v.severity === 'warn').length;
  return { profile, violations, errorCount, warnCount, pass: errorCount === 0 };
}

module.exports = { RULES, evaluateVariant, severityOf };
