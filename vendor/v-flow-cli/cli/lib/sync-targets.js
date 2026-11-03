/**
 * Sync Targets — Config-driven registry of supported AI tools.
 *
 * V Flow's single source of truth is vendor-neutral markdown (`commands/`,
 * `agents/`, `skills/`, `AGENTS.md`). Each entry below declares HOW that
 * canonical form maps into one AI tool's conventional folders.
 *
 * ➕ Adding a new vendor = add ONE entry here. No changes to sync-core.js.
 *
 * Target shape:
 *   {
 *     key:      string                      // CLI selector (`--target <key>`)
 *     label:    string                      // human-readable name for output
 *     commands: { dir: string[], ext?, transform? }   // slash commands
 *     agents:   { dir: string[], ext?, transform? }   // agent personas
 *     skills:   { dir: string[] }                      // bulk-copied
 *     globals:  [{ src: string[], dest: string[], noClobber? }]  // instruction file(s)
 *   }
 *
 * `dir`/`src`/`dest` are path segments joined under projectRoot (or sourceRoot
 * for `src`). `ext: '.mdc'` renames `.md` → `.mdc` on write. `transform` is a
 * (content, fileName) => string applied per file. `noClobber: true` means
 * never overwrite an existing destination (for hand-authored files).
 */

/**
 * Convert .md content to .mdc format for Cursor (inject `globs: *`).
 */
function convertToMdc(content, fileName) {
  if (content.startsWith('---')) {
    return content.replace(/^---\r?\n/, '---\nglobs: *\n');
  }
  const cmdName = fileName.replace(/\.md$/, '');
  return `---\ndescription: Execute /${cmdName}\nglobs: *\n---\n${content}`;
}

/**
 * Convert agent .md to .mdc for Cursor with persona frontmatter.
 */
function convertAgentToMdc(content, fileName) {
  const agentName = fileName.replace(/\.md$/, '');
  return `---\ndescription: Agent persona - ${agentName}\nglobs: *\nalwaysApply: false\n---\n${content}`;
}

const TARGETS = [
  {
    key: 'antigravity',
    label: 'Antigravity',
    commands: { dir: ['.agents', 'workflows'] },
    agents: { dir: ['.agents', 'agents'] },
    skills: { dir: ['.agents', 'skills'] },
    globals: [{ src: ['AGENTS.md'], dest: ['AGENTS.md'] }],
  },
  {
    key: 'copilot',
    label: 'GitHub Copilot',
    commands: { dir: ['.github', 'prompts'] },
    agents: { dir: ['.github', 'agents'] },
    skills: { dir: ['.github', 'skills'] },
    globals: [
      { src: ['.github', 'copilot-instructions.md'], dest: ['.github', 'copilot-instructions.md'] },
    ],
  },
  {
    key: 'cursor',
    label: 'Cursor',
    commands: { dir: ['.cursor', 'rules'], ext: '.mdc', transform: convertToMdc },
    agents: { dir: ['.cursor', 'agents'], ext: '.mdc', transform: convertAgentToMdc },
    skills: { dir: ['.cursor', 'skills'] },
    globals: [{ src: ['AGENTS.md'], dest: ['.cursorrules'] }],
  },
  {
    key: 'claude',
    label: 'Claude Code',
    commands: { dir: ['.claude', 'commands'] },
    agents: { dir: ['.claude', 'agents'] },
    skills: { dir: ['.claude', 'skills'] },
    // CLAUDE.md is Claude Code's primary memory file and is very often
    // hand-authored — so never clobber it. Created only when absent.
    globals: [{ src: ['AGENTS.md'], dest: ['CLAUDE.md'], noClobber: true }],
  },
];

module.exports = { TARGETS, convertToMdc, convertAgentToMdc };
