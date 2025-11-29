import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UpdateUserRequest } from '../../interfaces/user';
import { AuthService } from '../auth/auth.service';
import {
  Horoscope,
  HoroscopeRequest,
  UpdateHoroscopeRequest,
} from '../../interfaces/horoscope';
import { PageResponser } from '../../interfaces/page';
import { LongLatResponse } from '../../interfaces/location';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly url = `${environment.base_url}`;
  private readonly http_options = { 'Content-Type': 'application/json' };

  constructor(private http: HttpClient, private user: AuthService) {}

  // 更新新user
  updateUser(user: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/user`, user, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 获取horoscope
  getHoroscopes(
    page: number,
    size: number
  ): Observable<PageResponser<Array<Horoscope>>> {
    return this.http.get<PageResponser<Array<Horoscope>>>(
      `${this.url}/horoscopes?page=${page}&size=${size}`,
      {
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  // 新增horoscope
  addHoroscope(horoscope: HoroscopeRequest): Observable<Horoscope> {
    return this.http.post<Horoscope>(`${this.url}/horoscopes`, horoscope, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 更新horoscope
  updateHoroscope(
    id: number,
    horoscope: UpdateHoroscopeRequest
  ): Observable<void> {
    return this.http.put<void>(`${this.url}/horoscopes/${id}`, horoscope, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 删除horoscope
  deleteHoroscope(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/horoscopes/${id}`, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 搜索horoscopes记录
  searchHoroscopes(params: any): Observable<PageResponser<Array<Horoscope>>> {
    return this.http.get<PageResponser<Array<Horoscope>>>(
      `${this.url}/horoscopes/search`,
      {
        params,
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  /**
   * 查询经纬度
   */
  getLongLat(name: string): Observable<Array<LongLatResponse>> {
    return this.http.get<Array<LongLatResponse>>(
      `${this.url}/location_search?q=${name}`,
      {
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }
}
