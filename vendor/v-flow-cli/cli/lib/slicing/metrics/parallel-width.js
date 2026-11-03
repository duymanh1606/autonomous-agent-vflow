/** parallel_width: largest number of slices ready at the same time (topological waves). */
const { topoWaves } = require('../helpers');

module.exports = {
  id: 'parallel_width',
  name: 'Độ rộng song song',
  better: 'high',
  compute(graph, variant) {
    return Math.max(0, ...topoWaves(variant).map((w) => w.length));
  },
};
