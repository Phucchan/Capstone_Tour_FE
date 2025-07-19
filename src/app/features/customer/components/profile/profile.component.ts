import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerSidebarComponent } from '../customer-sidebar/customer-sidebar.component';
import { CustomerService } from '../../services/customer.service';
import { RouterOutlet } from '@angular/router';
import { CustomerProfileComponent } from '../customer-profile/customer-profile.component';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule,
    FormsModule,
    CustomerSidebarComponent,
    RouterOutlet,
    CustomerProfileComponent,
    ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  @Input() currentUser: UserProfile | null = null;
  
  isLoading = true;

  // Có thể tạo bản sao để sửa không ảnh hưởng data gốc
  editableUser: Partial<UserProfile> = {};
  constructor(private customerService: CustomerService
    , private userStorageService: UserStorageService
  ) { }

  ngOnInit(): void {
    const user = this.userStorageService.getUser();
    const username = user?.username || '';
    if (!username) {
      // Xử lý trường hợp chưa đăng nhập
      return;
    }
    const userId = this.userStorageService.getUserId();
    if (userId !== null) {
      this.customerService.getUserProfile(userId).subscribe((res) => {
        this.currentUser = res.data;
        this.editableUser = { ...res.data };
      });
    } else {
      this.isLoading = false;
      // handle error
    }
  }
  getCurrentUsername(): string {
    // Lấy username từ localStorage, authService, hoặc bất kỳ đâu bạn lưu
    // Ví dụ (giả sử lưu ở localStorage):
    return localStorage.getItem('username') || '';
  }

  ngOnChanges() {
    if (this.currentUser) {
      this.editableUser = { ...this.currentUser };
    }
  }

  onSave() {
    // Gửi dữ liệu cập nhật lên API
    // this.userService.updateProfile(this.editableUser).subscribe(...)
    alert('Cập nhật thành công!');
  }
  // Xử lý sự kiện khi người dùng upload ảnh đại diện
  onPhotoUploaded(file: File) {
    // Gọi API upload avatar
    // Sau khi upload thành công thì load lại profile
  }
}
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
  birthDay?: string;        // Bổ sung ngày sinh
  totalTours?: number;      // Tổng số tour đã đi
  points?: number;          // Số điểm hiện có
}