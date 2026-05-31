import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Alert } from '../../interfaces/alert';
import { PageResponser } from '../../interfaces/page';
import {
  HistoricalHoroscope,
} from '../../interfaces/historical-horoscope';
import { SearchHoroscopeRequest } from '../../interfaces/horoscope';
import { ApiService } from '../../services/api/api.service';
import { AuthService } from '../../services/auth/auth.service';
import { AlertKind } from '../../enum/alert';
import { PAGE_SIZE, DEFAULT_HISTORICAL_HOROSCOPE } from '../../utils/constant';
import { buildSearchParams } from '../../utils/search';
import { getApiErrorMessage } from '../../utils/api-error/api-error';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistoricalFormComponent } from './historical-form/historical-form.component';
import { ConfirmModalComponent } from '../../common/confirm/confirm-modal.component';

@Component({
  selector: 'app-historical',
  templateUrl: './historical.component.html',
  styleUrl: './historical.component.scss',
  standalone: false,
})
export class HistoricalComponent implements OnInit {
  page = 0;
  size = PAGE_SIZE;
  message: Array<Alert> = [];

  deleting = 0;
  refreshing = false;
  isSearchMode = false;

  horoscopes: PageResponser<Array<HistoricalHoroscope>> = {
    data: [],
    total: 0,
  };

  searchParams: SearchHoroscopeRequest = {
    page: 0,
    size: PAGE_SIZE,
    name: undefined,
    year: undefined,
    month: undefined,
    day: undefined,
    hour: undefined,
    minute: undefined,
    second: undefined,
  };

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
    this.titleService.setTitle('古代星盘列表');
    this.getHoroscopes();
  }

  getHoroscopes() {
    if (this.refreshing) {
      return;
    }

    this.message = [];
    this.refreshing = true;
    this.isSearchMode = false;
    this.api
      .getHistoricalHoroscopes(this.page, this.size)
      .subscribe({
        next: (response) => (this.horoscopes = response),
        error: (error) => {
          this.message.push({
            kind: AlertKind.DANGER,
            message: '获取古代星盘失败！' + getApiErrorMessage(error),
          });
        },
      })
      .add(() => {
        this.refreshing = false;
      });
  }

  private buildSearchParams() {
    return buildSearchParams(this.searchParams);
  }

  search() {
    if (this.refreshing) {
      return;
    }

    this.message = [];

    const filteredParams = this.buildSearchParams();

    if (!filteredParams.hasSearchConditions) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '请至少输入一个搜索条件（姓名、年、月、日、时）',
      });
      return;
    }

    this.refreshing = true;
    this.isSearchMode = true;

    this.api
      .searchHistoricalHoroscopes(filteredParams.params)
      .subscribe({
        next: (response) => {
          this.horoscopes = response;
        },
        error: (error) => {
          this.message.push({
            kind: AlertKind.DANGER,
            message: '搜索失败！' + getApiErrorMessage(error),
          });
        },
      })
      .add(() => {
        this.refreshing = false;
      });
  }

  resetSearch() {
    this.searchParams = {
      page: 0,
      size: PAGE_SIZE,
      name: undefined,
      year: undefined,
      month: undefined,
      day: undefined,
      hour: undefined,
      minute: undefined,
      second: undefined,
    };
    this.page = 0;
    this.getHoroscopes();
  }

  edit(id: number) {
    if (this.refreshing) {
      return;
    }
    const horoscope = this.horoscopes.data.find((h) => h.id === id);
    if (horoscope) {
      this.openForm(structuredClone(horoscope));
    }
  }

  delete(id: number) {
    const horoscope = this.horoscopes.data.find((h) => h.id === id);
    if (!horoscope) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '记录不存在！',
      });
      return;
    }

    if (horoscope.lock) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '已锁定的记录不能删除！',
      });
      return;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.message = `确定要删除 "${horoscope.name}" 这条记录吗？`;

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
      .deleteHistoricalHoroscope(id)
      .subscribe({
        next: () => {
          if (this.isSearchMode) {
            this.search();
          } else {
            this.getHoroscopes();
          }
        },
        error: (error) => {
          this.message.push({
            kind: AlertKind.DANGER,
            message: '删除古代星盘失败！' + getApiErrorMessage(error),
          });
        },
      })
      .add(() => (this.deleting = 0));
  }

  pageChange(page: number) {
    if (this.isSearchMode) {
      this.searchParams.page = page;
      this.search();
    } else {
      this.page = page;
      this.getHoroscopes();
    }
  }

  showAddForm() {
    if (this.refreshing) {
      return;
    }
    const horoscope = structuredClone(DEFAULT_HISTORICAL_HOROSCOPE);
    this.openForm(horoscope);
  }

  formatTime(h: HistoricalHoroscope): string {
    const parts: string[] = [];
    if (h.year != null) parts.push(String(h.year));
    else parts.push('----');
    const month = h.month != null ? String(h.month).padStart(2, '0') : '--';
    const day = h.day != null ? String(h.day).padStart(2, '0') : '--';
    parts.push(month, day);
    const timeParts: string[] = [];
    timeParts.push(h.hour != null ? String(h.hour).padStart(2, '0') : '--');
    timeParts.push(h.minute != null ? String(h.minute).padStart(2, '0') : '--');
    timeParts.push(h.second != null ? String(h.second).padStart(2, '0') : '--');
    return parts.join('-') + ' ' + timeParts.join(':');
  }

  formatGender(gender: boolean | null): string {
    if (gender === true) return '男';
    if (gender === false) return '女';
    return '未知';
  }

  private openForm(horoscope: HistoricalHoroscope) {
    const modalRef = this.modalService.open(HistoricalFormComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.horoscope = horoscope;

    modalRef.result.then(
      (result: string) => {
        if (result === 'success') {
          if (this.isSearchMode) {
            this.search();
          } else {
            this.getHoroscopes();
          }
        }
      },
      () => {}
    );
  }
}
