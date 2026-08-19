import { Location, LocationRequest } from './location';
import { Person } from './person';
import { Tag } from './tag';

// 盘类型：本命盘（natal）或卜卦盘（horary）
export type ChartType = 'natal' | 'horary';

export interface Horoscope {
  id: number;
  name: string;
  gender: boolean;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  birth_minute: number;
  birth_second: number;
  time_zone_offset: number;
  is_dst: boolean;
  // 盘类型
  chart_type: ChartType;
  // 时间是否精准（仅本命盘有意义），true=已校对，false=未校对
  is_time_precise: boolean;

  location: Location;

  description: string;

  created_at: string;
  updated_at: string | null;
  lock: boolean;
  user_id: number;
  // 所属联系人信息，null表示未关联（API JOIN persons表返回）
  person: Person | null;
  // 标签列表，空数组表示无标签（API JOIN tags表返回）
  tags: Tag[];
}

export interface HoroscopeRequest {
  // 姓名
  name: string;
  // 性别
  gender: boolean;
  // 年，最小值1900
  birth_year: number;
  // 月
  birth_month: number;
  // 日
  birth_day: number;
  // 时
  birth_hour: number;
  // 分
  birth_minute: number;
  // 秒
  birth_second: number;
  // 出生地时区，东区为正数，西区为负数
  time_zone_offset: number;
  // 出生时的夏令时，有夏令时：true，无夏令时： false
  is_dst: boolean;

  // 盘类型：本命盘（natal）或卜卦盘（horary）
  chart_type: ChartType;
  // 时间是否精准（仅本命盘有意义），true=已校对，false=未校对
  is_time_precise: boolean;

  location: LocationRequest;

  // 说明文字
  description: string;
  // 是否锁定
  lock: Boolean;
  // 归属登录用户ID（可选，仅 admin 生效，缺省为当前登录用户，非 admin 忽略该字段）
  user_id?: number;
  // 所属联系人ID（可选，null表示不关联）
  person_id?: number | null;
  // 标签ID列表（可选，标签全局共享）
  tag_ids?: number[];
}

export interface UpdateHoroscopeRequest {
  // 姓名，长度1-30个字符
  name: string | null;
  // 性别
  gender: boolean | null;
  // 年，最小值1900
  birth_year: number | null;
  // 月，1-12
  birth_month: number | null;
  // 日，1-31
  birth_day: number | null;
  // 时，0-23
  birth_hour: number | null;
  // 分，0-59
  birth_minute: number | null;
  // 秒，0-59
  birth_second: number | null;
  // 出生地时区，东区为正数，西区为负数，范围-12到+12
  time_zone_offset: number | null;
  // 出生时的夏令时，有夏令时：true，无夏令时：false
  is_dst: boolean | null;
  // 盘类型：本命盘（natal）或卜卦盘（horary）
  chart_type: ChartType | null;
  // 时间是否精准（仅本命盘有意义），true=已校对，false=未校对
  is_time_precise: boolean | null;
  // 地理位置信息
  location: LocationRequest | null;
  // 说明文字
  description: string | null;
  // 是否锁定
  lock: Boolean | null;
  // 所属用户ID
  user_id: number | null;
  // 所属联系人ID：未传(undefined)=不修改；null=解除关联；数值=设置关联
  person_id?: number | null;
  // 标签ID列表：未传(undefined)=不修改；数组=替换为该列表（空数组=清空全部）
  tag_ids?: number[] | null;
}

// 搜索请求接口
export interface SearchHoroscopeRequest {
  // 分页参数
  page: number;
  size: number;
  // 姓名（模糊搜索）
  name?: string;
  // 年（精确搜索）
  year?: number;
  // 月（精确搜索）
  month?: number;
  // 日（精确搜索）
  day?: number;
  // 时（用于时间搜索）
  hour?: number;
  // 分（用于时间搜索）
  minute?: number;
  // 秒（用于时间搜索）
  second?: number;
  // 盘类型：本命盘（natal）或卜卦盘（horary）
  chart_type?: ChartType;
  // 时间是否精准（仅本命盘有意义），true=已校对，false=未校对
  is_time_precise?: boolean;
  // 联系人名字（模糊搜索）
  person_name?: string;
  // 联系人微信号（模糊搜索）
  wechat_id?: string;
  // 联系人微信名（模糊搜索）
  wechat_name?: string;
  // 联系人抖音号（模糊搜索）
  douyin_id?: string;
  // 联系人抖音名（模糊搜索）
  douyin_name?: string;
  // 标签名（模糊搜索，匹配记录上挂载的任意标签）
  tag_name?: string;
}
