import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { Router } from '@angular/router';
import { SocketSerivce } from '../../../../core/services/socket/socket.service';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';

@Component({
  selector: 'app-profile-menu',
  imports: [
    CommonModule,
    AngularSvgIconModule,
  ],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.css',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class ProfileMenuComponent implements OnInit {
  public isOpen = false;
  public isLoggedIn = true;
  userRole: string [] = [];
  user: any;

  constructor(
    private userStorageService: UserStorageService,
    private router : Router,
    private socketService: SocketSerivce,
    private currentUserService: CurrentUserService,
  ) {}

  ngOnInit(): void {
    this.user = this.userStorageService.getUser();
  }

  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  onLogout() {
      UserStorageService.signOut(this.userStorageService);
    if (!this.user && !this.user.id) {
      console.error('No user is currently logged in.');
      return;
    }
    this.socketService.disconnect(this.user);
    this.userStorageService.logout();
    this.currentUserService.clearCurrentUser();
    this.router.navigate(['/login']);
  }
}
