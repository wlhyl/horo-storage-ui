import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Alert } from '../../interfaces/alert';
import { PageResponser } from '../../interfaces/page';
import {
  Horoscope,
  SearchHoroscopeRequest,
} from '../../interfaces/horoscope';
import { ApiService } from '../../services/api/api.service';
import { AuthService } from '../../services/auth/auth.service';
import { AlertKind } from '../../enum/alert';
import { DEFAULT_NATIVE, PAGE_SIZE } from '../../utils/constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NativeFormComponent } from './native-form/native-form.component';
import { ConfirmModalComponent } from '../../common/confirm/confirm-modal.component';

@Component({
  selector: 'app-natives',
  templateUrl: './natives.component.html',
  styleUrl: './natives.component.scss',
  standalone: false,
})
export class NativesComponent implements OnInit {
  page = 0;
  size = PAGE_SIZE;
  message: Array<Alert> = [];

  deleting = 0;
  refreshing = false; // 添加刷新状态标志
  isSearchMode = false; // 跟踪当前是否处于搜索状态

  natives: PageResponser<Array<Horoscope>> = {
    data: [],
    total: 0,
  };

  // 搜索参数
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
    this.titleService.setTitle('天宫图列表');
    this.getNatives();
  }

  getNatives() {
    if (this.refreshing) {
      return;
    }

    this.message = [];
    this.refreshing = true; // 开始刷新
    this.isSearchMode = false; // 设置为非搜索模式
    this.api
      .getHoroscopes(this.page, this.size)
      .subscribe({
        next: (response) => (this.natives = response),
        error: (error) => {
          const msg = error.error.error;
          let message = '获取native失败！';
          if (msg) message += msg;
          this.message.push({
            kind: AlertKind.DANGER,
            message,
          });
        },
      })
      .add(() => {
        this.refreshing = false; // 结束刷新
      });
  }

  // 构建过滤后的搜索参数
  private buildSearchParams(): {
    params: SearchHoroscopeRequest;
    hasSearchConditions: boolean;
  } {
    const params: SearchHoroscopeRequest = {
      page: this.searchParams.page,
      size: this.searchParams.size,
    };

    let hasSearchConditions = false;

    // 处理name字段：空字符串不发送
    if (this.searchParams.name && this.searchParams.name.trim() !== '') {
      params.name = this.searchParams.name.trim();
      hasSearchConditions = true;
    }

    // 处理其他时间字段：undefined不发送
    // 为了避免类型错误，我们显式处理每个字段
    const processField = <K extends keyof SearchHoroscopeRequest>(field: K) => {
      if (
        this.searchParams[field] !== undefined &&
        this.searchParams[field] !== null
      ) {
        params[field] = this.searchParams[field]!;
        if (
          field === 'year' ||
          field === 'month' ||
          field === 'day' ||
          field === 'hour'
        ) {
          hasSearchConditions = true;
        }
      }
    };

    processField('year');
    processField('month');
    processField('day');
    processField('hour');
    processField('minute');
    processField('second');

    return { params, hasSearchConditions };
  }

  // 搜索方法
  search() {
    if (this.refreshing) {
      return;
    }

    this.message = [];

    // 过滤搜索参数，移除undefined和空字符串
    const filteredParams = this.buildSearchParams();

    // 检查是否有搜索条件
    if (!filteredParams.hasSearchConditions) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '请至少输入一个搜索条件（姓名、年、月、日、时）',
      });
      return;
    }

    this.refreshing = true; // 开始刷新
    this.isSearchMode = true; // 设置为搜索模式

    // 调用搜索接口
    this.api
      .searchHoroscopes(filteredParams.params)
      .subscribe({
        next: (response) => {
          this.natives = response;
        },
        error: (error) => {
          let message = '搜索失败！';
          if (error.error.error) message += error.error.error;
          else message += error.error;
          this.message.push({
            kind: AlertKind.DANGER,
            message,
          });
        },
      })
      .add(() => {
        this.refreshing = false; // 结束刷新
      });
  }

  // 重置搜索
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
    // 重新加载列表
    this.page = 0;
    this.getNatives();
  }

  edit(id: number) {
    if (this.refreshing) {
      return;
    }
    const native = this.natives.data.find((n) => n.id === id);
    if (native) {
      this.openNativeForm(structuredClone(native));
    }
  }

  delete(id: number) {
    const native = this.natives.data.find((n) => n.id === id);
    if (!native) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '记录不存在！',
      });
      return;
    }

    if (native.lock) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '已锁定的记录不能删除！',
      });
      return;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.message = `确定要删除 "${native.name}" 这条记录吗？`;

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
      .deleteHoroscope(id)
      .subscribe({
        next: () => {
          if (this.isSearchMode) {
            this.search();
          } else {
            this.getNatives();
          }
        },
        error: (error) => {
          let msg = error.error.error;
          let message = '删除native失败！';
          if (msg) message += msg;
          this.message.push({
            kind: AlertKind.DANGER,
            message,
          });
        },
      })
      .add(() => (this.deleting = 0));
  }

  pageChange(page: number) {
    if (this.isSearchMode) {
      // 搜索模式下，使用searchParams.page并调用search()
      this.searchParams.page = page;
      this.search();
    } else {
      // 非搜索模式下，使用this.page并调用getNatives()
      this.page = page;
      this.getNatives();
    }
  }

  showAddForm() {
    if (this.refreshing) {
      return;
    }
    const native = {
      ...DEFAULT_NATIVE,
      ...this.nowDate(),
    };
    this.openNativeForm(native);
  }

  private nowDate() {
    const t = new Date();
    const birth_year = t.getFullYear();
    const birth_month = t.getMonth() + 1;
    const birth_day = t.getDate();
    const birth_hour = t.getHours();
    const birth_minute = t.getMinutes();
    const birth_second = t.getSeconds();

    let is_dst = false;
    // 判断夏令时
    let d1 = new Date(birth_year, 1, 1); // 2月1日
    let time_zone_offset = d1.getTimezoneOffset() / -60;
    // let d2 = new Date(this.horo.year,7,1);
    if (t.getTimezoneOffset() != d1.getTimezoneOffset()) {
      is_dst = true;
      time_zone_offset -= 1;
    }
    return {
      birth_year,
      birth_month,
      birth_day,
      birth_hour,
      birth_minute,
      birth_second,
      time_zone_offset,
      is_dst,
    };
  }

  private openNativeForm(native: Horoscope) {
    const modalRef = this.modalService.open(NativeFormComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.native = native;

    modalRef.result.then(
      (result: string) => {
        if (result === 'success') {
          if (this.isSearchMode) {
            this.search();
          } else {
            this.getNatives();
          }
        }
      },
      () => {} // 取消时不做任何处理
    );
  }
}
