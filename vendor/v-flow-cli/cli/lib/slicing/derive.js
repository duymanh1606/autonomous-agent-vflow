/**
 * AC and TC of a slice are never stored in the variant — they are derived from the graph
 * (by flow and task), so a variant cannot drift from the spec.
 */

function acsOfSlice(graph, slice) {
  const flows = new Set(slice.flows || []);
  const units = new Set(slice.units || []);
  return (graph.acs || []).filter((a) => (a.flows || []).some((f) => flows.has(f))
    || (a.units || []).some((u) => units.has(u)));
}

function testsOfSlice(graph, slice) {
  const flows = new Set(slice.flows || []);
  const units = new Set(slice.units || []);
  const flowAcs = new Set((graph.acs || []).filter((a) => (a.flows || []).some((f) => flows.has(f))).map((a) => a.id));
  return (graph.tests || []).filter((t) => (t.units || []).some((u) => units.has(u))
    || (t.acs || []).some((a) => flowAcs.has(a)));
}

module.exports = { acsOfSlice, testsOfSlice };
