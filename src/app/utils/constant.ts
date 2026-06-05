import { Horoscope } from '../interfaces/horoscope';
import { Location } from '../interfaces/location';
import {
  HistoricalHoroscope,
  HouseCusp,
  PlanetPosition,
} from '../interfaces/historical-horoscope';

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
  location: DEFAULT_LOCATION,
  description: '',
  created_at: '',
  updated_at: null,
  lock: false,
  user_id: 0,
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
