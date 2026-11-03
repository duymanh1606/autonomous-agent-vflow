/**
 * Knowledge Oracle — the structural-knowledge CONTRACT for module-card scoring.
 *
 * Decision 4 (docs/module-card-scoring-decisions.md): the scorer depends on an
 * INTERFACE, not on GitNexus directly — so the provable tier never hard-locks a
 * vendor (keeps H3 portability). Implementations degrade HONESTLY: every method
 * returns `{ supported: boolean, ... }` so a missing capability is reported as
 * "unverified", never silently treated as a pass.
 *
 * Tiers:
 *   - NullOracle        → nothing supported   → scorecard mode "declared-only" (†)
 *   - LightweightOracle → symbolExists (file+text) + changedSince (git);
 *                         coverage/impact need a full graph → unsupported (*)
 *   - (future) full-graph adapter (GitNexus) → all supported
 *
 * Contract methods:
 *   symbolExists({file, line, name}) → { supported, exists, reason? }
 *   changedSince(file, sinceISO)     → { supported, changed, commits?, reason? }
 *   symbolsOf(module)                → { supported, symbols?, reason? }   (coverage)
 *   impact(symbol)                   → { supported, ... , reason? }       (Phase 3)
 */

const path = require('path');
const fs = require('fs-extra');
const { execFileSync } = require('child_process');

// Extensions of files we can hand straight to `node` (bypassing any shim).
const NODE_SCRIPT_EXT = new Set(['.js', '.cjs', '.mjs']);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ════════════════════════════════════════════════════════════
// NullOracle — declared-only mode
// ════════════════════════════════════════════════════════════

class NullOracle {
  get name() {
    return 'declared-only';
  }
  symbolExists() {
    return { supported: false, reason: 'no oracle' };
  }
  changedSince() {
    return { supported: false, reason: 'no oracle' };
  }
  symbolsOf() {
    return { supported: false, reason: 'no oracle' };
  }
  impact() {
    return { supported: false, reason: 'no oracle' };
  }
}

// ════════════════════════════════════════════════════════════
// LightweightOracle — symbol index (file+text) + git drift, no graph
// ════════════════════════════════════════════════════════════

class LightweightOracle {
  constructor(projectRoot) {
    this.root = projectRoot;
    this._cache = new Map();
  }
  get name() {
    return 'lightweight';
  }

  _read(absPath) {
    if (!this._cache.has(absPath)) {
      this._cache.set(absPath, fs.readFileSync(absPath, 'utf8'));
    }
    return this._cache.get(absPath);
  }

