import { Horoscope } from '../interfaces/horoscope';
import { Location } from '../interfaces/location';

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
