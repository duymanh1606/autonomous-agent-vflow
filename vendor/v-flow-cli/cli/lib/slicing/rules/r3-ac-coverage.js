/**
 * R3 ac-coverage: every AC is covered by at least one slice (through a flow or a task).
 * ACs whose flows are all deferred are exempt.
 */
module.exports = {
  id: 'R3-ac-coverage',
  check(graph, variant) {
    const deferred = new Set((variant.deferred || []).map((d) => (typeof d === 'string' ? d : d.flow)));
    const flows = new Set((variant.slices || []).flatMap((s) => s.flows || []));
    const units = new Set((variant.slices || []).flatMap((s) => s.units || []));
    return (graph.acs || [])
      .filter((ac) => !((ac.flows || []).length > 0 && ac.flows.every((f) => deferred.has(f))))
      .filter((ac) => !(ac.flows || []).some((f) => flows.has(f)) && !(ac.units || []).some((u) => units.has(u)))
      .map((ac) => ({ slice: null, message: `${ac.id} không được slice nào phủ (qua luồng hoặc task)` }));
  },
};
