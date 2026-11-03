/**
 * Activity Log — Persistent, file-based audit of V-Flow usage.
 *
 * Records two surfaces into <projectRoot>/.v-flow/logs/:
 *   • CLI runs    — every `v-flow <cmd>` invocation (args, exit code, duration,
 *                   full console transcript). Captured automatically from
 *                   cli/index.js via install().
 *   • Agent steps — structured events appended by the `v-flow log` command,
 *                   which the agentic workflow (AGENTS.md) calls at phase
 *                   boundaries.
 *
 * Output files:
 *   activity.jsonl  — one JSON object per line (machine-readable / grep / jq).
 *   activity.log    — human-readable mirror.
 *
 * Design notes:
 *   • Best-effort — every failure is swallowed; logging must NEVER break the CLI.
 *   • Synchronous appends — survive process.exit()/crashes without an async flush.
 *   • Disabled via VFLOW_NO_LOG=1. Custom path via VFLOW_LOG_DIR / VFLOW_LOG_FILE.
 *   • Never auto-creates .v-flow/ (that would corrupt isInitialized()); only logs
 *     into the project when .v-flow/ already exists (or an explicit override set).
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// eslint-disable-next-line no-control-regex
const ANSI = /\x1b\[[0-9;]*m/g;
const stripAnsi = (s) => String(s).replace(ANSI, '');

let _installed = false;
let _finalized = false;
const _disabled = process.env.VFLOW_NO_LOG === '1';
let _startTime = null;
let _command = null; // { name, invocation }
const _transcript = []; // buffered console output lines

// Commands that write their own log entries — skip the auto CLI command record
// (avoids double-logging and, for `watch`, a huge buffered transcript).
const SELF_LOGGING = new Set(['log', 'watch']);

function nowIso() {
  return new Date().toISOString();
}

function safeVersion() {
  try {
    return require('../../package.json').version;
  } catch (_) {
    return null;
  }
}

/**
 * Resolve the log directory.
 * Priority: VFLOW_LOG_DIR > dir(VFLOW_LOG_FILE) > <cwd>/.v-flow/logs (only if
 * .v-flow already exists). Returns null when logging should be skipped.
 */
function resolveLogDir() {
  if (process.env.VFLOW_LOG_DIR) return process.env.VFLOW_LOG_DIR;
  if (process.env.VFLOW_LOG_FILE) return path.dirname(process.env.VFLOW_LOG_FILE);
  const vflow = path.join(process.cwd(), '.v-flow');
  if (fs.existsSync(vflow)) return path.join(vflow, 'logs');
  return null;
}

function jsonlPath(dir) {
  if (process.env.VFLOW_LOG_FILE) return process.env.VFLOW_LOG_FILE;
  return path.join(dir, 'activity.jsonl');
}

function logPath(dir) {
  if (process.env.VFLOW_LOG_FILE) {
    return process.env.VFLOW_LOG_FILE.replace(/\.jsonl?$/i, '') + '.log';
  }
  return path.join(dir, 'activity.log');
}

/**
 * Append one structured entry to activity.jsonl, plus an optional human-readable
 * line to activity.log. Safe to call anytime — no-op if disabled or no dir.
 * `ts` is added automatically.
 *
 * @param {object} entry        Fields to record (without ts).
 * @param {string} [humanLine]  Suffix for the .log mirror (ts is prepended).
 */
function event(entry, humanLine) {
  if (_disabled) return;
  try {
    const dir = resolveLogDir();
    if (!dir) return;
    fs.mkdirSync(dir, { recursive: true });
    const record = { ts: nowIso(), ...entry };
    fs.appendFileSync(jsonlPath(dir), `${JSON.stringify(record)}\n`);
    if (humanLine) {
      fs.appendFileSync(logPath(dir), `${record.ts}  ${humanLine}\n`);
    }
  } catch (_) {
    /* logging must never break the CLI */
  }
}

/**
 * Install console capture + the exit hook that persists the CLI command record.
 * Call once from cli/index.js. No-op if disabled.
 */
function install() {
  if (_installed || _disabled) return;
  _installed = true;
  _startTime = Date.now();

  const orig = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  };
  const tee = (fn) => (...args) => {
    try {
      _transcript.push(stripAnsi(util.format(...args)));
    } catch (_) {
      /* ignore formatting errors */
    }
    fn(...args);
  };
  console.log = tee(orig.log);
  console.info = tee(orig.info);
  console.warn = tee(orig.warn);
  console.error = tee(orig.error);
  console.debug = tee(orig.debug);

  process.on('exit', (code) => finalize(code));
}

/**
 * Record which command is running. Called from index.js preAction hook.
 */
function setCommand(name, invocation) {
  _command = { name, invocation: invocation || [] };
}

/**
 * Persist the CLI command record (jsonl + transcript). Idempotent; runs on exit.
 */
function finalize(exitCode) {
  if (_finalized || _disabled) return;
  _finalized = true;
  // Only persist when a real subcommand ran. Skip help/version/no-op and any
  // self-logging command (avoids double/circular logging).
  if (!_command || SELF_LOGGING.has(_command.name)) return;
  try {
    const dir = resolveLogDir();
    if (!dir) return;
    fs.mkdirSync(dir, { recursive: true });
    const durationMs = _startTime ? Date.now() - _startTime : null;
    const code = typeof exitCode === 'number' ? exitCode : process.exitCode || 0;
    const record = {
      ts: nowIso(),
      type: 'cli',
      cmd: _command.name,
      invocation: _command.invocation,
      exitCode: code,
      durationMs,
      cwd: process.cwd(),
      version: safeVersion(),
    };
    fs.appendFileSync(jsonlPath(dir), `${JSON.stringify(record)}\n`);
    const label = `v-flow ${record.invocation.join(' ')}`.trim();
    const header = `\n── ${record.ts}  ${label}  (exit ${code}, ${durationMs}ms) ──\n`;
    const body = _transcript.length ? `${_transcript.join('\n')}\n` : '';
    fs.appendFileSync(logPath(dir), `${header}${body}`);
  } catch (_) {
    /* never break the CLI */
  }
}

/**
 * Read the last N entries from activity.jsonl (best-effort). Used by `v-flow log --tail`.
 * @returns {object[]} parsed records (oldest → newest)
 */
function tail(n = 20) {
  try {
    const dir = resolveLogDir();
    if (!dir) return [];
    const file = jsonlPath(dir);
    if (!fs.existsSync(file)) return [];
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
    return lines.slice(-n).map((line) => {
      try {
        return JSON.parse(line);
      } catch (_) {
        return { raw: line };
      }
    });
  } catch (_) {
    return [];
  }
}

module.exports = {
  install,
  setCommand,
  finalize,
  event,
  tail,
  resolveLogDir,
};
