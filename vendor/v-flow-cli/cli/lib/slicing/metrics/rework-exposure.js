/**
 * rework_exposure: for every step of every main flow, simulate a change of that step and count
 * the slices marked needs_recheck + needs_regression; average over all steps.
 */
const { reworkExposure } = require('../impact');

module.exports = {
  id: 'rework_exposure',
  name: 'Slice phải mở lại khi spec đổi (TB)',
  better: 'low',
  compute(graph, variant) {
    return reworkExposure(graph, variant);
  },
};
