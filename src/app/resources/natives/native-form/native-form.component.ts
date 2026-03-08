import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Horoscope, HoroscopeRequest, UpdateHoroscopeRequest } from '../../../interfaces/horoscope';
import { TIME_ZONES } from '../../../utils/constant';
import { Alert } from '../../../interfaces/alert';
import { AlertKind } from '../../../enum/alert';
import { ApiService } from '../../../services/api/api.service';
import { Location, LocationRequest, LongLatResponse } from '../../../interfaces/location';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-native-form',
  templateUrl: './native-form.component.html',
  styleUrls: ['./native-form.component.scss'],
  standalone: false,
})
export class NativeFormComponent implements OnInit {
  @Input() native!: Horoscope;
  zones = TIME_ZONES;
  alerts: Alert[] = [];
  queryingLocation = false;
  locationResults: LongLatResponse[] = [];
  showLocationResults = false;
  
  // 管理员相关属性
  users: User[] = [];
  isAdmin = false;
  isSubmitting = false;
  private originalNative?: Horoscope;

  constructor(
    public activeModal: NgbActiveModal,
    private apiService: ApiService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    if (this.native.id > 0) {
      this.originalNative = structuredClone(this.native);
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
          message:
            '查询用户列表失败: ' +
            (error.error?.message || error.message || '未知错误'),
        });
      },
    });
  }

  queryLocation() {
    const cityName = this.native.location.name?.trim();
    if (!cityName) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '请输入城市名',
      });
      return;
    }

    this.queryingLocation = true;
    this.apiService.getLongLat(cityName).subscribe({
      next: (response: LongLatResponse[]) => {
        this.queryingLocation = false;
        this.locationResults = response;
        this.showLocationResults = response.length > 0;

        if (!this.showLocationResults) {
          this.alerts.push({
            kind: AlertKind.WARNING,
            message: '未找到匹配的地理位置信息',
          });
        }
      },
      error: (error) => {
        this.queryingLocation = false;
        this.alerts.push({
          kind: AlertKind.DANGER,
          message:
            '查询地理位置失败: ' +
            (error.error?.message || error.message || '未知错误'),
        });
      },
    });
  }

  selectLocation(location: LongLatResponse) {
    try {
      // 解析经度
      const longitudeStr = location.longitude;
      const longitudeParts = this.parseCoordinate(longitudeStr);
      this.native.location.longitude_degree = longitudeParts.degree;
      this.native.location.longitude_minute = longitudeParts.minute;
      this.native.location.longitude_second = longitudeParts.second;
      this.native.location.is_east = longitudeParts.isPositive;

      // 解析纬度
      const latitudeStr = location.latitude;
      const latitudeParts = this.parseCoordinate(latitudeStr);
      this.native.location.latitude_degree = latitudeParts.degree;
      this.native.location.latitude_minute = latitudeParts.minute;
      this.native.location.latitude_second = latitudeParts.second;
      this.native.location.is_north = latitudeParts.isPositive;

      // 设置城市名
      this.native.location.name = location.name as string;

      // 隐藏结果列表
      this.showLocationResults = false;

      this.alerts.push({
        kind: AlertKind.SUCCESS,
        message: `成功获取 ${location.name} 的地理位置信息`,
      });
    } catch (e: any) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '解析地理位置数据失败: ' + (e.message || '未知错误'),
      });
    }
  }

  private parseCoordinate(coordinateStr: string): {
    degree: number;
    minute: number;
    second: number;
    isPositive: boolean;
  } {
    // 确保输入严格是一个数字
    const value = Number(coordinateStr);
    if (isNaN(value)) {
      throw new Error(`无法解析坐标格式: ${coordinateStr}`);
    }

    const isPositive = value >= 0;
    const absValue = Math.abs(value);

    const degree = Math.floor(absValue);
    const minuteValue = (absValue - degree) * 60;
    const minute = Math.floor(minuteValue);
    const second = Math.round((minuteValue - minute) * 60);

    return {
      degree,
      minute,
      second,
      isPositive,
    };
  }

  save() {
    this.alerts = [];

    // 如果是编辑已锁定的记录，只验证描述和锁定状态
    if (this.native.id > 0 && this.native.lock) {
      this.executeSave();
      return;
    }

    // 验证基本信息
    if (!this.validateBasicInfo()) {
      return;
    }

    // 验证时间信息
    if (!this.validateTimeInfo()) {
      return;
    }

    // 验证地理位置
    if (!this.validateLocation()) {
      return;
    }

    this.executeSave();
  }

  private executeSave() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.native.id === 0) {
      this.addHoroscope();
    } else {
      this.updateHoroscope();
    }
  }

  private addHoroscope() {
    const request: HoroscopeRequest = {
      name: this.native.name,
      gender: this.native.gender,
      birth_year: this.native.birth_year,
      birth_month: this.native.birth_month,
      birth_day: this.native.birth_day,
      birth_hour: this.native.birth_hour,
      birth_minute: this.native.birth_minute,
      birth_second: this.native.birth_second,
      time_zone_offset: this.native.time_zone_offset,
      is_dst: this.native.is_dst,
      location: {
        ...this.native.location,
      },
      description: this.native.description,
      lock: this.native.lock,
    };

    this.apiService.addHoroscope(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.activeModal.close('success');
      },
      error: (error) => {
        this.isSubmitting = false;
        let message = '保存失败！';
        if (error.error?.error) {
          message += error.error.error;
        }
        this.alerts.push({
          kind: AlertKind.DANGER,
          message,
        });
      },
    });
  }

  private updateHoroscope() {
    const original = this.originalNative;
    const current = this.native;
    const isLocked = original?.lock ?? false;

    const request: UpdateHoroscopeRequest = {
      name: isLocked ? null : (current.name === original?.name ? null : current.name),
      gender: isLocked ? null : (current.gender === original?.gender ? null : current.gender),
      birth_year: isLocked ? null : (current.birth_year === original?.birth_year ? null : current.birth_year),
      birth_month: isLocked ? null : (current.birth_month === original?.birth_month ? null : current.birth_month),
      birth_day: isLocked ? null : (current.birth_day === original?.birth_day ? null : current.birth_day),
      birth_hour: isLocked ? null : (current.birth_hour === original?.birth_hour ? null : current.birth_hour),
      birth_minute: isLocked ? null : (current.birth_minute === original?.birth_minute ? null : current.birth_minute),
      birth_second: isLocked ? null : (current.birth_second === original?.birth_second ? null : current.birth_second),
      time_zone_offset: isLocked ? null : (current.time_zone_offset === original?.time_zone_offset ? null : current.time_zone_offset),
      is_dst: isLocked ? null : (current.is_dst === original?.is_dst ? null : current.is_dst),
      location: isLocked ? null : this.isLocationChanged(current.location, original?.location),
      description: current.description === original?.description ? null : current.description,
      lock: current.lock === original?.lock ? null : current.lock,
      user_id: this.isAdmin && current.user_id !== original?.user_id ? current.user_id : null,
    };

    this.apiService.updateHoroscope(this.native.id, request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.activeModal.close('success');
      },
      error: (error) => {
        this.isSubmitting = false;
        let message = '更新失败！';
        if (error.error?.error) {
          message += error.error.error;
        }
        this.alerts.push({
          kind: AlertKind.DANGER,
          message,
        });
      },
    });
  }

  dismiss() {
    this.activeModal.dismiss();
  }

  private validateBasicInfo(): boolean {
    if (!this.native.name?.trim()) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '请输入姓名',
      });
      return false;
    }
    return true;
  }

  private validateTimeInfo(): boolean {
    const {
      birth_year,
      birth_month,
      birth_day,
      birth_hour,
      birth_minute,
      birth_second,
    } = this.native;

    // 验证年份
    if (birth_year < 1900 || birth_year > 2100) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '年份必须在1900-2100之间',
      });
      return false;
    }

    // 验证月份
    if (birth_month < 1 || birth_month > 12) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '月份必须在1-12之间',
      });
      return false;
    }

    // 验证日期
    const maxDays = new Date(birth_year, birth_month, 0).getDate();
    if (birth_day < 1 || birth_day > maxDays) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: `日期必须在1-${maxDays}之间`,
      });
      return false;
    }

    // 验证时间
    if (birth_hour < 0 || birth_hour > 23) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '小时必须在0-23之间',
      });
      return false;
    }

    if (birth_minute < 0 || birth_minute > 59) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '分钟必须在0-59之间',
      });
      return false;
    }

    if (birth_second < 0 || birth_second > 59) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '秒数必须在0-59之间',
      });
      return false;
    }

    return true;
  }

  private validateLocation(): boolean {
    const location = this.native.location;

    // 验证城市名
    if (!location.name?.trim()) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '请输入城市名',
      });
      return false;
    }

    // 验证经度
    const longitude =
      location.longitude_degree +
      location.longitude_minute / 60 +
      location.longitude_second / 3600;

    if (longitude > 180) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '经度不能超过180度',
      });
      return false;
    }

    // 验证纬度
    const latitude =
      location.latitude_degree +
      location.latitude_minute / 60 +
      location.latitude_second / 3600;

    if (latitude > 90) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '纬度不能超过90度',
      });
      return false;
    }

    return true;
  }

  private isLocationChanged(
    current: Location | undefined,
    original: Location | undefined
  ): LocationRequest | null {
    if (!current || !original) {
      return null;
    }
    if (
      current.name === original.name &&
      current.longitude_degree === original.longitude_degree &&
      current.latitude_degree === original.latitude_degree &&
      current.is_east === original.is_east &&
      current.longitude_minute === original.longitude_minute &&
      current.longitude_second === original.longitude_second &&
      current.is_north === original.is_north &&
      current.latitude_minute === original.latitude_minute &&
      current.latitude_second === original.latitude_second
    ) {
      return null;
    }
    return {
      name: current.name,
      is_east: current.is_east,
      longitude_degree: current.longitude_degree,
      longitude_minute: current.longitude_minute,
      longitude_second: current.longitude_second,
      is_north: current.is_north,
      latitude_degree: current.latitude_degree,
      latitude_minute: current.latitude_minute,
      latitude_second: current.latitude_second,
    };
  }
}
