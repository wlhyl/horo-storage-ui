import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UpdateUserRequest, User } from '../../interfaces/user';
import { AuthService } from '../auth/auth.service';
import {
  Horoscope,
  HoroscopeRequest,
  UpdateHoroscopeRequest,
} from '../../interfaces/horoscope';
import {
  HistoricalHoroscope,
  HistoricalHoroscopeRequest,
  UpdateHistoricalHoroscopeRequest,
} from '../../interfaces/historical-horoscope';
import { PageResponser } from '../../interfaces/page';
import { LongLatResponse } from '../../interfaces/location';
import {
  Person,
  PersonRequest,
  UpdatePersonRequest,
} from '../../interfaces/person';
import {
  Tag,
  TagRequest,
  UpdateTagRequest,
} from '../../interfaces/tag';

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

  /**
   * 获取用户列表
   */
  getUsers(): Observable<Array<User>> {
    return this.http.get<Array<User>>(`${this.url}/users`, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  getHistoricalHoroscopes(
    page: number,
    size: number
  ): Observable<PageResponser<Array<HistoricalHoroscope>>> {
    return this.http.get<PageResponser<Array<HistoricalHoroscope>>>(
      `${this.url}/historical-horoscopes?page=${page}&size=${size}`,
      {
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  getHistoricalHoroscopeById(id: number): Observable<HistoricalHoroscope> {
    return this.http.get<HistoricalHoroscope>(
      `${this.url}/historical-horoscopes/${id}`,
      {
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  addHistoricalHoroscope(
    data: HistoricalHoroscopeRequest
  ): Observable<HistoricalHoroscope> {
    return this.http.post<HistoricalHoroscope>(
      `${this.url}/historical-horoscopes`,
      data,
      {
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  updateHistoricalHoroscope(
    id: number,
    data: UpdateHistoricalHoroscopeRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.url}/historical-horoscopes/${id}`,
      data,
      {
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  deleteHistoricalHoroscope(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/historical-horoscopes/${id}`,
      {
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  searchHistoricalHoroscopes(
    params: any
  ): Observable<PageResponser<Array<HistoricalHoroscope>>> {
    return this.http.get<PageResponser<Array<HistoricalHoroscope>>>(
      `${this.url}/historical-horoscopes/search`,
      {
        params,
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  // 获取联系人分页列表
  getPersons(
    page: number,
    size: number
  ): Observable<PageResponser<Array<Person>>> {
    return this.http.get<PageResponser<Array<Person>>>(
      `${this.url}/persons?page=${page}&size=${size}`,
      {
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  // 根据id获取联系人
  getPersonById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.url}/persons/${id}`, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 新增联系人
  addPerson(person: PersonRequest): Observable<Person> {
    return this.http.post<Person>(`${this.url}/persons`, person, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 更新联系人
  updatePerson(
    id: number,
    person: UpdatePersonRequest
  ): Observable<void> {
    return this.http.put<void>(`${this.url}/persons/${id}`, person, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 删除联系人
  deletePerson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/persons/${id}`, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 获取标签分页列表
  getTags(
    page: number,
    size: number
  ): Observable<PageResponser<Array<Tag>>> {
    return this.http.get<PageResponser<Array<Tag>>>(
      `${this.url}/tags?page=${page}&size=${size}`,
      {
        headers: { ...this.http_options, token: this.user.token },
      }
    );
  }

  // 根据id获取标签
  getTagById(id: number): Observable<Tag> {
    return this.http.get<Tag>(`${this.url}/tags/${id}`, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 新增标签
  addTag(tag: TagRequest): Observable<Tag> {
    return this.http.post<Tag>(`${this.url}/tags`, tag, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 更新标签
  updateTag(id: number, tag: UpdateTagRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/tags/${id}`, tag, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }

  // 删除标签
  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/tags/${id}`, {
      headers: { ...this.http_options, token: this.user.token },
    });
  }
}
