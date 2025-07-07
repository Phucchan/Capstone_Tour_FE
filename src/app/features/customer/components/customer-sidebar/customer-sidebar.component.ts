import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  @Input() user: UserProfile | null = null;
  @Output() photoUploaded = new EventEmitter<File>();


  constructor() { }

  ngOnInit(): void { }

  // Xử lý khi nhấn nút upload
  onUploadPhoto(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.photoUploaded.emit(input.files[0]);
    }
  }
}
