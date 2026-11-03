/**
 * i18n — Internationalization for V-Flow CLI
 *
 * Supports: vi (default), en
 * Language selection: --lang flag, VFLOW_LANG env var, or system locale
 *
 * STATUS: Active — All 9 commands use i18n for user-facing strings.
 * Integration: Global --lang flag sets process.env.VFLOW_LANG via cli/index.js preAction hook.
 *
 * Usage in commands:
 *   const { createT } = require('../lib/i18n');
 *   const t = createT();
 *   console.log(t('init.created', { dir: '.v-flow' }));
 */

const vi = {
  // Common
  'common.success': '✅ Thành công',
  'common.error': '❌ Lỗi',
  'common.warning': '⚠️  Cảnh báo',
  'common.done': 'Hoàn tất',
  'common.skipped': 'Đã bỏ qua',
  'common.not_found': 'Không tìm thấy',
  'common.created': 'Đã tạo',
  'common.updated': 'Đã cập nhật',
  'common.unchanged': 'Không thay đổi',
  'common.dry_run': '(chế độ xem trước — không thay đổi gì)',
  'common.version': 'Phiên bản',
  'common.summary': '── Tổng kết ──',
  'common.added': 'Mới',
  'common.errors': 'Lỗi',

  // Init
  'init.title': '🚀 V Flow — Đang khởi tạo...',
  'init.already_exists': '⚠️  .v-flow/ đã tồn tại. Dùng --force để khởi tạo lại.',
  'init.already_exists_hint': '   Dữ liệu hiện tại sẽ không bị ghi đè.',
  'init.creating_dirs': '📁 Đang tạo cấu trúc thư mục...',
  'init.dir_created': '✅ .v-flow/ đã tạo',
  'init.constitution_created': '✅ constitution.md đã tạo (từ template)',
  'init.constitution_exists': '⏭️  constitution.md đã tồn tại',
  'init.agent_config_created': '✅ agent-config.md đã tạo (từ template)',
  'init.agent_config_exists': '⏭️  agent-config.md đã tồn tại',
  'init.scanning': '🔍 Đang quét codebase cho context.md...',
  'init.scan_complete': '✅ context.md đã tạo (U.0 auto-scan: {count} files)',
  'init.scan_languages': '      Ngôn ngữ: {languages}',
  'init.scan_frameworks': '      Frameworks: {frameworks}',
  'init.scan_warning': '⚠️  Tech Lead cần bổ sung: No-Go Zones, Technical Debt, Architecture',
  'init.scan_failed': '⚠️ (quét thất bại, dùng template)',
  'init.scan_template': '📝 context.md đã tạo từ template (điền thủ công)',
  'init.context_exists': '⏭️  context.md đã tồn tại',
  'init.knowledge_seeded': '✅ knowledge/ đã tạo ({count} files: glossary, patterns, lessons-learned)',
  'init.knowledge_exists': '⏭️  knowledge/ đã tồn tại',
  'init.syncing': '🤖 Đang đồng bộ AI agent files...',
  'init.sync_stats': '📊 Đồng bộ: {added} mới, {synced} cập nhật, {skipped} không đổi',
  'init.complete': '🎉 V Flow đã khởi tạo thành công!',
  'init.next_steps': 'Bước tiếp theo:',
  'init.review_context': '1. ⚠️  Review .v-flow/context.md → điền No-Go Zones & Technical Debt',
  'init.edit_constitution': '2. Sửa .v-flow/constitution.md với quy tắc dự án',
  'init.edit_agent_config': '3. Sửa .v-flow/agent-config.md với model preferences',
  'init.import_ba_docs': '4. (Tùy chọn) Có tài liệu BA trên NotebookLM? /v.import-ba-docs',
  'init.start_feature': '5. Bắt đầu feature: /v.specify',
  'init.sync_hint': '6. Nếu spec thay đổi: v-flow sync --apply để giữ artifacts đồng bộ',

  // Check
  'check.title': '🔍 V Flow — Kiểm tra sức khỏe',
  'check.vflow_found': '✅ .v-flow/ directory found',
  'check.core_files': '📋 Core Files:',
  'check.knowledge': '📚 Knowledge Base:',
  'check.features': '🏷️  Features: {count} found',
  'check.no_features': 'Chưa có feature. Tạo: .v-flow/features/001-feature-name/',
  'check.ai_agents': '🤖 AI Agent Integration:',

  // Status
  'status.title': '📊 V Flow — Trạng thái Pipeline',
  'status.no_features': 'Chưa có feature.',
  'status.no_features_hint': 'Tạo feature: v-flow feature create <tên>',
  'status.feature_not_found': 'Feature "{name}" không tìm thấy.',
  'status.available_features': 'Features hiện có: {features}',
  'status.blocked': '🚫 BLOCKED: {reason}',
  'status.awaiting': '👤 Đang chờ: {checkpoint}',
  'status.concerns': '⚡ Concerns: {count} đang mở',
  'status.next': '▶ Tiếp theo:',
  'status.all_complete': '🎉 Tất cả phases hoàn thành!',

  // Sync
  'sync.title': '🔄 V Flow — Đồng bộ',
  'sync.dry_run_note': '   ℹ️  Chế độ xem trước: không thay đổi file nào.',
  'sync.dry_run_hint': '   Thêm --apply để thực thi.',
  'sync.commands': '── Commands ──',
  'sync.agents': '── Agents ──',
  'sync.skills': '── Skills ──',
  'sync.global_files': '── Global Files ──',
  'sync.module_templates': '── Module Card Templates ──',
  'sync.skills_synced': '✅ Skills directory synced',
  'sync.mc_synced': '✅ Module card templates synced',
  'sync.mc_skipped': '⏭️  Bỏ qua — đang chạy từ source root (templates/ đã có sẵn)',
  'sync.summary': '── Tổng kết{mode} ──',
  'sync.added': '   ✨ Mới:        {count}',
  'sync.updated': '   🔄 Cập nhật:   {count}',
  'sync.unchanged': '   ⏭️  Không đổi:  {count}',
  'sync.errors': '   ❌ Lỗi:       {count}',
  'sync.apply_hint': '   ℹ️  Chạy {cmd} để thực thi những thay đổi này.',
  'sync.all_synced': '   ✅ Tất cả files đã đồng bộ.',
  'sync.all_uptodate': '   ✅ Tất cả files đã cập nhật.',

  // Doctor
  'doctor.title': '🩺 V Flow — Doctor',
  'doctor.core_structure': '📁 Core Structure',
  'doctor.core_files': '📄 Core Files',
  'doctor.ai_sync': '🤖 AI Agent Sync Status',
  'doctor.feature_health': '🏷️  Feature Health ({count} features)',
  'doctor.templates': '📝 Templates',
  'doctor.diagnosis': '── Chẩn đoán ──',
  'doctor.health': 'Sức khỏe',
  'doctor.errors': '❌ {count} lỗi — cần sửa:',
  'doctor.warnings': '⚠️  {count} cảnh báo — nên sửa:',
  'doctor.passed': '✅ {count} kiểm tra đã qua',
  'doctor.recommendations': '💡 Khuyến nghị:',
  'doctor.run_init': '• Chạy: v-flow init',
  'doctor.run_sync': '• Chạy: v-flow sync --apply',
  'doctor.review_context': '• Review: .v-flow/context.md — điền các mục Tech Lead',
  'doctor.run_feature': '• Chạy: v-flow feature create <tên> (để scaffolding đúng)',

  // Validate
  'validate.title': '🔍 V Flow — Kiểm tra chất lượng',
  'validate.no_features': 'Chưa có feature. Tạo bằng: v-flow feature create <tên>',
  'validate.summary': '── Tổng kết ──',
  'validate.quality_score': '📊 Điểm chất lượng: {score}%',

  // Plugin
  'plugin.title': '🔌 V Flow — Plugins',
  'plugin.no_plugins': 'Chưa có plugin.',
  'plugin.create_hint': 'Tạo plugin: v-flow plugin create <tên>',
  'plugin.created': 'Plugin đã tạo: .v-flow/plugins/{name}/',
  'plugin.installed': '✅ Đã cài {count} asset(s) từ {plugins} plugin(s)',
  'plugin.create_title': '🔌 V Flow — Tạo Plugin',
  'plugin.install_title': '🔌 V Flow — Cài Plugin',
  'plugin.validate_title': '🔌 V Flow — Validate Plugins',
  'plugin.all_valid': '✅ Tất cả {count} plugin(s) hợp lệ',
  'plugin.dry_run': '🔍 Dry run — {count} asset(s) sẽ được cài',

  // Feature
  'feature.title': '🏷️  Feature',
  'feature.created': 'Feature đã tạo: {name}',
  'feature.no_features': 'Chưa có feature.',

  // Upgrade
  'upgrade.title': '⬆️  V Flow — Nâng cấp{mode}',
  'upgrade.source_version': '   Phiên bản nguồn: {version}',
  'upgrade.installed_version': '   Phiên bản đã cài: {version}',
  'upgrade.up_to_date': '✅ Đã cập nhật!',
  'upgrade.templates': '📝 Templates',
  'upgrade.agents': '🤖 Agent Definitions & Commands',
  'upgrade.agents_hint': '   (Đồng bộ tới .agents/, .github/, .cursor/)',
  'upgrade.synced': '✅ Đã đồng bộ: {added} mới, {synced} cập nhật, {skipped} không đổi',
  'upgrade.sync_errors': '⚠️  {count} lỗi đồng bộ',
  'upgrade.upgraded': '✅ Đã nâng cấp lên v{version}',
  'upgrade.verify_hint': '→ Chạy: v-flow doctor để kiểm tra',
  'upgrade.apply_hint': 'ℹ️  Chạy lại không có --dry-run để áp dụng.',
  'upgrade.templates_uptodate': '✅ Tất cả templates đã cập nhật.',
};

