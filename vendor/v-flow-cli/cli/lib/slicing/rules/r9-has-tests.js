/**
 * R9 has-tests: every slice except SLICE-0 has at least one TC derived from the graph.
 */
const { FOUNDATION_ID } = require('../helpers');
const { testsOfSlice } = require('../derive');

module.exports = {
  id: 'R9-has-tests',
  check(graph, variant) {
    return (variant.slices || [])
      .filter((s) => s.id !== FOUNDATION_ID && testsOfSlice(graph, s).length === 0)
      .map((s) => ({ slice: s.id, message: `${s.id} chưa có TC nào (suy ra từ task/AC của slice)` }));
  },
};
