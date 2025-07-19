// src/app/services/image-search.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageSearchService {


    constructor(private http: HttpClient) { }

    getImageUrl(query: string): Observable<any> {
        const params = new HttpParams().set('query', query);
        return this.http.get<any>(`${environment.apiUrl}public/images/get`, { params });
      }
}
