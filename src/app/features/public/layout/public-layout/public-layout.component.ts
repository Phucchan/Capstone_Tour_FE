import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { CustomerService } from '../../../customer/services/customer.service';
import { FriendService } from '../../../customer/services/friend.service';
import { CommonModule } from '@angular/common';
import { ChatIconComponent } from '../../../../shared/components/chat-icon/chat-icon.component';
import { ChatService } from '../../../customer/services/chat.service';
import { BannerComponent } from '../../../../shared/components/banner/banner.component';


@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css'],
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    ChatIconComponent,
    BannerComponent
  ],
})
export class PublicLayoutComponent {
  currentUser: any;
  customerBasicInfo: any;
  friends: any;
  isUserReady = false;
  chatGroups: any[] = [];

  constructor(
    private customerService: CustomerService,
    private currentUserService: CurrentUserService,
    private friendService: FriendService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.currentUserService.currentUser$.subscribe((user) => {
      if (user) {
        console.log('Current user from header:', user);
        this.currentUser = user;
        this.isUserReady = true;
        this.getUserBasicInfo();
      } else {
        this.currentUser = {};
        this.customerBasicInfo = {};
      }
    });
  }
  getUserBasicInfo() {
    this.customerService.getUserBasic(this.currentUser.username).subscribe({
      next: (response) => {
        console.log('User basic information:', response?.data);
        this.customerBasicInfo = response?.data || {};
        this.getUserFriends();
        this.getUserChatGroups();
      },
      error: (error) => {
        console.error('Error fetching user basic information:', error);
      },
    });
  }

  getUserFriends() {
    this.friendService
      .getFriends(this.customerBasicInfo.id)
      .subscribe((response: any) => {
        this.friends = response?.data;
      });
  }

  getUserChatGroups() { 
    console.log('{PublicLayoutComponent} Fetching chat groups for user:', this.customerBasicInfo.id);
    this.chatService
      .getChatGroups(this.customerBasicInfo.id)
      .subscribe((response: any) => {
        this.chatGroups = response?.data || [];
        console.log('{PublicLayoutComponent} User chat groups:', this.chatGroups);
      });
  }
}
