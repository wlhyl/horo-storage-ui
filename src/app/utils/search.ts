import { SearchHoroscopeRequest } from '../interfaces/horoscope';

export interface SearchParamsResult {
  params: SearchHoroscopeRequest;
  hasSearchConditions: boolean;
}

export function buildSearchParams(
  searchParams: SearchHoroscopeRequest,
): SearchParamsResult {
  const params: SearchHoroscopeRequest = {
    page: searchParams.page,
    size: searchParams.size,
  };

  let hasSearchConditions = false;

  // 处理name字段：空字符串不发送
  if (searchParams.name && searchParams.name.trim() !== '') {
    params.name = searchParams.name.trim();
    hasSearchConditions = true;
  }

  // 处理其他时间字段：undefined不发送
  // 为了避免类型错误，我们显式处理每个字段
  const processField = <K extends keyof SearchHoroscopeRequest>(field: K) => {
    if (searchParams[field] !== undefined && searchParams[field] !== null) {
      params[field] = searchParams[field]!;
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

  // 盘类型：非空时计入搜索条件
  if (searchParams.chart_type !== undefined) {
    params.chart_type = searchParams.chart_type;
    hasSearchConditions = true;
  }

  // 时间精准：注意 false 是有效值，需保留
  if (searchParams.is_time_precise !== undefined) {
    params.is_time_precise = searchParams.is_time_precise;
    hasSearchConditions = true;
  }

  // 联系人/标签信息：模糊搜索，空字符串不发送
  const personStringFields: Array<keyof SearchHoroscopeRequest> = [
    'person_name',
    'wechat_id',
    'wechat_name',
    'douyin_id',
    'douyin_name',
    'tag_name',
  ];
  for (const field of personStringFields) {
    const value = searchParams[field];
    if (typeof value === 'string' && value.trim() !== '') {
      (params[field] as string) = value.trim();
      hasSearchConditions = true;
    }
  }

  return { params, hasSearchConditions };
}