  /** Does `file` exist and (if given) contain symbol `name`? Repo-relative paths. */
  symbolExists({ file, line, name }) {
    if (!file) return { supported: true, exists: false, reason: 'empty ref' };
    const abs = path.join(this.root, file);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      return { supported: true, exists: false, reason: 'file not found' };
    }
    if (!name) return { supported: true, exists: true };
    const content = this._read(abs);
    const re = new RegExp(`\\b${escapeRegExp(name)}\\b`);
    if (re.test(content)) return { supported: true, exists: true };
    return { supported: true, exists: false, reason: `symbol "${name}" not in file` };
  }

  /** Has `file` changed since `sinceISO` (YYYY-MM-DD)? Pure git, no graph. */
  changedSince(file, sinceISO) {
    if (!sinceISO) return { supported: true, changed: null, reason: 'no last_verified date' };
    const abs = path.join(this.root, file);
    if (!fs.existsSync(abs)) return { supported: true, changed: null, reason: 'file not found' };
    try {
      const out = execFileSync(
        'git',
        ['log', `--since=${sinceISO}`, '--oneline', '--', file],
        { cwd: this.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();
      return { supported: true, changed: out.length > 0, commits: out ? out.split('\n').length : 0 };
    } catch {
      return { supported: false, reason: 'git unavailable' };
    }
  }

  /** Coverage needs full symbol enumeration → out of scope for the lightweight tier. */
  symbolsOf() {
    return { supported: false, reason: 'coverage cần full-graph oracle (GitNexus)' };
  }
  impact() {
    return { supported: false, reason: 'impact cần full-graph oracle (GitNexus)' };
  }
}

// ════════════════════════════════════════════════════════════
// GitNexusOracle — full-graph adapter (shells out to `npx gitnexus`)
// ════════════════════════════════════════════════════════════

/** Parse the first column of a gitnexus `cypher` markdown table → values[]. */
function parseCypherColumn(markdown) {
  if (!markdown) return [];
  const rows = markdown.split('\n').filter((l) => l.trim().startsWith('|'));
  // rows[0] = header, rows[1] = "| --- |" separator, rest = data
  return rows
    .slice(2)
    .map((l) => l.split('|').map((s) => s.trim()).filter((s) => s.length > 0)[0])
    .filter(Boolean);
}

/**
 * Map an execFileSync failure to a human reason instead of a silent null.
 * Pure (error → string) so it's unit-testable without spawning a process.
 */
function classifyRunnerError(err) {
  if (err.code === 'ENOENT') return 'không tìm thấy `gitnexus` lẫn `npx` trên PATH — cài GitNexus, hoặc đặt env VFLOW_GITNEXUS_BIN=/đường-dẫn/tới/gitnexus';
  if (err.code === 'ETIMEDOUT' || err.signal === 'SIGTERM') return 'gitnexus timeout (>120s) — index quá lớn hoặc treo';
  const stderr = (err.stderr || '').toString().trim();
  if (/no .*index|not indexed|chưa .*index|run .*analyze|gitnexus analyze/i.test(stderr)) {
    return 'repo chưa được index — chạy `npx gitnexus analyze`';
  }
  if (/multiple repos|nhiều repo|specify .*repo|--repo/i.test(stderr)) {
    return 'nhiều repo được index — truyền `--repo <tên>`';
  }
  if (stderr) return `gitnexus lỗi: ${stderr.split('\n')[0].slice(0, 160)}`;
  return `gitnexus thoát mã ${err.status != null ? err.status : '?'} (không có stderr)`;
}

/**
 * Resolve how to invoke gitnexus, in priority order:
 *   1. env VFLOW_GITNEXUS_BIN — explicit path/command the user points at (a `.js`
 *      entry is run via `node`; anything else is exec'd directly).
 *   2. `node <gitnexus-entry.js>` — the JS bin resolved from the install. This is
 *      shell-free and the ONLY thing that works on Windows, where `gitnexus`/`npx`
 *      are `.cmd` shims that execFileSync can't launch without shell:true — and
 *      shell:true is unsafe here, the cypher query contains `|`.
 *   3. `gitnexus` directly on PATH — POSIX node-shebang shim (PATH is augmented so
 *      its shebang finds node); the common path when nothing is on Windows.
 *   4. `npx gitnexus` — last resort (resolvable npm pkg only).
 * Returns [command, leadingArgs][] to try until one is found (ENOENT → next).
 */
function gitnexusInvocations() {
  const override = process.env.VFLOW_GITNEXUS_BIN;
  if (override) {
    return NODE_SCRIPT_EXT.has(path.extname(override).toLowerCase())
      ? [[process.execPath, [override]]]
      : [[override, []]];
  }
  const invocations = [];
  const jsEntry = resolveGitnexusJsEntry();
  if (jsEntry) invocations.push([process.execPath, [jsEntry]]);
  invocations.push(['gitnexus', []], ['npx', ['gitnexus']]);
  return invocations;
}

/** A file we can run as `node <file>`: JS extension, or a `#!…node` shebang. */
function isNodeScript(file) {
  try {
    if (NODE_SCRIPT_EXT.has(path.extname(file).toLowerCase())) return true;
    const firstLine = fs.readFileSync(file, 'utf8').split('\n', 1)[0] || '';
    return firstLine.startsWith('#!') && /node/.test(firstLine);
  } catch {
    return false;
  }
}

/** Read a package's `bin` for gitnexus and resolve it to an absolute entry file. */
function binEntryFromPackage(pkgDir) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
    const bin = pkg.bin;
    const rel = typeof bin === 'string' ? bin : bin && (bin.gitnexus || Object.values(bin)[0]);
    if (!rel) return null;
    const entry = path.join(pkgDir, rel);
    return fs.existsSync(entry) ? entry : null;
  } catch {
    return null;
  }
}

