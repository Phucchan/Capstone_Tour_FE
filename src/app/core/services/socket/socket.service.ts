import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
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
  private connectionStatus$ = new BehaviorSubject<boolean>(false);

  connect(user: any): void {
    const socket = new SocketJS(environment.apiUrl + '/ws');

    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      {},
      () => {
        console.log('Connected to WebSocket');
        this.connectionStatus$.next(true);
        this.onConnect(user);
      },
      (error: string) => {
        console.error('WebSocket connection error:', error);
        this.connectionStatus$.next(false);
      }
    );
  }

  disconnect(user: any): void {
    this.sendDisconnect(user);
    this.stompClient.disconnect(() => {
      console.log('Disconnected from WebSocket');
      this.subcriptionActiveUsers?.unsubscribe();
      this.activeUserSubject.next(null);
      this.connectionStatus$.next(false);
    });
  }

  sendDisconnect(user: any) {
    this.stompClient.send('/app/user/disconnect', {}, JSON.stringify(user));
    console.log('User disconnected:', user);
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

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }
}
