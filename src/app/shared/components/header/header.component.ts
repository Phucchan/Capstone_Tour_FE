import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { UserStorageService } from '../../../core/services/user-storage/user-storage.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SsrService } from '../../../core/services/ssr.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { SocketSerivce } from '../../../core/services/socket/socket.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  currentUser: any = {};

  constructor(
    private userStorageService: UserStorageService,
    private router: Router,
    private socketService: SocketSerivce
  ) {}

  ngOnInit(): void {
    this.userStorageService.currentUser$.subscribe((user) => {
      if (user) {
        console.log('Current user from header:', user);
        this.currentUser = user;
      }
    });
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onLogout() {
    if (!this.currentUser && !this.currentUser.id) {
      console.error('No user is currently logged in.');
      return;
    }
    this.socketService.disconnect(this.currentUser);
    this.userStorageService.logout();
    this.router.navigate(['/homepage']);
  }
}