const en = {
  // Common
  'common.success': '✅ Success',
  'common.error': '❌ Error',
  'common.warning': '⚠️  Warning',
  'common.done': 'Done',
  'common.skipped': 'Skipped',
  'common.not_found': 'Not found',
  'common.created': 'Created',
  'common.updated': 'Updated',
  'common.unchanged': 'Unchanged',
  'common.dry_run': '(preview mode — no changes made)',
  'common.version': 'Version',
  'common.summary': '── Summary ──',
  'common.added': 'Added',
  'common.errors': 'Errors',

  // Init
  'init.title': '🚀 V Flow — Initializing...',
  'init.already_exists': '⚠️  .v-flow/ already exists. Use --force to reinitialize.',
  'init.already_exists_hint': '   Existing data will not be overwritten.',
  'init.creating_dirs': '📁 Creating directory structure...',
  'init.dir_created': '✅ .v-flow/ directory created',
  'init.constitution_created': '✅ constitution.md created (from template)',
  'init.constitution_exists': '⏭️  constitution.md already exists',
  'init.agent_config_created': '✅ agent-config.md created (from template)',
  'init.agent_config_exists': '⏭️  agent-config.md already exists',
  'init.scanning': '🔍 Scanning codebase for context.md...',
  'init.scan_complete': '✅ context.md created (U.0 auto-scan: {count} files)',
  'init.scan_languages': '      Languages: {languages}',
  'init.scan_frameworks': '      Frameworks: {frameworks}',
  'init.scan_warning': '⚠️  Tech Lead should fill in: No-Go Zones, Technical Debt, Architecture',
  'init.scan_failed': '⚠️ (scan failed, using template)',
  'init.scan_template': '📝 context.md created from template (fill in manually)',
  'init.context_exists': '⏭️  context.md already exists',
  'init.knowledge_seeded': '✅ knowledge/ seeded ({count} files: glossary, patterns, lessons-learned)',
  'init.knowledge_exists': '⏭️  knowledge/ already exists',
  'init.syncing': '🤖 Syncing AI agent integration files...',
  'init.sync_stats': '📊 Sync stats: {added} new, {synced} updated, {skipped} unchanged',
  'init.complete': '🎉 V Flow initialized successfully!',
  'init.next_steps': 'Next steps:',
  'init.review_context': '1. ⚠️  Review .v-flow/context.md → fill in No-Go Zones & Technical Debt',
  'init.edit_constitution': '2. Edit .v-flow/constitution.md with your project rules',
  'init.edit_agent_config': '3. Edit .v-flow/agent-config.md with model preferences',
  'init.import_ba_docs': '4. (Optional) BA docs on NotebookLM? /v.import-ba-docs',
  'init.start_feature': '5. Start a feature: /v.specify',
  'init.sync_hint': '6. If spec changes later: v-flow sync --apply to keep artifacts in sync',

  // Check
  'check.title': '🔍 V Flow — Health Check',
  'check.vflow_found': '✅ .v-flow/ directory found',
  'check.core_files': '📋 Core Files:',
  'check.knowledge': '📚 Knowledge Base:',
  'check.features': '🏷️  Features: {count} found',
  'check.no_features': 'No features yet. Create: .v-flow/features/001-feature-name/',
  'check.ai_agents': '🤖 AI Agent Integration:',

  // Status
  'status.title': '📊 V Flow — Pipeline Status',
  'status.no_features': 'No features found.',
  'status.no_features_hint': 'Create a feature: v-flow feature create <name>',
  'status.feature_not_found': 'Feature "{name}" not found.',
  'status.available_features': 'Available features: {features}',
  'status.blocked': '🚫 BLOCKED: {reason}',
  'status.awaiting': '👤 Awaiting: {checkpoint}',
  'status.concerns': '⚡ Concerns: {count} active',
  'status.next': '▶ Next:',
  'status.all_complete': '🎉 All phases complete!',

  // Sync
  'sync.title': '🔄 V Flow — Sync',
  'sync.dry_run_note': '   ℹ️  Dry-run mode: no files will be changed.',
  'sync.dry_run_hint': '   Add --apply to execute changes.',
  'sync.commands': '── Commands ──',
  'sync.agents': '── Agents ──',
  'sync.skills': '── Skills ──',
  'sync.global_files': '── Global Files ──',
  'sync.module_templates': '── Module Card Templates ──',
  'sync.skills_synced': '✅ Skills directory synced',
  'sync.mc_synced': '✅ Module card templates synced',
  'sync.mc_skipped': '⏭️  Skipped — running from source root (templates/ already exists)',
  'sync.summary': '── Summary{mode} ──',
  'sync.added': '   ✨ Added:     {count}',
  'sync.updated': '   🔄 Updated:   {count}',
  'sync.unchanged': '   ⏭️  Unchanged: {count}',
  'sync.errors': '   ❌ Errors:    {count}',
  'sync.apply_hint': '   ℹ️  Run {cmd} to execute these changes.',
  'sync.all_synced': '   ✅ All files synced successfully.',
  'sync.all_uptodate': '   ✅ All files are up-to-date.',

  // Doctor
  'doctor.title': '🩺 V Flow — Doctor',
  'doctor.core_structure': '📁 Core Structure',
  'doctor.core_files': '📄 Core Files',
  'doctor.ai_sync': '🤖 AI Agent Sync Status',
  'doctor.feature_health': '🏷️  Feature Health ({count} features)',
  'doctor.templates': '📝 Templates',
  'doctor.diagnosis': '── Diagnosis ──',
  'doctor.health': 'Health',
  'doctor.errors': '❌ {count} error(s) — must fix:',
  'doctor.warnings': '⚠️  {count} warning(s) — should fix:',
  'doctor.passed': '✅ {count} check(s) passed',
  'doctor.recommendations': '💡 Recommendations:',
  'doctor.run_init': '• Run: v-flow init',
  'doctor.run_sync': '• Run: v-flow sync --apply',
  'doctor.review_context': '• Review: .v-flow/context.md — fill in Tech Lead sections',
  'doctor.run_feature': '• Run: v-flow feature create <name> (for proper scaffolding)',

  // Validate
  'validate.title': '🔍 V Flow — Quality Validation',
  'validate.no_features': 'No features found. Create one with: v-flow feature create <name>',
  'validate.summary': '── Summary ──',
  'validate.quality_score': '📊 Quality score: {score}%',

  // Plugin
  'plugin.title': '🔌 V Flow — Plugins',
  'plugin.no_plugins': 'No plugins found.',
  'plugin.create_hint': 'Create one with: v-flow plugin create <name>',
  'plugin.created': 'Plugin created: .v-flow/plugins/{name}/',
  'plugin.installed': '✅ Installed {count} asset(s) from {plugins} plugin(s)',
  'plugin.create_title': '🔌 V Flow — Create Plugin',
  'plugin.install_title': '🔌 V Flow — Install Plugins',
  'plugin.validate_title': '🔌 V Flow — Validate Plugins',
  'plugin.all_valid': '✅ All {count} plugin(s) valid',
  'plugin.dry_run': '🔍 Dry run — {count} asset(s) would be installed',

  // Feature
  'feature.title': '🏷️  Feature',
  'feature.created': 'Feature created: {name}',
  'feature.no_features': 'No features yet.',

  // Upgrade
  'upgrade.title': '⬆️  V Flow — Upgrade{mode}',
  'upgrade.source_version': '   Source version: {version}',
  'upgrade.installed_version': '   Installed version: {version}',
  'upgrade.up_to_date': '✅ Already up-to-date!',
  'upgrade.templates': '📝 Templates',
  'upgrade.agents': '🤖 Agent Definitions & Commands',
  'upgrade.agents_hint': '   (Syncing to .agents/, .github/, .cursor/)',
  'upgrade.synced': '✅ Synced: {added} new, {synced} updated, {skipped} unchanged',
  'upgrade.sync_errors': '⚠️  {count} sync error(s)',
  'upgrade.upgraded': '✅ Upgraded to v{version}',
  'upgrade.verify_hint': '→ Run: v-flow doctor to verify integrity',
  'upgrade.apply_hint': 'ℹ️  Run without --dry-run to apply changes.',
  'upgrade.templates_uptodate': '✅ All templates are up-to-date.',
};

