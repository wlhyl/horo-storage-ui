export interface AuthUser {
  id: number;
  name: string;
  role: string;
  exp: number;
}

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface UpdateUserRequest {
  // 密码
  password: string;
  // 旧密码
  old_password: string;
}
