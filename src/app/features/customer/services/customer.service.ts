import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserProfile } from '../components/customer-sidebar/customer-sidebar.component';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) { }

  getUserProfile(userId: number): Observable<any> {
    console.log('{CustomerService} Fetching user profile with userId:', userId);
    return this.http.get<{ data: any }>(`${environment.apiUrl}/users/profile`, {
      params: new HttpParams().set('userId', userId.toString()),
    });
  }
  updateProfile(userId: number, data: any): Observable<UserProfile> {
  return this.http.put<{ data: UserProfile }>(
    `${environment.apiUrl}/users/profile`,
    data,
    { params: { userId } }
  ).pipe(map(res => res.data));
}
  getProfile(): Observable<UserProfile> {
    return this.http.get<{ data: UserProfile }>(`${environment.apiUrl}/users/profile`)
      .pipe(map(res => res.data));
  }

  changePassword(userId: number, body: { currentPassword: string, newPassword: string, rePassword: string }) {
  return this.http.put<any>(`${environment.apiUrl}/users/change-password`, body, {
    params: { userId }
  });
}

  getUserBasic(username: string): Observable<any> {
    return this.http.get<{ data: any }>(`${environment.apiUrl}/public/users/info`, {
      params: new HttpParams().set('username', username),
    });
  }

}
