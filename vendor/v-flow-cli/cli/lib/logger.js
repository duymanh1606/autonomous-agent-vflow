/**
 * Logger — Structured logging for V-Flow CLI
 *
 * Provides verbosity levels, structured output, and JSON mode.
 * Replaces raw console.log with contextual logging.
 *
 * Verbosity levels:
 *   0 = silent (errors only)
 *   1 = normal (default)
 *   2 = verbose (--verbose flag)
 *   3 = debug (VFLOW_DEBUG=1)
 */

const chalk = require('chalk');

const LEVELS = {
  SILENT: 0,
  NORMAL: 1,
  VERBOSE: 2,
  DEBUG: 3,
};

let _verbosity = LEVELS.NORMAL;
let _jsonMode = false;
let _jsonBuffer = [];
let _startTime = null;

/**
 * Configure logger from CLI options
 * @param {object} options
 * @param {boolean} [options.verbose] - Enable verbose output
 * @param {boolean} [options.json] - Enable JSON output mode
 * @param {boolean} [options.silent] - Suppress all output except errors
 */
function configure(options = {}) {
  if (options.silent) {
    _verbosity = LEVELS.SILENT;
  } else if (process.env.VFLOW_DEBUG === '1') {
    _verbosity = LEVELS.DEBUG;
  } else if (options.verbose || process.env.VFLOW_VERBOSE === '1') {
    _verbosity = LEVELS.VERBOSE;
  } else {
    _verbosity = LEVELS.NORMAL;
  }

  _jsonMode = !!options.json;
  _jsonBuffer = [];
  _startTime = Date.now();
}

/**
 * Log at normal level
 */
function info(message, ...args) {
  if (_jsonMode) return;
  if (_verbosity >= LEVELS.NORMAL) {
    console.log(message, ...args);
  }
}

/**
 * Log at verbose level
 */
function verbose(message, ...args) {
  if (_jsonMode) return;
  if (_verbosity >= LEVELS.VERBOSE) {
    console.log(chalk.dim(message), ...args);
  }
}

/**
 * Log at debug level
 */
function debug(message, ...args) {
  if (_jsonMode) return;
  if (_verbosity >= LEVELS.DEBUG) {
    console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
  }
}

/**
 * Log an error (always shown)
 */
function error(message, ...args) {
  if (_jsonMode) {
    _jsonBuffer.push({ level: 'error', message, timestamp: Date.now() });
    return;
  }
  console.error(chalk.red(message), ...args);
}

/**
 * Log a warning (normal+ level)
 */
function warn(message, ...args) {
  if (_jsonMode) {
    _jsonBuffer.push({ level: 'warn', message, timestamp: Date.now() });
    return;
  }
  if (_verbosity >= LEVELS.NORMAL) {
    console.log(chalk.yellow(message), ...args);
  }
}

/**
 * Log a success message
 */
function success(message, ...args) {
  if (_jsonMode) return;
  if (_verbosity >= LEVELS.NORMAL) {
    console.log(chalk.green(message), ...args);
  }
}

/**
 * Log a section header
 */
function header(message) {
  if (_jsonMode) return;
  if (_verbosity >= LEVELS.NORMAL) {
    console.log(chalk.white.bold(message));
  }
}

/**
 * Log a dimmed info line
 */
function dim(message, ...args) {
  if (_jsonMode) return;
  if (_verbosity >= LEVELS.NORMAL) {
    console.log(chalk.dim(message), ...args);
  }
}

/**
 * Buffer a JSON result entry.
 * In JSON mode, output is buffered and flushed at the end.
 */
function json(data) {
  if (_jsonMode) {
    _jsonBuffer.push(data);
  }
}

/**
 * Flush JSON buffer to stdout
 * @param {object} [metadata] - Additional metadata to include
 */
function flushJson(metadata = {}) {
  if (!_jsonMode) return;

  const output = {
    ...metadata,
    duration_ms: _startTime ? Date.now() - _startTime : null,
    results: _jsonBuffer.length === 1 ? _jsonBuffer[0] : _jsonBuffer,
  };

  console.log(JSON.stringify(output, null, 2));
  _jsonBuffer = [];
}

/**
 * Get elapsed time since configure() was called
 * @returns {string} formatted duration
 */
function elapsed() {
  if (!_startTime) return '0ms';
  const ms = Date.now() - _startTime;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Check if in JSON mode
 */
function isJsonMode() {
  return _jsonMode;
}

/**
 * Get current verbosity level
 */
function getVerbosity() {
  return _verbosity;
}

module.exports = {
  LEVELS,
  configure,
  info,
  verbose,
  debug,
  error,
  warn,
  success,
  header,
  dim,
  json,
  flushJson,
  elapsed,
  isJsonMode,
  getVerbosity,
};
