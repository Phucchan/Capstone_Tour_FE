import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { UserStorageService } from '../../../core/services/user-storage/user-storage.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SocketSerivce } from '../../../core/services/socket/socket.service';
import { CurrentUserService } from '../../../core/services/user-storage/current-user.service';
import { ChatComponent } from '../../../features/customer/components/chat/chat.component';

declare const window: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChatComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  @Input() currentUser: any;
  @Input() customerBasicInfo: any;
  @Input() friends: any;
  @Input() isUserReady: boolean = false;
  @Input() chatGroups: any[] = [];

  showDropdown: boolean = false;
  showChat: boolean = false;
  

  constructor(
    private userStorageService: UserStorageService,
    private router: Router,
    private socketService: SocketSerivce,
    private currentUserService: CurrentUserService,
    private elRef: ElementRef,
  ) {}

  ngOnInit(): void {
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
    this.currentUserService.clearCurrentUser();
    this.router.navigate(['/homepage']);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.showChat = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showDropdown = false;
      this.showChat = false;
    }
  }

  openChatList() {
    this.showChat = !this.showChat;
    if (this.showChat) {
      this.showDropdown = false;
    }
  }
}
