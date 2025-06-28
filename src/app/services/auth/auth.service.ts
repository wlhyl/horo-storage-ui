import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthUser } from '../../interfaces/user';
import { jwtDecode } from 'jwt-decode';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url = `${environment.base_url}`;
  private readonly http_options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  private _user: AuthUser | null = null;

  public get user(): AuthUser | null {
    if (this._user) {
      return this._user;
    }
    this.token; // 触发token getter来解析并设置_user
    return this._user;
  }

  constructor(private http: HttpClient) {}

  public get token(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      this._user = null;
      return '';
    }

    try {
      const user = jwtDecode<AuthUser>(token);
      if (user.exp * 1000 <= Date.now()) {
        localStorage.removeItem('token');
        this._user = null;
        return '';
      }
      this._user = user;
      return token;
    } catch (error) {
      localStorage.removeItem('token');
      this._user = null;
      return '';
    }
  }

  public get isAuth(): boolean {
    return !!this.token;
  }

  /**
   *
   * @param name 用户名
   * @param password 密码
   * 认证失败抛异常
   */
  public auth(name: string, password: string) {
    return this.http
      .post<{ token: string }>(
        `${this.url}/login`,
        { name, password },
        this.http_options
      )
      .pipe(
        map((v) => {
          localStorage.setItem('token', v.token);
          this._user = jwtDecode<AuthUser>(v.token); // 登录成功后立即更新_user
        })
      );
  }

  public deleteToken() {
    localStorage.removeItem('token');
  }
}