/**
 * Find gitnexus's JS entry so it can run as `node <entry>` — shell-free, cross-platform,
 * and free of any `.cmd`/shebang dependency. Two strategies, first hit wins:
 *   1. realpath the `gitnexus` shim in a known dir → its node-script target. On POSIX
 *      the homebrew/npm symlink points straight at dist/cli/index.js (exact version).
 *   2. read `bin.gitnexus` from the installed package — covers Windows (%APPDATA%\npm)
 *      and layouts where the symlink trick doesn't apply.
 * Returns an absolute entry path, or null when gitnexus can't be located.
 */
function resolveGitnexusJsEntry() {
  const inherited = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const searchDirs = [...new Set([...gitnexusBinDirs(), ...inherited])];

  for (const dir of searchDirs) {
    const shim = path.join(dir, 'gitnexus');
    try {
      if (fs.existsSync(shim)) {
        const real = fs.realpathSync(shim);
        if (isNodeScript(real)) return real;
      }
    } catch {
      /* unreadable dir/symlink → next */
    }
  }
  for (const dir of searchDirs) {
    const pkgDirs = [
      path.join(dir, 'node_modules', 'gitnexus'), // local / %APPDATA%\npm global
      path.join(dir, '..', 'lib', 'node_modules', 'gitnexus'), // posix / homebrew global
    ];
    for (const pkgDir of pkgDirs) {
      const entry = binEntryFromPackage(pkgDir);
      if (entry) return entry;
    }
  }
  return null;
}

/**
 * Directories where gitnexus / npx / node commonly live. Needed because v-flow may
 * run with a STRIPPED PATH — a GUI/Finder launch, a Windows service, or a
 * non-interactive shell that never sourced the user's rc file — where the package
 * manager's bin dir is absent and the bare command can't be found. dirname(
 * process.execPath) is the dir of the node actually running us (so its sibling npx
 * resolves); the rest are the standard global-package bins per platform.
 *   - win32: %APPDATA%\npm — where `npm i -g gitnexus` drops gitnexus.cmd (NOT next
 *     to node.exe), plus %ProgramFiles%\nodejs.
 *   - posix: /opt/homebrew/bin + /usr/local/bin (homebrew / manual installs); these
 *     also matter for the `#!/usr/bin/env node` shebang to resolve node.
 */
function gitnexusBinDirs() {
  const dirs = [path.dirname(process.execPath)];
  if (process.platform === 'win32') {
    if (process.env.APPDATA) dirs.push(path.join(process.env.APPDATA, 'npm'));
    if (process.env.ProgramFiles) dirs.push(path.join(process.env.ProgramFiles, 'nodejs'));
  } else {
    dirs.push('/opt/homebrew/bin', '/usr/local/bin');
  }
  return [...new Set(dirs.filter(Boolean))];
}

/**
 * PATH for the gitnexus subprocess: prepend the dirs above so (a) a bare `gitnexus`/
 * `npx` resolves and (b) their node shebang finds node — even when our own PATH was
 * stripped. The inherited PATH is appended (deduped) so a custom install still works.
 */
function gitnexusSubprocessPath() {
  const inherited = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  return [...gitnexusBinDirs(), ...inherited].filter((d, i, a) => a.indexOf(d) === i).join(path.delimiter);
}

/**
 * Default subprocess runner — invokes gitnexus (see gitnexusInvocations).
 * Success → parsed JSON. Failure → `{ __error: <reason> }` (NOT a silent null) so
 * callers can report WHY (missing bin / missing index / non-JSON output) instead
 * of a vague "cypher error". An injected runner may still return plain JSON | null.
 */
