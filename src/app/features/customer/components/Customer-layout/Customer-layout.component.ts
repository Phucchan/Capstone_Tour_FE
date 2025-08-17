import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerSidebarComponent, UserProfile } from '../customer-sidebar/customer-sidebar.component';
import { CustomerService } from '../../services/customer.service';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';


@Component({
  selector: 'app-customer-layout',
  imports: [
    CommonModule,
    CustomerSidebarComponent,
    RouterOutlet
  ],
  standalone: true,
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css']
})
export class CustomerLayoutComponent implements OnInit {
  currentUser: UserProfile | null = null;
  constructor(
    private customerService: CustomerService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.customerService.getProfile().subscribe((profile) => {
      this.currentUser = profile;
    });
  }

  onPhotoUploaded(file: File) {
    const userId = this.currentUserService.getCurrentUser()?.id;
    if (!userId) {
      return;
    }
    this.customerService.uploadAvatar(file).subscribe((url) => {
      this.customerService.updateProfile(userId, { avatarImg: url }).subscribe(() => {
        if (this.currentUser) {
          this.currentUser.avatarImg = url;
          this.currentUserService.setCurrentUser({ ...this.currentUser });
        }
      });
    });
  }
}
