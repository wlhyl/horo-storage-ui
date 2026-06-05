import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  HistoricalHoroscope,
  HistoricalHoroscopeRequest,
  UpdateHistoricalHoroscopeRequest,
  HouseCusp,
  PlanetPosition,
} from '../../../interfaces/historical-horoscope';
import {
  TIME_ZONES,
  PLANET_NAMES,
  DEFAULT_PLANET_POSITION,
  ZODIAC_SIGNS,
} from '../../../utils/constant';
import { Alert } from '../../../interfaces/alert';
import { AlertKind } from '../../../enum/alert';
import { ApiService } from '../../../services/api/api.service';
import {
  Location,
  LocationRequest,
} from '../../../interfaces/location';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../interfaces/user';
import { getApiErrorMessage } from '../../../utils/api-error/api-error';

@Component({
  selector: 'app-historical-form',
  templateUrl: './historical-form.component.html',
  styleUrls: ['./historical-form.component.scss'],
  standalone: false,
})
export class HistoricalFormComponent implements OnInit {
  @Input() horoscope!: HistoricalHoroscope;
  zones = TIME_ZONES;
  planetNames = PLANET_NAMES;
  zodiacSigns = ZODIAC_SIGNS;
  cuspLinkage = true;
  alerts: Alert[] = [];

  users: User[] = [];
  isAdmin = false;
  isSubmitting = false;
  private originalHoroscope?: HistoricalHoroscope;

