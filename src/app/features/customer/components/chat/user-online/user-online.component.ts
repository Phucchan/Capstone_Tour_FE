import { Component, Input } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { SocketSerivce } from '../../../../../core/services/socket/socket.service';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';
import { AvatarComponent } from '../../../../../shared/components/avatar/avatar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-online',
  imports: [
    AvatarComponent,
    CommonModule
  ],
  templateUrl: './user-online.component.html',
  styleUrl: './user-online.component.css',
})
export class UserOnlineComponent {
  @Input() currentUser: any = {};

  activeUsers: any[] = [];
  activeUsersSubcription: any;

  constructor(
    private chatService: ChatService,
    private socketService: SocketSerivce,
    private userStorageService: UserStorageService
  ) {}

  ngOnInit(): void {
    this.chatService
      .getUserFriends(this.currentUser.id)
      .subscribe({
        next: (response: any) => {
          this.activeUsers = response.data;
        },
        error: (err) => {
          console.error('User-Online-Component: Error fetching friends:', err);
        },
      });
    this.subscribeActiveUsers();
  }

  ngOnDestroy() {
    this.activeUsersSubcription?.unsubscribe();
  }

  subscribeActiveUsers() {
    console.log('Subscribing to active users...');
    this.activeUsersSubcription = this.socketService
      .subcribeActiveUsers()
      .subscribe({
        next: (user) => {
          console.log('Active user:', user);

          const index = this.activeUsers.findIndex(
            (u) => u.username === user.username
          );

          if (index === -1) {
            this.activeUsers.push(user);
          } else {
            this.activeUsers[index] = user; // Cập nhật lại nếu có thay đổi
          }
        },
        error: (err) => {
          console.error('Error subscribing to active users:', err);
        },
      });
  }
}