const locales = { vi, en };

/**
 * Detect language from environment
 * Priority: --lang flag > VFLOW_LANG env > system locale > default (vi)
 */
function detectLanguage() {
  // Check process args for --lang
  const langArgIndex = process.argv.indexOf('--lang');
  if (langArgIndex !== -1 && process.argv[langArgIndex + 1]) {
    const lang = process.argv[langArgIndex + 1].toLowerCase();
    if (locales[lang]) return lang;
  }

  // Check environment variable
  if (process.env.VFLOW_LANG) {
    const lang = process.env.VFLOW_LANG.toLowerCase();
    if (locales[lang]) return lang;
  }

  // Check system locale
  const sysLang = (process.env.LANG || process.env.LC_ALL || '').toLowerCase();
  if (sysLang.startsWith('en')) return 'en';

  return 'vi'; // Default
}

/**
 * Get translation function for current language
 *
 * @param {string} [lang] - Language override
 * @returns {function(key: string, vars?: object): string}
 */
function createT(lang) {
  const currentLang = lang || detectLanguage();
  const messages = locales[currentLang] || locales.vi;
  const fallback = locales.vi;

  return function t(key, vars = {}) {
    let msg = messages[key] || fallback[key] || key;
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
    return msg;
  };
}

/**
 * Get number of translation keys available
 * @returns {{ vi: number, en: number }}
 */
function getKeyCount() {
  return {
    vi: Object.keys(vi).length,
    en: Object.keys(en).length,
  };
}

module.exports = {
  locales,
  detectLanguage,
  createT,
  getKeyCount,
  vi,
  en,
};
