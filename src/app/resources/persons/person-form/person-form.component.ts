import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Person, PersonRequest, UpdatePersonRequest } from '../../../interfaces/person';
import { Alert } from '../../../interfaces/alert';
import { AlertKind } from '../../../enum/alert';
import { ApiService } from '../../../services/api/api.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../interfaces/user';
import { getApiErrorMessage } from '../../../utils/api-error/api-error';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PersonFormComponent implements OnInit {
  @Input() person!: Person;
  users: User[] = [];
  isAdmin = false;
  isSubmitting = false;
  alerts: Alert[] = [];
  private originalPerson?: Person;

  constructor(
    public activeModal: NgbActiveModal,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.person.id > 0) {
      this.originalPerson = structuredClone(this.person);
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

  save() {
    this.alerts = [];

    if (!this.validateName()) {
      return;
    }

    this.executeSave();
  }

  private validateName(): boolean {
    const name = this.person.name?.trim() || '';
    if (name === '') {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '请输入名字',
      });
      return false;
    }
    if (name.length > 64) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '名字长度不能超过64个字符',
      });
      return false;
    }
    // 规范化：去除首尾空白
    this.person.name = name;
    return true;
  }

  private executeSave() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.person.id === 0) {
      this.addPerson();
    } else {
      this.updatePerson();
    }
  }

  private buildOptionalStringValue(current: string | null): string | null {
    // 表单中空字符串视为 null（清空）
    const trimmed = (current || '').trim();
    return trimmed === '' ? null : trimmed;
  }

  private addPerson() {
    const request: PersonRequest = {
      name: this.person.name,
      wechat_id: this.buildOptionalStringValue(this.person.wechat_id),
      wechat_name: this.buildOptionalStringValue(this.person.wechat_name),
      douyin_id: this.buildOptionalStringValue(this.person.douyin_id),
      douyin_name: this.buildOptionalStringValue(this.person.douyin_name),
      user_id: this.isAdmin ? this.person.user_id : undefined,
    };

    this.apiService.addPerson(request).subscribe({
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

  private updatePerson() {
    const original = this.originalPerson!;
    const current = this.person;

    const request: UpdatePersonRequest = {
      name: current.name === original.name ? undefined : current.name,
      wechat_id: this.diffOptionalString(current.wechat_id, original.wechat_id),
      wechat_name: this.diffOptionalString(current.wechat_name, original.wechat_name),
      douyin_id: this.diffOptionalString(current.douyin_id, original.douyin_id),
      douyin_name: this.diffOptionalString(current.douyin_name, original.douyin_name),
      // user_id 仅 admin 发送：未改=undefined（不发）；变化=新值（API 校验目标用户存在）
      user_id: this.isAdmin && current.user_id !== original.user_id
        ? current.user_id
        : undefined,
    };

    this.apiService.updatePerson(this.person.id, request).subscribe({
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

  // 三态对比可选字符串字段：
  // 规范化空字符串为 null 后再比较。
  // 未变 → undefined（不发）；变化 → 当前规范值（null=清空，string=设置）
  private diffOptionalString(
    current: string | null,
    original: string | null
  ): string | null | undefined {
    const normalizedCurrent = this.buildOptionalStringValue(current);
    const normalizedOriginal = original === null || original === undefined
      ? null
      : (original.trim() === '' ? null : original.trim());

    if (normalizedCurrent === normalizedOriginal) {
      return undefined;
    }
    return normalizedCurrent;
  }

  dismiss() {
    this.activeModal.dismiss();
  }
}
