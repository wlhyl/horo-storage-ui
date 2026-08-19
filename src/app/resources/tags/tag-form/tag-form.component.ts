import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Tag, TagRequest, UpdateTagRequest } from '../../../interfaces/tag';
import { Alert } from '../../../interfaces/alert';
import { AlertKind } from '../../../enum/alert';
import { ApiService } from '../../../services/api/api.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../interfaces/user';
import { getApiErrorMessage } from '../../../utils/api-error/api-error';

@Component({
  selector: 'app-tag-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TagFormComponent implements OnInit {
  @Input() tag!: Tag;
  users: User[] = [];
  isAdmin = false;
  isSubmitting = false;
  alerts: Alert[] = [];
  private originalTag?: Tag;

  constructor(
    public activeModal: NgbActiveModal,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.tag.id > 0) {
      this.originalTag = structuredClone(this.tag);
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
    const name = this.tag.name?.trim() || '';
    if (name === '') {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '请输入标签名',
      });
      return false;
    }
    if (name.length > 30) {
      this.alerts.push({
        kind: AlertKind.DANGER,
        message: '标签名长度不能超过30个字符',
      });
      return false;
    }
    // 规范化：去除首尾空白
    this.tag.name = name;
    return true;
  }

  private executeSave() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.tag.id === 0) {
      this.addTag();
    } else {
      this.updateTag();
    }
  }

  private addTag() {
    const request: TagRequest = {
      name: this.tag.name,
      user_id: this.isAdmin ? this.tag.user_id : undefined,
    };

    this.apiService.addTag(request).subscribe({
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

  private updateTag() {
    const original = this.originalTag!;
    const current = this.tag;

    const request: UpdateTagRequest = {
      // 标签名未变不发送（全局唯一，避免无效查重）
      name: current.name === original.name ? undefined : current.name,
      // user_id 仅 admin 发送：未改=undefined（不发）；变化=新值（API 校验目标用户存在）
      user_id: this.isAdmin && current.user_id !== original.user_id
        ? current.user_id
        : undefined,
    };

    // 未做任何修改时不发起请求（API 要求至少一个字段）
    if (request.name === undefined && request.user_id === undefined) {
      this.isSubmitting = false;
      this.alerts.push({
        kind: AlertKind.WARNING,
        message: '未做任何修改',
      });
      return;
    }

    this.apiService.updateTag(this.tag.id, request).subscribe({
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
