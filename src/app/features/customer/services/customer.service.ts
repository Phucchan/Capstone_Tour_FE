import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserProfile } from '../components/customer-sidebar/customer-sidebar.component';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  getUserBasic(username: string): Observable<any> {
    console.log('{CustomerService} Fetching user basic information for username:', username);
    return this.http.get<any[]>(`${environment.apiUrl}/public/users/info`, {
      params: new HttpParams().set('username', username),
    });
  }
  updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
  return this.http.put<{ data: UserProfile }>(
    `${environment.apiUrl}/users/profile`,
    data
  ).pipe(
    map(res => res.data)
  );
}

}