function defaultGitNexusRunner(args, cwd, repo) {
  const full = [...args, ...(repo ? ['--repo', repo] : [])];
  // Hand the child a PATH that includes node + the package-manager bins, so a
  // stripped-PATH launch (GUI/non-interactive shell) can still find gitnexus AND
  // resolve its `#!/usr/bin/env node` shebang.
  const env = { ...process.env, PATH: gitnexusSubprocessPath() };
  const opts = { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 };

  let out;
  let lastErr;
  for (const [cmd, lead] of gitnexusInvocations()) {
    try {
      out = execFileSync(cmd, [...lead, ...full], opts);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      if (err.code === 'ENOENT') continue; // this invocation isn't installed → try next
      break;                               // gitnexus ran but errored → real error, stop
    }
  }
  if (lastErr) return { __error: classifyRunnerError(lastErr) };

  try {
    return JSON.parse(out);
  } catch {
    const first = (out || '').trim().split('\n')[0] || '(không có output)';
    return { __error: `gitnexus chạy nhưng output không phải JSON ("${first.slice(0, 120)}") — kiểm tra version/flag CLI` };
  }
}

/**
 * Inherits symbolExists (file+text) + changedSince (git) from LightweightOracle,
 * adds the two graph-only capabilities. `runner` is injectable for testing.
 */
class GitNexusOracle extends LightweightOracle {
  constructor(projectRoot, { repo = null, runner = null } = {}) {
    super(projectRoot);
    this.repo = repo;
    this._runner = runner || ((args) => defaultGitNexusRunner(args, projectRoot, repo));
  }
  get name() {
    return 'full-graph';
  }

  /** Blast radius of a symbol via `gitnexus impact`. */
  impact(symbol, direction = 'upstream') {
    if (!symbol) return { supported: true, found: false, reason: 'empty symbol' };
    const j = this._runner(['impact', symbol, '--direction', direction]);
    if (!j || j.__error) return { supported: true, found: false, reason: j && j.__error ? j.__error : 'symbol not found / gitnexus error' };
    const affected = [];
    for (const bucket of Object.values(j.byDepth || {})) {
      for (const it of bucket) affected.push(it.name);
    }
    return {
      supported: true,
      found: true,
      impactedCount: j.impactedCount || 0,
      risk: j.risk || 'UNKNOWN',
      affected,
    };
  }

  /** Enumerate code symbols within the module's directory scope via `gitnexus cypher`. */
  symbolsOf(_module, scope = {}) {
    const dirs = (scope.dirs || []).filter(Boolean);
    if (dirs.length === 0) return { supported: true, symbols: [], reason: 'no scope (card has no code refs)' };
    // GitNexus cypher supports label disjunction in the MATCH pattern, but not
    // `n:Function OR …` / `n.type IN […]` in WHERE — keep the label in MATCH.
    const where = dirs.map((d) => `n.filePath CONTAINS '${d.replace(/'/g, '')}'`).join(' OR ');
    const q = `MATCH (n:Function|Method|Class) WHERE ${where} RETURN n.name`;
    const j = this._runner(['cypher', q]);
    if (!j || j.__error) return { supported: false, reason: j && j.__error ? j.__error : 'gitnexus cypher không trả kết quả' };
    return { supported: true, symbols: parseCypherColumn(j.markdown) };
  }
}

/**
 * @param {'none'|'lightweight'|'gitnexus'} mode
 * @param {string} projectRoot
 * @param {{repo?: string, runner?: function}} [opts]
 */
function getOracle(mode, projectRoot, opts = {}) {
  if (mode === 'none') return new NullOracle();
  if (mode === 'gitnexus') return new GitNexusOracle(projectRoot, opts);
  return new LightweightOracle(projectRoot);
}

module.exports = {
  NullOracle,
  LightweightOracle,
  GitNexusOracle,
  getOracle,
  escapeRegExp,
  parseCypherColumn,
  classifyRunnerError,
  gitnexusBinDirs,
  gitnexusSubprocessPath,
  gitnexusInvocations,
  resolveGitnexusJsEntry,
  isNodeScript,
  binEntryFromPackage,
};
