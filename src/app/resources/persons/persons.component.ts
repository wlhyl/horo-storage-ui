import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Alert } from '../../interfaces/alert';
import { PageResponser } from '../../interfaces/page';
import { Person } from '../../interfaces/person';
import { User } from '../../interfaces/user';
import { ApiService } from '../../services/api/api.service';
import { AuthService } from '../../services/auth/auth.service';
import { AlertKind } from '../../enum/alert';
import { PAGE_SIZE } from '../../utils/constant';
import { getApiErrorMessage } from '../../utils/api-error/api-error';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PersonFormComponent } from './person-form/person-form.component';
import { ConfirmModalComponent } from '../../common/confirm/confirm-modal.component';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrl: './persons.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PersonsComponent implements OnInit {
  page = 0;
  size = PAGE_SIZE;
  message: Array<Alert> = [];

  deleting = 0;
  refreshing = false;

  persons: PageResponser<Array<Person>> = {
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
    this.titleService.setTitle('联系人列表');
    this.getPersons();
    if (this.isAdmin) {
      this.getUsers();
    }
  }

  getPersons() {
    if (this.refreshing) {
      return;
    }

    this.message = [];
    this.refreshing = true;
    this.api
      .getPersons(this.page, this.size)
      .subscribe({
        next: (response) => (this.persons = response),
        error: (error) => {
          this.message.push({
            kind: AlertKind.DANGER,
            message: '获取联系人失败！' + getApiErrorMessage(error),
          });
        },
      })
      .add(() => {
        this.refreshing = false;
        // 当前页被删空后自动回退到第一页
        if (this.persons.data.length === 0 && this.page > 0) {
          this.page = 0;
          this.getPersons();
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
    const person = this.persons.data.find((p) => p.id === id);
    if (!person) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '记录不存在或已被更新，请刷新列表后重试！',
      });
      return;
    }
    this.openPersonForm(structuredClone(person));
  }

  delete(id: number) {
    if (this.refreshing) {
      return;
    }
    if (this.modalService.hasOpenModals()) {
      return;
    }
    const person = this.persons.data.find((p) => p.id === id);
    if (!person) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '记录不存在！',
      });
      return;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.message = `确定要删除联系人 "${person.name}" 吗？`;

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
      .deletePerson(id)
      .subscribe({
        next: () => {
          this.getPersons();
        },
        error: (error) => {
          this.message.push({
            kind: AlertKind.DANGER,
            message: '删除联系人失败！' + getApiErrorMessage(error),
          });
        },
      })
      .add(() => (this.deleting = 0));
  }

  pageChange(page: number) {
    this.page = page;
    this.getPersons();
  }

  showAddForm() {
    if (this.refreshing) {
      return;
    }
    if (this.modalService.hasOpenModals()) {
      return;
    }
    const person: Person = {
      id: 0,
      name: '',
      wechat_id: null,
      wechat_name: null,
      douyin_id: null,
      douyin_name: null,
      user_id: this.authService.user?.id || 0,
      created_at: '',
      updated_at: null,
    };
    this.openPersonForm(person);
  }

  private openPersonForm(person: Person) {
    const modalRef = this.modalService.open(PersonFormComponent, {
      backdrop: 'static',
    });

    modalRef.componentInstance.person = person;

    modalRef.result.then(
      (result: string) => {
        if (result === 'success') {
          this.getPersons();
        }
      },
      () => {}
    );
  }
}
