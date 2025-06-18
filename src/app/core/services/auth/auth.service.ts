import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UserStorageService } from '../user-storage/user-storage.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private http: HttpClient, private userStorageService: UserStorageService, ) { }
  

  login(username: string, password: string) : any {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = {username, password};

    return this.http.post(environment.apiUrl + '/auth', body, { headers, observe: 'response' }).pipe(
      map((response: any) => {
        const token = response.body.data.token;
        const user = response.body.data;
        console.log( user);
        if (token && user) {
          this.userStorageService.saveToken(token);
          this.userStorageService.saveUser(user);
          return response;
        }
    
        return null;
      })
    );    
  }
}
