/**
 * YAML Parser — Shared .flow-state.yaml parsing for V-Flow CLI
 *
 * Replaces fragile regex-based parsing with proper YAML library.
 * Used by: status.js, doctor.js, feature.js
 */

const fs = require('fs-extra');
const path = require('path');

// Use js-yaml if available, otherwise fallback to regex-based parsing
let yaml;
try {
  yaml = require('js-yaml');
} catch {
  yaml = null;
}

/**
 * Parse .flow-state.yaml content into a structured object.
 *
 * @param {string} content - Raw YAML content
 * @returns {object} Parsed flow state
 */
function parseFlowState(content) {
  // Use js-yaml if available
  if (yaml) {
    try {
      const raw = yaml.load(content);
      return normalizeFlowState(raw || {});
    } catch {
      // Fallback to regex if YAML parsing fails
      return parseFlowStateRegex(content);
    }
  }
  return parseFlowStateRegex(content);
}

/**
 * Normalize raw YAML object into the expected flow state shape.
 * Ensures consistent field names and defaults.
 */
function normalizeFlowState(raw) {
  return {
    featureName: raw.feature_name || null,
    featureId: raw.feature_id || null,
    currentPhase: raw.current_phase || null,
    phaseStatus: raw.phase_status || null,
    projectType: raw.project_type || null,
    createdAt: raw.created_at || null,
    lastUpdated: raw.last_updated || null,
    specVersion: raw.spec_version_latest || null,
    blocked: raw.blocked === true,
    blockedReason: raw.blocked_reason || null,
    awaitingCheckpoint: raw.awaiting_checkpoint || null,

    // Governance — risk tier + structured approvals (actor/timestamp/decision)
    riskTier: raw.risk_tier || null,
    approvals: Array.isArray(raw.approvals) ? raw.approvals : [],

    // Artifacts
    artifacts: normalizeArtifacts(raw.artifacts || {}),

    // Routing
    routeDecision: raw.routing?.after_master_check?.route_decision || null,

    // Concerns
    concernsCount: Array.isArray(raw.active_concerns) ? raw.active_concerns.length : 0,

    // Phase history
    phaseHistory: raw.phase_history || [],

    // Slice planning (B.0c) — active variant + per-slice progress
    slicing: raw.slicing || null,
    slices: Array.isArray(raw.slices) ? raw.slices : [],
  };
}

/**
 * Normalize artifacts section from YAML
 */
function normalizeArtifacts(artifacts) {
  const result = {};
  const defaults = {
    exists: false,
    version: null,
    status: null,
    verdict: null,
    total: 0,
    completed: 0,
    human_approved: false,
    synced_to_spec: null,
    concerns_count: 0,
  };

  const artifactNames = ['spec', 'plan', 'tasks', 'test_cases', 'validation_report', 'code_review'];
  for (const name of artifactNames) {
    const src = artifacts[name] || {};
    result[name] = {
      exists: src.exists === true,
      version: src.version || defaults.version,
      status: src.status || defaults.status,
      verdict: src.verdict || defaults.verdict,
      total: typeof src.total === 'number' ? src.total : defaults.total,
      completed: typeof src.completed === 'number' ? src.completed : defaults.completed,
      human_approved: src.human_approved === true,
      synced_to_spec: src.synced_to_spec || defaults.synced_to_spec,
      concerns_count: typeof src.concerns_count === 'number' ? src.concerns_count : defaults.concerns_count,
    };
  }

  return result;
}

/**
 * Fallback regex-based parser (for environments without js-yaml).
 * Preserves backward compatibility with the original status.js logic.
 */
function parseFlowStateRegex(content) {
  const state = {};

  const getField = (key) => {
    const match = content.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?`, 'm'));
    return match ? match[1].trim() : null;
  };

  state.featureName = getField('feature_name');
  state.featureId = getField('feature_id');
  state.currentPhase = getField('current_phase');
  state.phaseStatus = getField('phase_status');
  state.projectType = getField('project_type');
  state.createdAt = getField('created_at');
  state.lastUpdated = getField('last_updated');
  state.specVersion = getField('spec_version_latest');
  state.blocked = getField('blocked') === 'true';
  state.blockedReason = getField('blocked_reason');
  state.awaitingCheckpoint = getField('awaiting_checkpoint');
  state.riskTier = getField('risk_tier');
  state.approvals = []; // structured list — only the js-yaml path parses it fully

  // Parse artifact statuses
  state.artifacts = {};
  const artifactNames = ['spec', 'plan', 'tasks', 'test_cases', 'validation_report', 'code_review'];
  for (const name of artifactNames) {
    const existsMatch = content.match(new RegExp(`${name}:[\\s\\S]*?exists:\\s*(true|false)`, 'm'));
    state.artifacts[name] = {
      exists: existsMatch ? existsMatch[1] === 'true' : false,
    };

    if (name === 'spec') {
      const versionMatch = content.match(/spec:[\s\S]*?version:\s*"?([^"\n]*)"?/m);
      const statusMatch = content.match(/spec:[\s\S]*?status:\s*"?([^"\n]*)"?/m);
      state.artifacts.spec.version = versionMatch ? versionMatch[1] : null;
      state.artifacts.spec.status = statusMatch ? statusMatch[1] : null;
    }

    if (name === 'validation_report') {
      const verdictMatch = content.match(/validation_report:[\s\S]*?verdict:\s*"?([^"\n]*)"?/m);
      state.artifacts.validation_report.verdict = verdictMatch ? verdictMatch[1] : null;
    }

    if (name === 'tasks') {
      const totalMatch = content.match(/tasks:[\s\S]*?total:\s*(\d+)/m);
      const completedMatch = content.match(/tasks:[\s\S]*?completed:\s*(\d+)/m);
      state.artifacts.tasks.total = totalMatch ? parseInt(totalMatch[1]) : 0;
      state.artifacts.tasks.completed = completedMatch ? parseInt(completedMatch[1]) : 0;
    }
  }

  // Parse routing
  const routeDecision = content.match(/route_decision:\s*"?([^"\n]*)"?/m);
  state.routeDecision = routeDecision ? routeDecision[1] : null;

  // Parse concerns count
  const concernsCount = content.match(/concerns_count:\s*(\d+)/m);
  state.concernsCount = concernsCount ? parseInt(concernsCount[1]) : 0;

  state.phaseHistory = [];

  return state;
}

/**
 * Read and parse .flow-state.yaml from a feature directory.
 *
 * @param {string} featureDir - Absolute path to feature directory
 * @returns {object|null} Parsed flow state, or null if file doesn't exist
 */
async function readFlowState(featureDir) {
  const flowStatePath = path.join(featureDir, '.flow-state.yaml');
  if (!fs.existsSync(flowStatePath)) return null;

  try {
    const content = await fs.readFile(flowStatePath, 'utf8');
    return parseFlowState(content);
  } catch {
    return null;
  }
}

module.exports = {
  parseFlowState,
  normalizeFlowState,
  normalizeArtifacts,
  parseFlowStateRegex,
  readFlowState,
};
