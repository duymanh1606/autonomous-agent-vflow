/**
 * AC-PASS Gate — verify every spec Acceptance Criterion (AC-NN) is satisfied by
 * a PASSING automated test, by reading a JUnit XML test report.
 *
 * This is the "living-spec" leg of validation: existing checks confirm each AC
 * is *referenced* by a task/test-case on paper; this one reaches into the real
 * test runner and fails when an AC has no PASSING test behind it.
 *
 * Convention: a testcase "covers" AC-NN when the AC id token appears in its
 * `name`/`classname` (e.g. `it('AC-03: rejects expired token', ...)`), reusing
 * the same AC-NN ids V Flow already threads through spec → task → test-case.
 *
 * JUnit XML is the universal interchange format — Jest (jest-junit), Vitest,
 * pytest, go-junit-report, Maven Surefire, etc. all emit it.
 */

/**
 * Parse JUnit XML into a flat list of testcases.
 * A case counts as failed if it contains a <failure>/<error> child, skipped if
 * it contains <skipped>. Anything else is a pass.
 *
 * @param {string} xml
 * @returns {Array<{name,classname,label,passed,failed,skipped}>}
 */
function parseJUnitResults(xml) {
  const cases = [];
  if (!xml || typeof xml !== 'string') return cases;

  // Match <testcase .../> (self-closing) or <testcase ...>...</testcase>.
  const reCase = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g;
  let m;
  while ((m = reCase.exec(xml)) !== null) {
    const attrs = m[1] || '';
    const inner = m[2] || '';
    const name = (attrs.match(/\bname\s*=\s*"([^"]*)"/) || [])[1] || '';
    const classname = (attrs.match(/\bclassname\s*=\s*"([^"]*)"/) || [])[1] || '';
    const failed = /<(?:failure|error)\b/.test(inner);
    const skipped = /<skipped\b/.test(inner);
    cases.push({
      name,
      classname,
      label: `${classname} ${name}`.trim(),
      passed: !failed && !skipped,
      failed,
      skipped,
    });
  }
  return cases;
}

/**
 * Extract unique AC-NN ids from arbitrary text.
 * @param {string} text
 * @returns {string[]}
 */
function extractAcIds(text) {
  return [...new Set((text || '').match(/\bAC-\d+\b/g) || [])];
}

/**
 * Classify each spec AC against parsed test cases.
 *
 * @param {string[]} specAcs - AC ids declared in the spec (e.g. ['AC-01','AC-02'])
 * @param {Array} cases - output of parseJUnitResults
 * @returns {{ total:number, passed:string[], failing:string[], missing:string[] }}
 *   passed  = AC referenced by ≥1 PASSING test
 *   failing = AC referenced only by failing/skipped tests (no passing one)
 *   missing = AC referenced by no test at all
 */
function checkAcTestPass(specAcs, cases) {
  const acs = [...new Set(specAcs || [])];
  const list = cases || [];
  const passed = [];
  const failing = [];
  const missing = [];

  for (const ac of acs) {
    // Word-boundary match so AC-1 does not match AC-12.
    const re = new RegExp(`\\b${ac}\\b`);
    const refs = list.filter((c) => re.test(c.label));
    if (refs.length === 0) missing.push(ac);
    else if (refs.some((c) => c.passed)) passed.push(ac);
    else failing.push(ac);
  }

  return { total: acs.length, passed, failing, missing };
}

module.exports = { parseJUnitResults, extractAcIds, checkAcTestPass };
