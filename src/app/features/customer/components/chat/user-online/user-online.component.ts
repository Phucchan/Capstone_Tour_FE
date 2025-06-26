import { Component, Input } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { SocketSerivce } from '../../../../../core/services/socket/socket.service';
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
  @Input() friends: any = {};
  activeUsersSubcription: any;

  constructor(
    private socketService: SocketSerivce,
  ) {}

  ngOnInit(): void {
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
          const index = this.friends.findIndex(
            (u: any) => u.username === user.username
          );
          if (index === -1) {
            this.friends.push(user);
          } else {
            this.friends[index] = user; // Cập nhật lại nếu có thay đổi
          }
        },
        error: (err) => {
          console.error('Error subscribing to active users:', err);
        },
      });
  }
}
