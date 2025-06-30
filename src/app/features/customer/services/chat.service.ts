import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) {}


  getUserFriends(userId: number): Observable<any[]> {
    console.log('Fetching friends for user ID:', userId);
    return this.http.get<any[]>(`${environment.apiUrl}/public/users/friends/${userId}`);
  }


  getChatGroups(userId: number): Observable<any[]> {
    console.log('Fetching chat groups for user ID:', userId);
    return this.http.get<any[]>(`${environment.apiUrl}/public/chat-group/list/${userId}`);
  }

}

  