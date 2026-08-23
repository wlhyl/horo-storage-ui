// 盘类型：本命盘（natal）或卜卦盘（horary）
// 独立共享定义，供天宫图（horoscope）与历史天宫图（historical-horoscope）共同使用
export enum ChartType {
  // 本命盘
  Natal = 'natal',
  // 卜卦盘
  Horary = 'horary',
}
