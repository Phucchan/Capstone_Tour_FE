import { Component, Input, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { SocketSerivce } from '../../../../core/services/socket/socket.service';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  gender: string;
  phone: string;
  address: string;
  avatarImg: string;
  createAt: string;
}

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [CommonModule, 
    RouterModule],
  templateUrl: './customer-sidebar.component.html',
  styleUrl: './customer-sidebar.component.css'
})
export class CustomerSidebarComponent implements OnInit {
  
  @Output() photoUploaded = new EventEmitter<File>();
  @Input() currentUser: any;
 

   constructor(
    private userStorageService: UserStorageService,
    private router: Router,
    private socketService: SocketSerivce,
    private currentUserService: CurrentUserService,
    private elRef: ElementRef,
  ) {}
  
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

  ngOnInit(): void { }

  // Xử lý khi nhấn nút upload
  onUploadPhoto(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.photoUploaded.emit(input.files[0]);
    }
  }
}
