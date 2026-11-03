const fs = require('fs');
const chalk = require('chalk');
const { withErrorHandler, ValidationError } = require('../lib/cli-error');
const activityLog = require('../lib/activity-log');

/**
 * `v-flow log` — append a structured activity entry, or view recent ones.
 *
 * Used by the agentic workflow (see AGENTS.md "Activity Logging") to record
 * phase boundaries and key decisions into the same .v-flow/logs/ files the CLI
 * writes to, giving one unified audit trail of "using v-flow".
 */
module.exports = function (program) {
  program
    .command('log')
    .description('Record a structured activity entry (agents) or view recent ones (--tail)')
    .argument('[message...]', 'Free-form log message')
    .option('--type <type>', 'Entry type (agent, note, ...)', 'agent')
    .option('--phase <phase>', 'V-Flow phase, e.g. S.1, B.1')
    .option('--feature <feature>', 'Feature name')
    .option('--actor <actor>', 'Who/what produced this, e.g. ba-agent')
    .option('--event <event>', 'Event kind: start | end | decision | error | info')
    .option('--level <level>', 'Severity: info | warn | error', 'info')
    .option('--data <json>', 'Extra structured fields as a JSON object')
    .option('--tail [n]', 'Show the last N entries instead of writing (default 20)')
    .option(
      '--hook <provider>',
      'Run as a lifecycle hook (claude|cursor|copilot|codex|antigravity): read the hook payload from stdin and log it'
    )
    .action(
      withErrorHandler((message, options) => {
        // ── Hook mode ── (invoked by an AI tool's lifecycle hook; reads stdin)
        if (options.hook) {
          runHookMode(options.hook, options);
          return;
        }

        // ── Read mode ──
        if (options.tail !== undefined) {
          const n = options.tail === true ? 20 : parseInt(options.tail, 10) || 20;
          printTail(n);
          return;
        }

        // ── Write mode ──
        let extra = {};
        if (options.data) {
          try {
            extra = JSON.parse(options.data);
          } catch (_) {
            throw new ValidationError('--data must be a valid JSON object', 'Example: --data \'{"req":"REQ-1"}\'');
          }
        }

        const msg = (message || []).join(' ').trim();
        const entry = {
          type: options.type,
          level: options.level,
          ...(options.event ? { event: options.event } : {}),
          ...(options.phase ? { phase: options.phase } : {}),
          ...(options.feature ? { feature: options.feature } : {}),
          ...(options.actor ? { actor: options.actor } : {}),
          ...(msg ? { message: msg } : {}),
          ...extra,
        };

        if (!msg && !options.event && Object.keys(extra).length === 0) {
          throw new ValidationError(
            'Nothing to log',
            'Provide a message, --event, or --data. Use --tail to view entries.'
          );
        }

        activityLog.event(entry, humanSuffix(entry));

        const dir = activityLog.resolveLogDir();
        if (dir) {
          console.log(chalk.dim(`📝 logged → ${dir}/activity.jsonl`));
        } else {
          console.log(chalk.yellow('⚠️  No .v-flow/ here — entry not persisted (run from a v-flow project or set VFLOW_LOG_DIR)'));
        }
      })
    );
};

function humanSuffix(e) {
  const scope = [e.phase, e.feature].filter(Boolean).join('/');
  const actor = e.actor ? ` (${e.actor})` : '';
  const head = `[${e.type}]${scope ? ` ${scope}` : ''}${e.event ? ` ${e.event}` : ''}${actor}`;
  return e.message ? `${head}: ${e.message}` : head;
}

function printTail(n) {
  const entries = activityLog.tail(n);
  if (entries.length === 0) {
    console.log(chalk.dim('No activity log entries yet.'));
    return;
  }
  console.log(chalk.cyan.bold(`\n📜 Last ${entries.length} activity entries\n`));
  for (const e of entries) {
    if (e.raw) {
      console.log(chalk.dim(e.raw));
      continue;
    }
    const ts = chalk.dim(e.ts || '');
    if (e.type === 'cli') {
      const ok = e.exitCode === 0 ? chalk.green('✓') : chalk.red(`✗ ${e.exitCode}`);
      console.log(`${ts}  ${ok} ${chalk.white(`v-flow ${(e.invocation || []).join(' ')}`)} ${chalk.dim(`(${e.durationMs}ms)`)}`);
    } else if (e.type === 'hook') {
      console.log(`${ts}  ${chalk.magenta(`[hook:${e.provider}]`)} ${chalk.white([e.event, e.tool].filter(Boolean).join(' '))}${e.command ? chalk.dim(` — ${e.command}`) : ''}`);
    } else {
      console.log(`${ts}  ${chalk.white(humanSuffix(e))}`);
    }
  }
  console.log('');
}

// ── Hook mode helpers ──────────────────────────────────────────────────────

/**
 * Read the hook payload from stdin, normalize it across providers, and log it.
 * MUST be defensive: never throw, always exit 0 — a logging hook must not block
 * or alter the host agent's behavior.
 */
function runHookMode(provider, options) {
  let raw = '';
  try {
    if (!process.stdin.isTTY) {
      raw = fs.readFileSync(0, 'utf8');
    }
  } catch (_) {
    /* no stdin available */
  }

  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch (_) {
    payload = { _unparsed: raw.slice(0, 500) };
  }

  try {
    const { fields, human } = normalizeHookPayload(provider, payload, options);
    activityLog.event({ type: 'hook', provider, level: 'info', ...fields }, human);
  } catch (_) {
    /* logging must never break the host agent */
  }

  // Antigravity requires a top-level JSON allow response; others accept empty
  // stdout + exit 0 as "continue".
  if (provider === 'antigravity') {
    if (options.event === 'Stop') {
      try {
        require('child_process').execSync('node ' + require('path').join(__dirname, '../../cli/index.js') + ' extract-log', { stdio: 'ignore' });
      } catch (e) {
        // ignore
      }
    }
    process.stdout.write(JSON.stringify({ allow_tool: true }));
  }
}

function pickField(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function normalizeHookPayload(provider, payload, options) {
  const p = payload || {};
  const toolCallArgs = (p.toolCall && p.toolCall.args) || {};

  const event = options.event || pickField(p, 'hook_event_name', 'hookEventName');
  const tool = pickField(p, 'tool_name', 'toolName') || toolCallArgs.ToolName;
  const sessionId = pickField(p, 'session_id', 'sessionId', 'conversation_id', 'generation_id');
  const cwd = pickField(p, 'cwd');
  const command = toolCallArgs.CommandLine || (p.tool_input && p.tool_input.command);
  const status = pickField(p, 'status', 'stop_hook_active');

  const fields = {
    ...(event ? { event } : {}),
    ...(tool ? { tool } : {}),
    ...(sessionId ? { sessionId } : {}),
    ...(cwd ? { cwd } : {}),
    ...(command ? { command } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(options.feature ? { feature: options.feature } : {}),
    payload: capPayload(p),
  };

  const scope = [event, tool].filter(Boolean).join(' ');
  const human = `[hook:${provider}] ${scope || 'event'}${command ? ` — ${command}` : ''}`;
  return { fields, human };
}

/** Keep the log lean: drop huge tool outputs, keep a size marker instead. */
function capPayload(p) {
  try {
    const s = JSON.stringify(p);
    if (s.length > 4000) return { _truncated: true, _bytes: s.length };
    return p;
  } catch (_) {
    return undefined;
  }
}
