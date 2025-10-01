import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Horoscope } from '../../../interfaces/horoscope';
import { TIME_ZONES } from '../../../utils/constant';
import { Alert } from '../../../interfaces/alert';
import { AlertKind } from '../../../enum/alert';
import { ApiService } from '../../../services/api/api.service';
import { LongLatResponse } from '../../../interfaces/location';

@Component({
  selector: 'app-native-form',
  templateUrl: './native-form.component.html',
  styleUrls: ['./native-form.component.scss'],
  standalone: false,
})
export class NativeFormComponent {
  @Input() native!: Horoscope;
  @Input() saving = false;
  zones = TIME_ZONES;
  alerts: Alert[] = [];
  queryingLocation = false;
  locationResults: LongLatResponse[] = [];
  showLocationResults = false;

  constructor(
    public activeModal: NgbActiveModal,
    private apiService: ApiService
  ) {}

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

  private parseAndSetLocation(response: LongLatResponse) {
    try {
      // 解析经度
      const longitudeStr = response.longitude;
      const longitudeParts = this.parseCoordinate(longitudeStr);
      this.native.location.longitude_degree = longitudeParts.degree;
      this.native.location.longitude_minute = longitudeParts.minute;
      this.native.location.longitude_second = longitudeParts.second;
      this.native.location.is_east = longitudeParts.isPositive;

      // 解析纬度
      const latitudeStr = response.latitude;
      const latitudeParts = this.parseCoordinate(latitudeStr);
      this.native.location.latitude_degree = latitudeParts.degree;
      this.native.location.latitude_minute = latitudeParts.minute;
      this.native.location.latitude_second = latitudeParts.second;
      this.native.location.is_north = latitudeParts.isPositive;

      this.alerts.push({
        kind: AlertKind.SUCCESS,
        message: `成功获取 ${response.name} 的地理位置信息`,
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
      // 对于已锁定的记录，只允许更新描述和锁定状态
      // 其他字段保持原值，不需要验证
      this.activeModal.close(this.native);
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

    this.activeModal.close(this.native);
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
}
