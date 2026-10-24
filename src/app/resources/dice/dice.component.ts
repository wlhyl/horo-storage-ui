import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Alert } from '../../interfaces/alert';
import { PageResponser } from '../../interfaces/page';
import { Dice, SearchDiceRequest } from '../../interfaces/dice';
import { ApiService } from '../../services/api/api.service';
import { AlertKind } from '../../enum/alert';
import { PAGE_SIZE, DEFAULT_DICE, DICE_PLANETS, QIZHENG_DICE_PLANETS, ZODIAC_SIGNS } from '../../utils/constant';
import { getApiErrorMessage } from '../../utils/api-error/api-error';
import { nowDateTime } from '../../utils/now/now';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DiceFormComponent } from './dice-form/dice-form.component';
import { ConfirmModalComponent } from '../../common/confirm/confirm-modal.component';

@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrl: './dice.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DiceComponent implements OnInit {
  page = 0;
  size = PAGE_SIZE;
  message: Array<Alert> = [];

  deleting = 0;
  refreshing = false;
  isSearchMode = false;

  dices: PageResponser<Array<Dice>> = {
    data: [],
    total: 0,
  };

  // 体系筛选：undefined=不限，false=占星，true=七政四余
  searchSystem: boolean | undefined = undefined;
  searchParams: SearchDiceRequest = {
    page: 0,
    size: PAGE_SIZE,
    is_qizheng: undefined,
    planet: undefined,
    zodiac: undefined,
    house: undefined,
    year: undefined,
    month: undefined,
    day: undefined,
    matter: undefined,
    description: undefined,
  };

  // 模板中使用的行星/星座选项
  westernPlanets = DICE_PLANETS;
  qizhengPlanets = QIZHENG_DICE_PLANETS;
  zodiacSigns = ZODIAC_SIGNS;
  houses = [...Array(12)].map((_, i) => i + 1);

  constructor(
    private api: ApiService,
    private titleService: Title,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('占星骰子');
    this.getDices();
  }

  getDices() {
    if (this.refreshing) {
      return;
    }

    this.message = [];
    this.refreshing = true;
    this.isSearchMode = false;
    this.api
      .getDices(this.page, this.size)
      .subscribe({
        next: (response) => (this.dices = response),
        error: (error) => {
          this.message.push({
            kind: AlertKind.DANGER,
            message: '获取骰子记录失败！' + getApiErrorMessage(error),
          });
        },
      })
      .add(() => {
        this.refreshing = false;
        // 当前页被删空后自动回退到第一页
        if (this.dices.data.length === 0 && this.page > 0) {
          this.page = 0;
          this.getDices();
        }
      });
  }

  // 随体系筛选联动变化的行星选项（不限时合并两组）
  get planetOptions(): Array<{ value: string; label: string }> {
    if (this.searchSystem === true) {
      return this.qizhengPlanets;
    }
    if (this.searchSystem === false) {
      return this.westernPlanets;
    }
    return [...this.westernPlanets, ...this.qizhengPlanets];
  }

  onSearchSystemChange() {
    this.searchParams.is_qizheng = this.searchSystem;
    // 切换体系后原行星选择可能不再有效，清空
    if (
      this.searchParams.planet &&
      !this.planetOptions.some((p) => p.value === this.searchParams.planet)
    ) {
      this.searchParams.planet = undefined;
    }
  }

  private buildSearchParams(): SearchDiceRequest {
    const params: SearchDiceRequest = {
      page: this.searchParams.page,
      size: this.searchParams.size,
    };

    const processField = <K extends keyof SearchDiceRequest>(field: K) => {
      const value = this.searchParams[field];
      if (value !== undefined && value !== null && value !== '') {
        (params[field] as unknown) = value;
      }
    };

    processField('is_qizheng');
    processField('planet');
    processField('zodiac');
    processField('house');
    processField('year');
    processField('month');
    processField('day');
    processField('matter');
    processField('description');

    return params;
  }

  search() {
    if (this.refreshing) {
      return;
    }

    this.message = [];

    const params = this.buildSearchParams();

    if (
      params.is_qizheng === undefined &&
      params.planet === undefined &&
      params.zodiac === undefined &&
      params.house === undefined &&
      params.year === undefined &&
      params.month === undefined &&
      params.day === undefined &&
      params.matter === undefined &&
      params.description === undefined
    ) {
      this.message.push({
        kind: AlertKind.WARNING,
        message:
          '请至少输入一个搜索条件（体系、行星、星座、宫位、年、月、日、事项、描述）',
      });
      return;
    }

    this.refreshing = true;
    this.isSearchMode = true;

    this.api
      .searchDices(params)
      .subscribe({
        next: (response) => {
          this.dices = response;
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
        // 当前页被删空或记录不再匹配条件后自动回退到第一页
        if (
          this.dices.data.length === 0 &&
          this.searchParams.page > 0 &&
          this.isSearchMode
        ) {
          this.searchParams.page = 0;
          this.search();
        }
      });
  }

  resetSearch() {
    if (this.refreshing) {
      return;
    }

    this.searchSystem = undefined;
    this.searchParams = {
      page: 0,
      size: PAGE_SIZE,
      is_qizheng: undefined,
      planet: undefined,
      zodiac: undefined,
      house: undefined,
      year: undefined,
      month: undefined,
      day: undefined,
      matter: undefined,
      description: undefined,
    };
    this.page = 0;
    this.getDices();
  }

  edit(id: number) {
    if (this.refreshing) {
      return;
    }
    if (this.modalService.hasOpenModals()) {
      return;
    }
    const dice = this.dices.data.find((d) => d.id === id);
    if (!dice) {
      // 列表数据刚被刷新替换，点击的是旧记录
      this.message.push({
        kind: AlertKind.WARNING,
        message: '记录不存在或已被更新，请刷新列表后重试！',
      });
      return;
    }
    this.openForm(structuredClone(dice));
  }

  delete(id: number) {
    if (this.refreshing) {
      return;
    }
    if (this.modalService.hasOpenModals()) {
      return;
    }
    const dice = this.dices.data.find((d) => d.id === id);
    if (!dice) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '记录不存在！',
      });
      return;
    }

    if (dice.lock) {
      this.message.push({
        kind: AlertKind.WARNING,
        message: '已锁定的记录不能删除！',
      });
      return;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.message = `确定要删除「${dice.matter}」这条骰子记录吗？`;

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
      .deleteDice(id)
      .subscribe({
        next: () => {
          if (this.isSearchMode) {
            this.search();
          } else {
            this.getDices();
          }
        },
        error: (error) => {
          this.message.push({
            kind: AlertKind.DANGER,
            message: '删除骰子记录失败！' + getApiErrorMessage(error),
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
      this.getDices();
    }
  }

  showAddForm() {
    if (this.refreshing) {
      return;
    }
    if (this.modalService.hasOpenModals()) {
      return;
    }
    // 新增时默认使用当前时间，时区取浏览器时区
    const { year, month, day, hour, minute, second, time_zone_offset } =
      nowDateTime();
    const dice = {
      ...structuredClone(DEFAULT_DICE),
      year,
      month,
      day,
      hour,
      minute,
      second,
      time_zone_offset,
    };
    this.openForm(dice);
  }

  // 行星中文名（未知值原样显示）
  planetLabel(planet: string): string {
    const found = [...this.westernPlanets, ...this.qizhengPlanets].find(
      (p) => p.value === planet
    );
    return found ? found.label : planet;
  }

  zodiacLabel(zodiac: number): string {
    const found = this.zodiacSigns.find((s) => s.value === zodiac);
    return found ? found.label : String(zodiac);
  }

  // 投掷时间，格式：yyyy-MM-dd HH:mm:ss
  formatTime(d: Dice): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${d.year}-${pad(d.month)}-${pad(d.day)}` +
      ` ${pad(d.hour)}:${pad(d.minute)}:${pad(d.second)}`
    );
  }

  private openForm(dice: Dice) {
    const modalRef = this.modalService.open(DiceFormComponent, {
      backdrop: 'static',
    });

    modalRef.componentInstance.dice = dice;

    modalRef.result.then(
      (result: string) => {
        if (result === 'success') {
          if (this.isSearchMode) {
            this.search();
          } else {
            this.getDices();
          }
        }
      },
      () => {}
    );
  }
}
