import { Horoscope } from '../interfaces/horoscope';
import { Location } from '../interfaces/location';
import {
  HistoricalHoroscope,
  HouseCusp,
  PlanetPosition,
} from '../interfaces/historical-horoscope';
import { Dice } from '../interfaces/dice';
import { ChartType } from '../enum/chart-type';

export const DEFAULT_LOCATION: Location = {
  id: 0,
  name: '',
  longitude_degree: 0,
  latitude_degree: 0,
  is_east: true,
  longitude_minute: 0,
  longitude_second: 0,
  is_north: true,
  latitude_minute: 0,
  latitude_second: 0,
};

export const DEFAULT_NATIVE: Horoscope = {
  id: 0,
  name: '',
  gender: true,
  birth_year: 0,
  birth_month: 0,
  birth_day: 0,
  birth_hour: 0,
  birth_minute: 0,
  birth_second: 0,
  time_zone_offset: 0,
  is_dst: false,
  chart_type: ChartType.Natal,
  is_time_precise: false,
  location: DEFAULT_LOCATION,
  description: '',
  created_at: '',
  updated_at: null,
  lock: false,
  user_id: 0,
  person: null,
  tags: [],
};

export const PAGE_SIZE = 10;
export const TIME_ZONES = [...Array(25)].map((_, i) => i - 12).reverse();

export const ZODIAC_SIGNS = [
  { value: 0, label: '白羊' },
  { value: 1, label: '金牛' },
  { value: 2, label: '双子' },
  { value: 3, label: '巨蟹' },
  { value: 4, label: '狮子' },
  { value: 5, label: '处女' },
  { value: 6, label: '天秤' },
  { value: 7, label: '天蝎' },
  { value: 8, label: '射手' },
  { value: 9, label: '摩羯' },
  { value: 10, label: '水瓶' },
  { value: 11, label: '双鱼' },
];

export const PLANET_NAMES = [
  { value: 'Saturn', label: '土星' },
  { value: 'Jupiter', label: '木星' },
  { value: 'Mars', label: '火星' },
  { value: 'Sun', label: '太阳' },
  { value: 'Venus', label: '金星' },
  { value: 'Mercury', label: '水星' },
  { value: 'Moon', label: '月亮' },
  { value: 'NorthNode', label: '北交点' },
  { value: 'SouthNode', label: '南交点' },
  { value: 'PartOfFortune', label: '福点' },
];

// 骰子可用的西洋行星（传统七行星与南北交点），存储 API 枚举名
export const DICE_PLANETS = [
  { value: 'Sun', label: '太阳' },
  { value: 'Moon', label: '月亮' },
  { value: 'Mercury', label: '水星' },
  { value: 'Venus', label: '金星' },
  { value: 'Mars', label: '火星' },
  { value: 'Jupiter', label: '木星' },
  { value: 'Saturn', label: '土星' },
  { value: 'NorthNode', label: '北交点' },
  { value: 'SouthNode', label: '南交点' },
];

// 骰子可用的七政四余十一曜，存储单字
export const QIZHENG_DICE_PLANETS = [
  { value: '日', label: '太阳' },
  { value: '月', label: '月亮' },
  { value: '水', label: '水星' },
  { value: '金', label: '金星' },
  { value: '火', label: '火星' },
  { value: '木', label: '木星' },
  { value: '土', label: '土星' },
  { value: '计', label: '计都' },
  { value: '罗', label: '罗喉' },
  { value: '孛', label: '月孛' },
  { value: '气', label: '紫气' },
];

const DEFAULT_HOUSE_CUSPS: HouseCusp[] = Array.from({ length: 12 }, (_, i) => ({
  house_number: i + 1,
  longitude_degree: 0,
  longitude_minute: 0,
  longitude_second: 0,
}));

export const DEFAULT_PLANET_POSITION: PlanetPosition = {
  planet_name: 'Saturn',
  longitude_degree: 0,
  longitude_minute: 0,
  longitude_second: 0,
  latitude_degree: 0,
  latitude_minute: 0,
  latitude_second: 0,
  latitude_north: true,
  is_retrograde: false,
};

export const DEFAULT_HISTORICAL_HOROSCOPE: HistoricalHoroscope = {
  id: 0,
  name: '',
  gender: null,
  chart_type: ChartType.Natal,
  description: '',
  year: null,
  month: null,
  day: null,
  hour: null,
  minute: null,
  second: null,
  is_julian: null,
  location: null,
  time_zone_offset: null,
  is_dst: null,
  house_system: null,
  house_cusps: structuredClone(DEFAULT_HOUSE_CUSPS),
  planet_positions: [structuredClone(DEFAULT_PLANET_POSITION)],
  created_at: '',
  updated_at: null,
  lock: false,
  user_id: 0,
};

export const DEFAULT_DICE: Dice = {
  id: 0,
  year: 0,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  time_zone_offset: 0,
  planet: 'Sun',
  zodiac: 0,
  house: 1,
  is_qizheng: false,
  matter: '',
  description: '',
  created_at: '',
  updated_at: null,
  lock: false,
  user_id: 0,
};
