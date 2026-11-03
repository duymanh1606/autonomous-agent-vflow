/**
 * CLI Error Utilities — Unified error handling for V-Flow CLI
 *
 * Provides consistent error formatting, exit codes, and error types
 * across all CLI commands.
 */

const chalk = require('chalk');

// ============================================================
// ERROR TYPES
// ============================================================

/**
 * Base CLI error with exit code and user-friendly message
 */
class CliError extends Error {
  constructor(message, { exitCode = 1, hint = null, cause = null } = {}) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
    this.hint = hint;
    if (cause) this.cause = cause;
  }
}

/**
 * Project not initialized error
 */
class NotInitializedError extends CliError {
  constructor() {
    super('V Flow is not initialized (.v-flow/ not found)', {
      exitCode: 1,
      hint: 'Run: v-flow init',
    });
    this.name = 'NotInitializedError';
  }
}

/**
 * Feature not found error
 */
class FeatureNotFoundError extends CliError {
  constructor(featureName) {
    super(`Feature not found: ${featureName}`, {
      exitCode: 1,
      hint: 'Run: v-flow feature list to see available features',
    });
    this.name = 'FeatureNotFoundError';
  }
}

/**
 * Validation error (bad input, missing argument, etc.)
 */
class ValidationError extends CliError {
  constructor(message, hint = null) {
    super(message, { exitCode: 1, hint });
    this.name = 'ValidationError';
  }
}

// ============================================================
// ERROR HANDLER
// ============================================================

/**
 * Wrap a command action with consistent error handling.
 *
 * Usage:
 *   program.command('foo').action(withErrorHandler(async (options) => { ... }));
 *
 * @param {Function} actionFn - async function(options) to wrap
 * @returns {Function} wrapped function
 */
function withErrorHandler(actionFn) {
  return async (...args) => {
    try {
      await actionFn(...args);
    } catch (err) {
      if (err instanceof CliError) {
        console.error(chalk.red(`\n❌ ${err.message}`));
        if (err.hint) {
          console.error(chalk.dim(`   → ${err.hint}`));
        }
        console.error('');
        process.exit(err.exitCode);
      } else {
        // Unexpected error — show stack in verbose mode
        console.error(chalk.red(`\n❌ Unexpected error: ${err.message}`));
        if (process.env.VFLOW_DEBUG || process.argv.includes('--debug')) {
          console.error(chalk.dim(err.stack));
        } else {
          console.error(chalk.dim('   → Re-run with VFLOW_DEBUG=1 for full stack trace'));
        }
        console.error('');
        process.exit(1);
      }
    }
  };
}

// ============================================================
// GUARD UTILITIES
// ============================================================

/**
 * Assert project is initialized, throw NotInitializedError if not.
 * @param {string} projectRoot
 * @param {Function} isInitialized - from templates.js
 */
function requireInit(projectRoot, isInitialized) {
  if (!isInitialized(projectRoot)) {
    throw new NotInitializedError();
  }
}

// ============================================================
// FORMATTING UTILITIES
// ============================================================

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Print a section header
 */
function printHeader(title) {
  console.log(chalk.white.bold(`\n${title}`));
}

/**
 * Print a success line
 */
function printOk(message) {
  console.log(chalk.green(`   ✅ ${message}`));
}

/**
 * Print a warning line
 */
function printWarn(message) {
  console.log(chalk.yellow(`   ⚠️  ${message}`));
}

/**
 * Print an error line
 */
function printError(message) {
  console.log(chalk.red(`   ❌ ${message}`));
}

/**
 * Print a dimmed info line
 */
function printDim(message) {
  console.log(chalk.dim(`   ${message}`));
}

module.exports = {
  // Error classes
  CliError,
  NotInitializedError,
  FeatureNotFoundError,
  ValidationError,
  // Handler
  withErrorHandler,
  // Guards
  requireInit,
  // Formatting
  formatBytes,
  printHeader,
  printOk,
  printWarn,
  printError,
  printDim,
};
