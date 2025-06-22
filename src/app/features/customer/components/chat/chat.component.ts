import { Component } from '@angular/core';
import { UserOnlineComponent } from './user-online/user-online.component';
import { CommonModule } from '@angular/common';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';

@Component({
  selector: 'app-chat',
  imports: [
    UserOnlineComponent,
    CommonModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  currentUser: any;

  constructor(
    private userStorageService: UserStorageService
  ) {
    this.currentUser = this.userStorageService.getUser() || { username: 'Guest' };
  }


}
