export function parse14AScanTagResult(data) {
  return {
    uid_size: data[10],
    uid_hex: data.slice(0, data[10]).toString("hex"),
    sak_hex: (data[12] >>> 0).toString(16).padStart(2, "0"),
    atqa_hex: data.slice(13, 15).toString("hex").toUpperCase(),
  };
}
