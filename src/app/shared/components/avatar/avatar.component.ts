import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from '../../../features/customer/services/chat.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  @Input() username?: string;
  @Input() width: string = '32px';
  @Input() height?: string;
  @Input() isOnline?: boolean;
  @Input() avatarUrl?: string;

  constructor() {}

  ngOnInit() {
    if (!this.height) {
      this.height = this.width;
    }
    if (!this.avatarUrl) {
      this.avatarUrl =
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNL_ZnOTpXSvhf1UaK7beHey2BX42U6solRA&s';
    }
  }
}
