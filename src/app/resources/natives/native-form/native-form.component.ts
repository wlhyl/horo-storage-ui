import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Horoscope } from '../../../interfaces/horoscope';
import { TIME_ZONES } from '../../../constants/natives.constants';
import { Alert } from '../../../interfaces/alert';
import { AlertKind } from '../../../enum/alert';

@Component({
  selector: 'app-native-form',
  templateUrl: './native-form.component.html',
  styleUrls: ['./native-form.component.scss'],
  standalone: false
})
export class NativeFormComponent {
  @Input() native!: Horoscope;
  @Input() saving = false;
  zones = TIME_ZONES;
  alerts: Alert[] = [];

  constructor(public activeModal: NgbActiveModal) {}

  save() {
    this.alerts = [];
    
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
        message: '请输入姓名'
      });
      return false;
    }
    return true;
  }

  private validateTimeInfo(): boolean {
    const { birth_year, birth_month, birth_day, birth_hour, birth_minute, birth_second } = this.native;
    
    // 验证年份
    if (birth_year < 1900 || birth_year > 2100) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '年份必须在1900-2100之间'
      });
      return false;
    }

    // 验证月份
    if (birth_month < 1 || birth_month > 12) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '月份必须在1-12之间'
      });
      return false;
    }

    // 验证日期
    const maxDays = new Date(birth_year, birth_month, 0).getDate();
    if (birth_day < 1 || birth_day > maxDays) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: `日期必须在1-${maxDays}之间`
      });
      return false;
    }

    // 验证时间
    if (birth_hour < 0 || birth_hour > 23) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '小时必须在0-23之间'
      });
      return false;
    }

    if (birth_minute < 0 || birth_minute > 59) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '分钟必须在0-59之间'
      });
      return false;
    }

    if (birth_second < 0 || birth_second > 59) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '秒数必须在0-59之间'
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
        message: '请输入城市名'
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
        message: '经度不能超过180度'
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
        message: '纬度不能超过90度'
      });
      return false;
    }

    return true;
  }
}