export function getApiErrorMessage(error: any): string {
  if (error.status === 0 || error.status === null) {
    return '网络连接失败，请检查网络或服务器状态';
  }

  const errorBody = error.error;

  if (!errorBody) {
    if (error.message && typeof error.message === 'string') {
      if (error.message.includes('HttpErrorResponse')) {
        return '请求失败，请稍后重试';
      }
      return error.message;
    }
    return `请求失败 (HTTP ${error.status})`;
  }

  if (typeof errorBody === 'string') {
    return errorBody || '请求失败';
  }

  if (errorBody.error && typeof errorBody.error === 'string') {
    return errorBody.error;
  }

  return String(errorBody);
}