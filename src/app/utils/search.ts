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

  return { params, hasSearchConditions };
}
