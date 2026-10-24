export interface NowDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  // 浏览器时区偏移（东八区为 8），夏令时期间减 1
  time_zone_offset: number;
  is_dst: boolean;
}

// 取当前本地时间及浏览器时区偏移
// 以当年 2 月 1 日（标准时）为基准，与当前时刻偏移不同即视为夏令时
export function nowDateTime(): NowDateTime {
  const t = new Date();
  const base = new Date(t.getFullYear(), 1, 1); // 2月1日
  let time_zone_offset = base.getTimezoneOffset() / -60;
  const is_dst = t.getTimezoneOffset() != base.getTimezoneOffset();
  if (is_dst) {
    time_zone_offset -= 1;
  }
  return {
    year: t.getFullYear(),
    month: t.getMonth() + 1,
    day: t.getDate(),
    hour: t.getHours(),
    minute: t.getMinutes(),
    second: t.getSeconds(),
    time_zone_offset,
    is_dst,
  };
}
