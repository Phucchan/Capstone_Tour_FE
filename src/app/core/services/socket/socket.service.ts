import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { UserStorageService } from '../user-storage/user-storage.service';
import { environment } from '../../../../environments/environment';
import { CompatClient, Stomp } from '@stomp/stompjs';
import SocketJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class SocketSerivce {
  private stompClient: CompatClient = {} as CompatClient;
  private subcriptionActiveUsers: any;
  private activeUserSubject = new Subject<any>();

  constructor(
    private http: HttpClient,
    private userStorageService: UserStorageService
  ) {}

  connect(user: any): void {
    const socket = new SocketJS(environment.apiUrl + '/ws');

    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      {},
      () => this.onConnect(user),
      (error: string) => console.error('STOMP error: ', error)
    );
  }

  private onConnect(user: any) {
    this.subcribeActive();
    this.sendConnect(user);
  }

  private subcribeActive() {
    this.subcriptionActiveUsers = this.stompClient.subscribe(
      '/topic/active',
      (message: any) => {
        console.log('🔥 Message received from topic /topic/active:', message);
        try {
          const user = JSON.parse(message.body);
          console.log('✅ Parsed user:', user);
          this.activeUserSubject.next(user);
        } catch (e) {
          console.error('❌ Failed to parse message.body:', e);
        }
      }
    );
  }

  sendConnect(user: any) {
    this.stompClient.send('/app/user/connect', {}, JSON.stringify(user));
  }

  subcribeActiveUsers(): Observable<any> {
    return this.activeUserSubject.asObservable();
  }
}
