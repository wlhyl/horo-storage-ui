import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Alert } from '../../interfaces/alert';
import { PageResponser } from '../../interfaces/page';
import {
  Horoscope,
  HoroscopeRequest,
  UpdateHoroscopeRequest,
  SearchHoroscopeRequest,
} from '../../interfaces/horoscope';
import { Location, LocationRequest } from '../../interfaces/location';
import { ApiService } from '../../services/api/api.service';
import { AlertKind } from '../../enum/alert';
import { DEFAULT_NATIVE, PAGE_SIZE, TIME_ZONES } from '../../utils/constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NativeFormComponent } from './native-form/native-form.component';

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

  saving = false;
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

  // 新增/更新native
  native: Horoscope = {
    ...DEFAULT_NATIVE,
    ...this.nowDate(),
  };

  zones = TIME_ZONES;
  showForm = false; // 控制表单显示/隐藏

  constructor(
    private api: ApiService,
    private titleService: Title,
    private modalService: NgbModal
  ) {}
  ngOnInit(): void {
    this.titleService.setTitle('天宫图列表');
    this.getNatives();
  }

  getNatives() {
    if (this.saving || this.refreshing) {
      return; // 如果正在刷新，直接返回
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
    if (this.saving || this.refreshing) {
      return; // 如果正在刷新，直接返回
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
    this.message = [];
    this.deleting = id;
    this.api
      .deleteHoroscope(id)
      .subscribe({
        next: () => {
          this.getNatives();
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

  add(native: Horoscope) {
    this.message = [];
    const nativeRequest: HoroscopeRequest = {
      name: native.name,
      gender: native.gender,
      birth_year: native.birth_year,
      birth_month: native.birth_month,
      birth_day: native.birth_day,
      birth_hour: native.birth_hour,
      birth_minute: native.birth_minute,
      birth_second: native.birth_second,
      time_zone_offset: native.time_zone_offset,
      is_dst: native.is_dst,
      location: {
        ...native.location,
      },
      description: native.description,
      lock: native.lock,
    };

    const locationErrors = this.validateLocation(nativeRequest.location);
    if (locationErrors.length > 0) {
      this.message.push(...locationErrors);
      return;
    }

    this.saving = true;

    this.api
      .addHoroscope(nativeRequest)
      .subscribe({
        next: () => {},
        error: (error) => {
          let msg = error.error.error;
          let message = '新增记录失败！';
          if (msg) message += msg;
          this.message.push({
            kind: AlertKind.DANGER,
            message,
          });
        },
      })
      .add(() => {
        this.saving = false;
        this.getNatives();
      });
  }

  update(native: Horoscope) {
    this.message = [];

    const old_native = this.natives.data.find((c) => c.id === native.id);
    if (!old_native) {
      const message = `你正在更新的id: ${native.id}不存在！`;
      this.message.push({
        kind: AlertKind.DANGER,
        message,
      });
      return;
    }

    const nativeRequest: UpdateHoroscopeRequest = {
      name: old_native.lock
        ? null
        : native.name === old_native.name
        ? null
        : native.name,
      gender: old_native.lock
        ? null
        : native.gender === old_native.gender
        ? null
        : native.gender,
      birth_year: old_native.lock
        ? null
        : native.birth_year === old_native.birth_year
        ? null
        : native.birth_year,
      birth_month: old_native.lock
        ? null
        : native.birth_month === old_native.birth_month
        ? null
        : native.birth_month,
      birth_day: old_native.lock
        ? null
        : native.birth_day === old_native.birth_day
        ? null
        : native.birth_day,
      birth_hour: old_native.lock
        ? null
        : native.birth_hour === old_native.birth_hour
        ? null
        : native.birth_hour,
      birth_minute: old_native.lock
        ? null
        : native.birth_minute === old_native.birth_minute
        ? null
        : native.birth_minute,
      birth_second: old_native.lock
        ? null
        : native.birth_second === old_native.birth_second
        ? null
        : native.birth_second,
      time_zone_offset: old_native.lock
        ? null
        : native.time_zone_offset === old_native.time_zone_offset
        ? null
        : native.time_zone_offset,
      is_dst: old_native.lock
        ? null
        : native.is_dst === old_native.is_dst
        ? null
        : native.is_dst,
      location: old_native.lock
        ? null
        : this.isLocationEqual(native.location, old_native.location)
        ? null
        : native.location,
      description:
        native.description === old_native.description
          ? null
          : native.description,
      lock: native.lock === old_native.lock ? null : native.lock,
    };

    if (nativeRequest.location) {
      const locationErrors = this.validateLocation(nativeRequest.location);
      if (locationErrors.length > 0) {
        this.message.push(...locationErrors);
        return;
      }
    }

    this.saving = true;

    this.api
      .updateHoroscope(native.id, nativeRequest)
      .subscribe({
        next: () => {},
        error: (error) => {
          let msg = error.error.error;
          let message = '更新记录失败！';
          if (msg) message += msg;
          this.message.push({
            kind: AlertKind.DANGER,
            message,
          });
        },
      })
      .add(() => {
        this.saving = false;
        this.getNatives();
      });
  }

  cancel() {
    this.native = {
      ...DEFAULT_NATIVE,
      ...this.nowDate(),
    };
    this.showForm = false; // 隐藏表单
  }

  showAddForm() {
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

  private isLocationEqual(
    loc1: Readonly<Location>,
    loc2: Readonly<Location>
  ): boolean {
    return (
      loc1.name === loc2.name &&
      loc1.longitude_degree === loc2.longitude_degree &&
      loc1.latitude_degree === loc2.latitude_degree &&
      loc1.is_east === loc2.is_east &&
      loc1.longitude_minute === loc2.longitude_minute &&
      loc1.longitude_second === loc2.longitude_second &&
      loc1.is_north === loc2.is_north &&
      loc1.latitude_minute === loc2.latitude_minute &&
      loc1.latitude_second === loc2.latitude_second
    );
  }

  private validateLocation(location: Readonly<LocationRequest>): Alert[] {
    const alerts: Alert[] = [];

    // 验证城市名
    if (location.name === '') {
      alerts.push({
        kind: AlertKind.DANGER,
        message: '请输入城市名',
      });
    }

    // 验证经度
    const longitude =
      location.longitude_degree +
      location.longitude_minute / 60 +
      location.longitude_second / 3600;

    if (longitude > 180) {
      alerts.push({
        kind: AlertKind.DANGER,
        message: '-180<=long<=180',
      });
    }

    // 验证纬度
    const latitude =
      location.latitude_degree +
      location.latitude_minute / 60 +
      location.latitude_second / 3600;

    if (latitude > 90) {
      alerts.push({
        kind: AlertKind.DANGER,
        message: '-90<=lat<=90',
      });
    }

    return alerts;
  }

  private openNativeForm(native: Horoscope) {
    const modalRef = this.modalService.open(NativeFormComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.native = native;
    modalRef.componentInstance.saving = this.saving;

    modalRef.result.then(
      (result: Horoscope) => {
        if (result.id === 0) {
          this.add(result);
        } else {
          this.update(result);
        }
      },
      () => {} // 取消时不做任何处理
    );
  }
}
