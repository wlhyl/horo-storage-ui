import { Location, LocationRequest } from './location';

export interface HouseCusp {
  house_number: number;
  longitude_degree: number;
  longitude_minute: number;
  longitude_second: number;
}

export interface PlanetPosition {
  planet_name: string;
  longitude_degree: number;
  longitude_minute: number;
  longitude_second: number;
  latitude_degree: number;
  latitude_minute: number;
  latitude_second: number;
  latitude_north: boolean;
}

export interface HistoricalHoroscope {
  id: number;
  name: string;
  gender: boolean | null;
  description: string;
  year: number | null;
  month: number | null;
  day: number | null;
  hour: number | null;
  minute: number | null;
  second: number | null;
  is_julian: boolean | null;
  location: Location | null;
  time_zone_offset: number | null;
  is_dst: boolean | null;
  house_system: string | null;
  house_cusps: HouseCusp[];
  planet_positions: PlanetPosition[];
  created_at: string;
  updated_at: string | null;
  lock: boolean;
  user_id: number;
}

export interface HistoricalHoroscopeRequest {
  name: string;
  gender: boolean | null;
  description: string;
  year: number | null;
  month: number | null;
  day: number | null;
  hour: number | null;
  minute: number | null;
  second: number | null;
  is_julian: boolean | null;
  location: LocationRequest | null;
  time_zone_offset: number | null;
  is_dst: boolean | null;
  house_system: string | null;
  house_cusps: HouseCusp[];
  planet_positions: PlanetPosition[];
  lock: boolean;
}

export interface UpdateHistoricalHoroscopeRequest {
  name: string | null | undefined;
  gender: boolean | null | undefined;
  description: string | null | undefined;
  year: number | null | undefined;
  month: number | null | undefined;
  day: number | null | undefined;
  hour: number | null | undefined;
  minute: number | null | undefined;
  second: number | null | undefined;
  is_julian: boolean | null | undefined;
  location: LocationRequest | null | undefined;
  time_zone_offset: number | null | undefined;
  is_dst: boolean | null | undefined;
  house_system: string | null | undefined;
  house_cusps: HouseCusp[] | null | undefined;
  planet_positions: PlanetPosition[] | null | undefined;
  lock: boolean | null | undefined;
  user_id: number | null | undefined;
}
