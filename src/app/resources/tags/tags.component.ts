import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Alert } from '../../interfaces/alert';
import { PageResponser } from '../../interfaces/page';
import { Tag } from '../../interfaces/tag';
import { User } from '../../interfaces/user';
import { ApiService } from '../../services/api/api.service';
import { AuthService } from '../../services/auth/auth.service';
import { AlertKind } from '../../enum/alert';
import { PAGE_SIZE } from '../../utils/constant';
import { getApiErrorMessage } from '../../utils/api-error/api-error';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TagFormComponent } from './tag-form/tag-form.component';
import { ConfirmModalComponent } from '../../common/confirm/confirm-modal.component';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TagsComponent implements OnInit {
  page = 0;
  size = PAGE_SIZE;
  message: Array<Alert> = [];

  deleting = 0;
  refreshing = false;

  tags: PageResponser<Array<Tag>> = {
    data: [],
    total: 0,
  };

  // admin 用于在列表显示所属用户名
  usersMap: Map<number, User> = new Map();

  get isAdmin(): boolean {
    const user = this.authService.user;
    return user?.role === 'admin';
  }

  constructor(
    private api: ApiService,
    private titleService: Title,
    private modalService: NgbModal,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('标签列表');
    this.getTags();
    if (this.isAdmin) {
      this.getUsers();
    }
  }

  // 标签全局共享可见，但修改/删除仅限创建者或admin
  canOperate(tag: Tag): boolean {
    return this.isAdmin || tag.user_id === this.authService.user?.id;
  }

  getTags() {
    if (this.refreshing) {
      return;
    }

    this.message = [];
    this.refreshing = true;
    this.api
      .getTags(this.page, this.size)
      .subscribe({
        next: (response) => (this.tags = response),
        error: (error) => {
          this.message.push({
            kind: AlertKind.DANGER,
            message: '获取标签失败！' + getApiErrorMessage(error),
          });
        },
      })
      .add(() => {
        this.refreshing = false;
        // 当前页被删空后自动回退到第一页
        if (this.tags.data.length === 0 && this.page > 0) {
          this.page = 0;
          this.getTags();
        }
      });
  }

  private getUsers() {
    this.api.getUsers().subscribe({
      next: (users) => {
        this.usersMap = new Map(users.map((u) => [u.id, u]));
      },
      error: (error) => {
        this.message.push({
          kind: AlertKind.DANGER,
          message: '查询用户列表失败: ' + getApiErrorMessage(error),
        });
      },
    });
  }

  getUserName(id: number): string {
    return this.usersMap.get(id)?.username || String(id);
  }

  edit(id: number) {
    if (this.refreshing) {
      return;
    }
    if (this.modalService.hasOpenModals()) {
      return;
    }
    const tag = this.tags.data.find((t) => t.id === id);
    if (!tag) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '记录不存在或已被更新，请刷新列表后重试！',
      });
      return;
    }
    if (!this.canOperate(tag)) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '仅创建者或管理员可修改标签！',
      });
      return;
    }
    this.openTagForm(structuredClone(tag));
  }

  delete(id: number) {
    if (this.refreshing) {
      return;
    }
    if (this.modalService.hasOpenModals()) {
      return;
    }
    const tag = this.tags.data.find((t) => t.id === id);
    if (!tag) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '记录不存在！',
      });
      return;
    }
    if (!this.canOperate(tag)) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '仅创建者或管理员可删除标签！',
      });
      return;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.message = `确定要删除标签 "${tag.name}" 吗？`;

    modalRef.result.then(
      (confirmed: boolean) => {
        if (confirmed) {
          this.executeDelete(id);
        }
      },
      () => {}
    );
  }

  private executeDelete(id: number) {
    this.message = [];
    this.deleting = id;
    this.api
      .deleteTag(id)
      .subscribe({
        next: () => {
          this.getTags();
        },
        error: (error) => {
          this.message.push({
            kind: AlertKind.DANGER,
            message: '删除标签失败！' + getApiErrorMessage(error),
          });
        },
      })
      .add(() => (this.deleting = 0));
  }

  pageChange(page: number) {
    this.page = page;
    this.getTags();
  }

  showAddForm() {
    if (this.refreshing) {
      return;
    }
    if (this.modalService.hasOpenModals()) {
      return;
    }
    const tag: Tag = {
      id: 0,
      name: '',
      user_id: this.authService.user?.id || 0,
      created_at: '',
      updated_at: null,
    };
    this.openTagForm(tag);
  }

  private openTagForm(tag: Tag) {
    const modalRef = this.modalService.open(TagFormComponent, {
      backdrop: 'static',
    });

    modalRef.componentInstance.tag = tag;

    modalRef.result.then(
      (result: string) => {
        if (result === 'success') {
          this.getTags();
        }
      },
      () => {}
    );
  }
}
