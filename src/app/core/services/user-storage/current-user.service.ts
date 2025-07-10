import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserStorageService } from './user-storage.service';

const TOKEN = 'token';
const USER = 'user';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private currentUserSubject: BehaviorSubject<any | null>;
  public currentUser$: Observable<any | null>;

  constructor(
    private userStorageService: UserStorageService
  ) {
    const user = this.userStorageService.getUser(); // dùng cookie thay vì localStorage
    this.currentUserSubject = new BehaviorSubject<any | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public setCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
  }

  public clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    this.userStorageService.deleteCookie(TOKEN); // xóa token cookie
  }

  public getCurrentUser(): any | null {
    return this.currentUserSubject.getValue();
  }

}
