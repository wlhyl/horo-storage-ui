// 标签
export interface Tag {
  id: number;
  // 标签名（全局唯一，1-30字符）
  name: string;
  // 创建者用户ID
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

// 新增标签
export interface TagRequest {
  // 标签名（必填，1-30字符）
  name: string;
  // 归属登录用户ID（可选，仅 admin 生效，缺省为当前登录用户）
  user_id?: number;
}

// 更新标签（至少一个字段）
export interface UpdateTagRequest {
  // 标签名（全局唯一）
  name?: string;
  // 归属用户ID（仅 admin 生效）
  user_id?: number;
}
