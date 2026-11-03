/**
 * Hook Targets — per-provider lifecycle-hook config descriptors.
 *
 * Each AI coding tool now ships a hooks system, but the config shapes differ
 * (event-name casing, `command` vs `bash`, nested-with-matcher vs flat, a named
 * group for Antigravity). This module declares those shapes once so the
 * `v-flow hooks` command can install / remove / inspect a single logging hook
 * (`v-flow log --hook <provider>`) for every tool, merging into existing config
 * without clobbering the user's own hooks.
 *
 * Verified against vendor docs (mid-2026):
 *   Claude Code  .claude/settings.json      → hooks.{PostToolUse,Stop,SessionStart} (nested, matcher)
 *   OpenAI Codex .codex/hooks.json          → hooks.{PostToolUse,Stop,SessionStart} (nested)
 *   Antigravity  .agents/hooks.json         → vflow-log.{PostToolUse,Stop}          (named group, nested, matcher)
 *   Cursor       .cursor/hooks.json         → hooks.{postToolUse,stop,sessionStart} (flat, `command`, version 1)
 *   Copilot      .github/hooks/vflow-log.json → hooks.{postToolUse,agentStop,sessionStart} (flat, `bash`, version 1)
 */

const PROVIDERS = [
  {
    key: 'claude',
    label: 'Claude Code',
    file: ['.claude', 'settings.json'],
    root: 'hooks',
    form: 'nested',
    version: null,
    events: ['PostToolUse', 'Stop', 'SessionStart'],
    matcherEvents: ['PostToolUse'],
    timeout: null,
  },
  {
    key: 'codex',
    label: 'OpenAI Codex',
    file: ['.codex', 'hooks.json'],
    root: 'hooks',
    form: 'nested',
    version: null,
    events: ['PostToolUse', 'Stop', 'SessionStart'],
    matcherEvents: [],
    timeout: null,
  },
  {
    key: 'antigravity',
    label: 'Antigravity',
    file: ['.agents', 'hooks.json'],
    root: 'vflow-log',
    form: 'nested',
    version: null,
    events: ['PostToolUse', 'Stop'],
    matcherEvents: ['PostToolUse', 'Stop'],
    timeout: 15,
  },
  {
    key: 'cursor',
    label: 'Cursor',
    file: ['.cursor', 'hooks.json'],
    root: 'hooks',
    form: 'flat-command',
    version: 1,
    events: ['postToolUse', 'stop', 'sessionStart'],
    matcherEvents: [],
    timeout: null,
  },
  {
    key: 'copilot',
    label: 'GitHub Copilot',
    file: ['.github', 'hooks', 'vflow-log.json'],
    root: 'hooks',
    form: 'flat-bash',
    version: 1,
    events: ['postToolUse', 'agentStop', 'sessionStart'],
    matcherEvents: [],
    timeout: null,
  },
];

function getProvider(key) {
  return PROVIDERS.find((p) => p.key === key) || null;
}

/** The single logging command each hook invokes. `bin` defaults to PATH lookup. */
function hookCommand(provider, event, bin = 'v-flow') {
  return `${bin} log --hook ${provider.key} --event ${event}`;
}

/** Build one event entry in the provider's native shape. */
function buildEntry(provider, event, bin) {
  const command = hookCommand(provider, event, bin);
  if (provider.form === 'flat-command') {
    return { command };
  }
  if (provider.form === 'flat-bash') {
    return { type: 'command', bash: command };
  }
  // nested (claude / codex / antigravity)
  const inner = { type: 'command', command };
  if (provider.timeout) inner.timeout = provider.timeout;
  const group = { hooks: [inner] };
  if (provider.matcherEvents.includes(event)) group.matcher = '*';
  return group;
}

/** Does an existing entry belong to v-flow (so we can replace/remove it)? */
function entryIsOurs(provider, entry) {
  if (!entry || typeof entry !== 'object') return false;
  const needle = `--hook ${provider.key}`;
  const hasNeedle = (s) => typeof s === 'string' && s.includes(needle);
  if (hasNeedle(entry.command) || hasNeedle(entry.bash)) return true;
  if (Array.isArray(entry.hooks)) {
    return entry.hooks.some((h) => h && (hasNeedle(h.command) || hasNeedle(h.bash)));
  }
  return false;
}

/**
 * Merge our hooks into an existing parsed config (or {}). Idempotent: replaces
 * any prior v-flow entries, preserves everything else.
 */
function mergeConfig(provider, existing, opts = {}) {
  const cfg = existing && typeof existing === 'object' ? existing : {};
  if (provider.version !== null && cfg.version === undefined) {
    cfg.version = provider.version;
  }
  cfg[provider.root] = cfg[provider.root] || {};
  const container = cfg[provider.root];
  for (const event of provider.events) {
    const arr = Array.isArray(container[event]) ? container[event] : [];
    const cleaned = arr.filter((e) => !entryIsOurs(provider, e));
    cleaned.push(buildEntry(provider, event, opts.bin));
    container[event] = cleaned;
  }
  return cfg;
}

/** Strip our hooks from an existing parsed config; preserve user hooks. */
function removeConfig(provider, existing) {
  if (!existing || typeof existing !== 'object') return existing;
  const container = existing[provider.root];
  if (!container || typeof container !== 'object') return existing;
  for (const event of Object.keys(container)) {
    if (Array.isArray(container[event])) {
      container[event] = container[event].filter((e) => !entryIsOurs(provider, e));
      if (container[event].length === 0) delete container[event];
    }
  }
  if (Object.keys(container).length === 0) delete existing[provider.root];
  return existing;
}

/** Is our hook currently present in an existing parsed config? */
function isInstalled(provider, existing) {
  const container = existing && existing[provider.root];
  if (!container || typeof container !== 'object') return false;
  return provider.events.some(
    (ev) => Array.isArray(container[ev]) && container[ev].some((e) => entryIsOurs(provider, e))
  );
}

module.exports = {
  PROVIDERS,
  getProvider,
  hookCommand,
  buildEntry,
  mergeConfig,
  removeConfig,
  isInstalled,
};