  constructor(
    public activeModal: NgbActiveModal,
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.horoscope.id > 0) {
      this.originalHoroscope = structuredClone(this.horoscope);
    }
    this.checkAdmin();
    if (this.isAdmin) {
      this.getUsers();
    }
  }

  private checkAdmin(): void {
    const user = this.authService.user;
    this.isAdmin = user?.role === 'admin';
  }

  private getUsers(): void {
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        this.alerts.push({
          kind: AlertKind.DANGER,
          message: '查询用户列表失败: ' + getApiErrorMessage(error),
        });
      },
    });
  }

  get isLocked(): boolean {
    return this.horoscope.id > 0 && this.horoscope.lock;
  }

  initLocation() {
    this.horoscope.location = {
      id: 0,
      name: '',
      is_east: true,
      longitude_degree: 0,
      longitude_minute: 0,
      longitude_second: 0,
      is_north: true,
      latitude_degree: 0,
      latitude_minute: 0,
      latitude_second: 0,
    };
  }

  addPlanetPosition() {
    this.horoscope.planet_positions.push(
      structuredClone(DEFAULT_PLANET_POSITION),
    );
  }

  removePlanetPosition(index: number) {
    this.horoscope.planet_positions.splice(index, 1);
  }

  getPlanetLabel(planetName: string): string {
    const found = PLANET_NAMES.find((p) => p.value === planetName);
    return found ? found.label : planetName;
  }

  getSignIndex(degree: number): number {
    return Math.floor(degree / 30) % 12;
  }

  getSignDegree(degree: number): number {
    return degree % 30;
  }

  toAbsoluteDegree(signIndex: number, signDegree: number): number {
    return signIndex * 30 + signDegree;
  }

  onPlanetSignChange(planet: PlanetPosition, signIndex: number): void {
    planet.longitude_degree = this.toAbsoluteDegree(signIndex, this.getSignDegree(planet.longitude_degree));
  }

  onPlanetSignDegreeChange(planet: PlanetPosition, signDegree: number): void {
    planet.longitude_degree = this.toAbsoluteDegree(this.getSignIndex(planet.longitude_degree), signDegree);
  }

  onCuspSignChange(cusp: HouseCusp, signIndex: number): void {
    cusp.longitude_degree = this.toAbsoluteDegree(signIndex, this.getSignDegree(cusp.longitude_degree));
    this.linkOppositeCusp(cusp);
  }

  onCuspSignDegreeChange(cusp: HouseCusp, signDegree: number): void {
    cusp.longitude_degree = this.toAbsoluteDegree(this.getSignIndex(cusp.longitude_degree), signDegree);
    this.linkOppositeCusp(cusp);
  }

  onCuspMinuteChange(cusp: HouseCusp): void {
    this.linkOppositeCusp(cusp);
  }

  onCuspSecondChange(cusp: HouseCusp): void {
    this.linkOppositeCusp(cusp);
  }

  private linkOppositeCusp(cusp: HouseCusp): void {
    if (!this.cuspLinkage) return;
    const oppositeNum = ((cusp.house_number - 1 + 6) % 12) + 1;
    const oppositeCusp = this.horoscope.house_cusps.find(c => c.house_number === oppositeNum);
    if (!oppositeCusp) return;
    oppositeCusp.longitude_degree = (cusp.longitude_degree + 180) % 360;
    oppositeCusp.longitude_minute = cusp.longitude_minute;
    oppositeCusp.longitude_second = cusp.longitude_second;
  }

  save() {
    this.alerts = [];

    if (this.isLocked) {
      this.executeSave();
      return;
    }

    if (!this.validateName()) {
      return;
    }

    if (!this.validateHouseCusps()) {
      return;
    }

    if (!this.validatePlanetPositions()) {
      return;
    }

    this.executeSave();
  }

  private executeSave() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.horoscope.id === 0) {
      this.addHoroscope();
    } else {
      this.updateHoroscope();
    }
  }

  private addHoroscope() {
    const request: HistoricalHoroscopeRequest = {
      name: this.horoscope.name,
      gender: this.horoscope.gender,
      description: this.horoscope.description,
      year: this.horoscope.year,
      month: this.horoscope.month,
      day: this.horoscope.day,
      hour: this.horoscope.hour,
      minute: this.horoscope.minute,
      second: this.horoscope.second,
      is_julian: this.horoscope.is_julian,
      location: this.horoscope.location
        ? {
            name: this.horoscope.location.name,
            is_east: this.horoscope.location.is_east,
            longitude_degree: this.horoscope.location.longitude_degree,
            longitude_minute: this.horoscope.location.longitude_minute,
            longitude_second: this.horoscope.location.longitude_second,
            is_north: this.horoscope.location.is_north,
            latitude_degree: this.horoscope.location.latitude_degree,
            latitude_minute: this.horoscope.location.latitude_minute,
            latitude_second: this.horoscope.location.latitude_second,
          }
        : null,
      time_zone_offset: this.horoscope.time_zone_offset,
      is_dst: this.horoscope.is_dst,
      house_system: this.horoscope.house_system,
      house_cusps: this.horoscope.house_cusps,
      planet_positions: this.horoscope.planet_positions,
      lock: this.horoscope.lock,
    };

    this.apiService.addHistoricalHoroscope(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.activeModal.close('success');
      },
      error: (error) => {
        this.isSubmitting = false;
        this.alerts.push({
          kind: AlertKind.DANGER,
          message: '保存失败！' + getApiErrorMessage(error),
        });
      },
    });
  }

  private updateHoroscope() {
    const original = this.originalHoroscope;
    const current = this.horoscope;
    const isLocked = original?.lock ?? false;

    const request: UpdateHistoricalHoroscopeRequest = {
      name: isLocked
        ? undefined
        : current.name === original?.name
          ? undefined
          : current.name,
      gender: isLocked
        ? undefined
        : current.gender === original?.gender
          ? undefined
          : current.gender,
      description:
        current.description === original?.description
          ? undefined
          : current.description,
      year: isLocked
        ? undefined
        : current.year === original?.year
          ? undefined
          : current.year,
      month: isLocked
        ? undefined
        : current.month === original?.month
          ? undefined
          : current.month,
      day: isLocked
        ? undefined
        : current.day === original?.day
          ? undefined
          : current.day,
      hour: isLocked
        ? undefined
        : current.hour === original?.hour
          ? undefined
          : current.hour,
      minute: isLocked
        ? undefined
        : current.minute === original?.minute
          ? undefined
          : current.minute,
      second: isLocked
        ? undefined
        : current.second === original?.second
          ? undefined
          : current.second,
      is_julian: isLocked
        ? undefined
        : current.is_julian === original?.is_julian
          ? undefined
          : current.is_julian,
      location: isLocked
        ? undefined
        : this.isLocationChanged(current.location, original?.location),
      time_zone_offset: isLocked
        ? undefined
        : current.time_zone_offset === original?.time_zone_offset
          ? undefined
          : current.time_zone_offset,
      is_dst: isLocked
        ? undefined
        : current.is_dst === original?.is_dst
          ? undefined
          : current.is_dst,
      house_system: isLocked
        ? undefined
        : current.house_system === original?.house_system
          ? undefined
          : current.house_system,
      house_cusps: isLocked
        ? undefined
        : this.isHouseCuspsChanged(current.house_cusps, original?.house_cusps),
      planet_positions: isLocked
        ? undefined
        : this.isPlanetPositionsChanged(
            current.planet_positions,
            original?.planet_positions,
          ),
      lock: current.lock === original?.lock ? null : current.lock,
      user_id:
        this.isAdmin && current.user_id !== original?.user_id
          ? current.user_id
          : null,
    };

    this.apiService
      .updateHistoricalHoroscope(this.horoscope.id, request)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.activeModal.close('success');
        },
        error: (error) => {
          this.isSubmitting = false;
          this.alerts.push({
            kind: AlertKind.DANGER,
            message: '更新失败！' + getApiErrorMessage(error),
          });
        },
      });
  }

  dismiss() {
    this.activeModal.dismiss();
  }

  private validateName(): boolean {
    if (!this.horoscope.name?.trim()) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '请输入姓名',
      });
      return false;
    }
    return true;
  }

  private validateHouseCusps(): boolean {
    if (this.horoscope.house_cusps.length === 0) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '请填写宫头信息',
      });
      return false;
    }
    return true;
  }

  private validatePlanetPositions(): boolean {
    if (this.horoscope.planet_positions.length === 0) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '请至少添加一个行星位置',
      });
      return false;
    }
    return true;
  }

  private isLocationChanged(
    current: Location | null | undefined,
    original: Location | null | undefined,
  ): LocationRequest | null | undefined {
    if (!current && !original) return undefined;
    if (!current && original) return null;
    if (current && !original) {
      return this.toLocationRequest(current);
    }
    const cur = current!;
    const orig = original!;
    if (
      cur.name === orig.name &&
      cur.longitude_degree === orig.longitude_degree &&
      cur.latitude_degree === orig.latitude_degree &&
      cur.is_east === orig.is_east &&
      cur.longitude_minute === orig.longitude_minute &&
      cur.longitude_second === orig.longitude_second &&
      cur.is_north === orig.is_north &&
      cur.latitude_minute === orig.latitude_minute &&
      cur.latitude_second === orig.latitude_second
    ) {
      return undefined;
    }
    return this.toLocationRequest(cur);
  }

  private toLocationRequest(loc: Location): LocationRequest {
    return {
      name: loc.name,
      is_east: loc.is_east,
      longitude_degree: loc.longitude_degree,
      longitude_minute: loc.longitude_minute,
      longitude_second: loc.longitude_second,
      is_north: loc.is_north,
      latitude_degree: loc.latitude_degree,
      latitude_minute: loc.latitude_minute,
      latitude_second: loc.latitude_second,
    };
  }

  private isHouseCuspsChanged(
    current: HouseCusp[],
    original: HouseCusp[] | undefined,
  ): HouseCusp[] | undefined {
    if (!original) return current;
    if (current.length !== original.length) {
      return current;
    }
    const changed = current.some(
      (c, i) =>
        c.house_number !== original[i].house_number ||
        c.longitude_degree !== original[i].longitude_degree ||
        c.longitude_minute !== original[i].longitude_minute ||
        c.longitude_second !== original[i].longitude_second,
    );
    if (!changed) return undefined;
    return current;
  }

  private isPlanetPositionsChanged(
    current: PlanetPosition[],
    original: PlanetPosition[] | undefined,
  ): PlanetPosition[] | undefined {
    if (!original) return current;
    if (current.length !== original.length) {
      return current;
    }
    const changed = current.some(
      (c, i) =>
        c.planet_name !== original[i].planet_name ||
        c.longitude_degree !== original[i].longitude_degree ||
        c.longitude_minute !== original[i].longitude_minute ||
        c.longitude_second !== original[i].longitude_second ||
        c.latitude_degree !== original[i].latitude_degree ||
        c.latitude_minute !== original[i].latitude_minute ||
        c.latitude_second !== original[i].latitude_second ||
        c.latitude_north !== original[i].latitude_north,
    );
    if (!changed) return undefined;
    return current;
  }
}