import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  getUserBasic(username: string): Observable<any> {
    console.log('Fetching user basic information for username:', username);
    return this.http.get<any[]>(`${environment.apiUrl}/public/users/info`, {
      params: new HttpParams().set('username', username),
    });
  }
}
