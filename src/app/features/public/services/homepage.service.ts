import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  constructor(private http: HttpClient) {}

  getHomePageData(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/homepage`);
  }
}