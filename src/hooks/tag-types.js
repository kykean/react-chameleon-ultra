// # 特定的且必须存在的标志不存在的类型
export const TAG_TYPE_UNKNOWN = 0;
// # 125khz（ID卡）系列
export const TAG_TYPE_EM410X = 1;
// # Mifare系列
export const TAG_TYPE_MIFARE_Mini = 2;
export const TAG_TYPE_MIFARE_1024 = 3;
export const TAG_TYPE_MIFARE_2048 = 4;
export const TAG_TYPE_MIFARE_4096 = 5;
// # NTAG系列
export const TAG_TYPE_NTAG_213 = 6;
export const TAG_TYPE_NTAG_215 = 7;
export const TAG_TYPE_NTAG_216 = 8;

const tagLabel = {
  [TAG_TYPE_UNKNOWN]: "UNKNOWN",
  [TAG_TYPE_EM410X]: "EM410X",
  [TAG_TYPE_MIFARE_Mini]: "MIFARE Mini",
  [TAG_TYPE_MIFARE_1024]: "MIFARE 1024",
  [TAG_TYPE_MIFARE_2048]: "MIFARE 2048",
  [TAG_TYPE_MIFARE_4096]: "MIFARE 4096",
  [TAG_TYPE_NTAG_213]: "NTAG 213",
  [TAG_TYPE_NTAG_215]: "NTAG 215",
  [TAG_TYPE_NTAG_216]: "NTAG 216",
};

export const tagOptions = Array.from({ length: 8 }, (_, i) => i + 1).map(
  (k) => ({
    text: tagLabel[k],
    value: k,
  })
);
