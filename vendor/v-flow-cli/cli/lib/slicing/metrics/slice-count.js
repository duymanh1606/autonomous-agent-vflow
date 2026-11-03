/** slice_count: number of slices (deferred flows are not slices). */
module.exports = {
  id: 'slice_count',
  name: 'Số slice',
  better: null,
  compute(graph, variant) {
    return (variant.slices || []).length;
  },
};
