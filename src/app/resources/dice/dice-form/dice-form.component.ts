import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Dice, DiceRequest, UpdateDiceRequest } from '../../../interfaces/dice';
import {
  TIME_ZONES,
  DICE_PLANETS,
  QIZHENG_DICE_PLANETS,
  ZODIAC_SIGNS,
} from '../../../utils/constant';
import { Alert } from '../../../interfaces/alert';
import { AlertKind } from '../../../enum/alert';
import { ApiService } from '../../../services/api/api.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../interfaces/user';
import { getApiErrorMessage } from '../../../utils/api-error/api-error';

@Component({
  selector: 'app-dice-form',
  templateUrl: './dice-form.component.html',
  styleUrls: ['./dice-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DiceFormComponent implements OnInit {
  @Input() dice!: Dice;
  zones = TIME_ZONES;
  zodiacSigns = ZODIAC_SIGNS;
  alerts: Alert[] = [];

  users: User[] = [];
  isAdmin = false;
  isSubmitting = false;
  private originalDice?: Dice;

  constructor(
    public activeModal: NgbActiveModal,
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.dice.id > 0) {
      this.originalDice = structuredClone(this.dice);
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
    // 以打开表单时的锁定状态为准：锁定记录取消勾选后其余字段仍保持禁用，
    // 保存时仅提交描述与锁定状态，避免后端拒绝导致无法解锁
    return this.originalDice?.lock ?? false;
  }

  // 当前体系可选的行星（占星/七政四余）
  get planetOptions(): Array<{ value: string; label: string }> {
    return this.dice.is_qizheng ? QIZHENG_DICE_PLANETS : DICE_PLANETS;
  }

  // 切换体系时重置行星为该体系第一项
  onSystemChange() {
    this.dice.planet = this.planetOptions[0].value;
  }

  save() {
    this.alerts = [];

    if (!this.validate()) {
      return;
    }

    this.executeSave();
  }

  private validate(): boolean {
    if (!this.dice.matter?.trim()) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '请输入事项',
      });
      return false;
    }

    if (this.dice.matter.trim().length > 255) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '事项长度不能超过255个字符',
      });
      return false;
    }

    if (!this.dice.year || this.dice.year < 1900) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '年份最小为1900',
      });
      return false;
    }

    if (this.dice.month < 1 || this.dice.month > 12) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '月份需在1-12之间',
      });
      return false;
    }

    if (this.dice.day < 1 || this.dice.day > 31) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '日期需在1-31之间',
      });
      return false;
    }

    if (this.dice.hour < 0 || this.dice.hour > 23) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '小时需在0-23之间',
      });
      return false;
    }

    if (this.dice.minute < 0 || this.dice.minute > 59) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '分钟需在0-59之间',
      });
      return false;
    }

    if (this.dice.second < 0 || this.dice.second > 59) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '秒数需在0-59之间',
      });
      return false;
    }

    if (this.dice.time_zone_offset < -12 || this.dice.time_zone_offset > 12) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '时区需在-12到+12之间',
      });
      return false;
    }

    return true;
  }

  private executeSave() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.dice.id === 0) {
      this.addDice();
    } else {
      this.updateDice();
    }
  }

  private addDice() {
    const request: DiceRequest = {
      year: this.dice.year,
      month: this.dice.month,
      day: this.dice.day,
      hour: this.dice.hour,
      minute: this.dice.minute,
      second: this.dice.second,
      time_zone_offset: this.dice.time_zone_offset,
      planet: this.dice.planet,
      zodiac: this.dice.zodiac,
      house: this.dice.house,
      is_qizheng: this.dice.is_qizheng,
      matter: this.dice.matter.trim(),
      description: this.dice.description,
      lock: this.dice.lock,
    };

    // 归属用户仅 admin 可指定
    if (this.isAdmin) {
      request.user_id = this.dice.user_id;
    }

    this.apiService.addDice(request).subscribe({
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

  private updateDice() {
    const request: UpdateDiceRequest = {};

    if (this.isLocked) {
      // 锁定状态下仅允许修改描述和锁定状态
      request.description = this.dice.description;
      request.lock = this.dice.lock;
    } else {
      request.year = this.dice.year;
      request.month = this.dice.month;
      request.day = this.dice.day;
      request.hour = this.dice.hour;
      request.minute = this.dice.minute;
      request.second = this.dice.second;
      request.time_zone_offset = this.dice.time_zone_offset;
      request.planet = this.dice.planet;
      request.zodiac = this.dice.zodiac;
      request.house = this.dice.house;
      request.is_qizheng = this.dice.is_qizheng;
      request.matter = this.dice.matter.trim();
      request.description = this.dice.description;
      request.lock = this.dice.lock;

      // 所属用户仅 admin 可修改
      if (this.isAdmin) {
        request.user_id = this.dice.user_id;
      }
    }

    this.apiService
      .updateDice(this.dice.id, request)
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
}
