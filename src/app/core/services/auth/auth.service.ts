import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UserStorageService } from '../user-storage/user-storage.service';
import { environment } from '../../../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private http: HttpClient,
    private userStorageService: UserStorageService) { }


  login(username: string, password: string): any {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { username, password };

    return this.http.post(environment.apiUrl + '/auth/login', body, { headers, observe: 'response' }).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  register(payload: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${environment.apiUrl}/auth/register`, payload, { headers });
  }
}
