// 联系人
export interface Person {
  id: number;
  // 名字（必填）
  name: string;
  // 微信号
  wechat_id: string | null;
  // 微信名
  wechat_name: string | null;
  // 抖音号
  douyin_id: string | null;
  // 抖音名
  douyin_name: string | null;
  // 所属用户ID
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

// 新增联系人
export interface PersonRequest {
  // 名字（必填，1-64 字符）
  name: string;
  // 微信号
  wechat_id?: string | null;
  // 微信名
  wechat_name?: string | null;
  // 抖音号
  douyin_id?: string | null;
  // 抖音名
  douyin_name?: string | null;
  // 归属登录用户ID（可选，仅 admin 生效，缺省为当前登录用户）
  user_id?: number;
}

// 更新联系人
// 三态字段：undefined=不修改；null=清空；字符串=设置
// 归属用户 user_id 仅 admin 生效：未传=不修改；数值=设置（需校验目标用户存在）
export interface UpdatePersonRequest {
  // 名字
  name?: string;
  // 微信号
  wechat_id?: string | null;
  // 微信名
  wechat_name?: string | null;
  // 抖音号
  douyin_id?: string | null;
  // 抖音名
  douyin_name?: string | null;
  // 归属用户ID（仅 admin 生效）
  user_id?: number;
}
