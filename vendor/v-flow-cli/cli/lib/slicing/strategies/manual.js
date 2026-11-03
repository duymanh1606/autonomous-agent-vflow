/**
 * Strategy: manual
 * Slices come from a hand-written YAML file. The tool reads the file (--from) and passes its
 * parsed content as params.source, so plan() stays pure.
 */
module.exports = {
  name: 'manual',
  description: 'Đọc file YAML viết tay (--from), tool chỉ kiểm tra',
  params: {
    from: { type: 'string', default: null, description: 'File YAML chứa slices/deferred' },
  },

  plan(graph, params) {
    const source = params.source;
    if (!source || !Array.isArray(source.slices)) {
      throw new Error('manual cần --from <file.yaml> có trường `slices` dạng danh sách');
    }
    return { slices: source.slices, deferred: source.deferred || [] };
  },
};
