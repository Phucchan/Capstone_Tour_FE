import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { BirthDate } from '../../../../shared/pipes/birthdate.pipe';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';

@Component({
  selector: 'app-customer-profile',
  imports: [
    CommonModule,
    FormsModule,
  ],
  standalone: true,
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})

export class CustomerProfileComponent {
  @Input() currentUser: UserProfile | null = null;
  editableUser: Partial<UserProfile> = {};

  constructor(
    private customerService: CustomerService,
    private userStorageService: UserStorageService,
    private currentUserService: CurrentUserService
  ) { }
  
  ngOnInit() {
    const userId = this.currentUserService.getCurrentUser().id;

    console.log('{ProfileComponent} Current User:', this.currentUser);

    console.log('UserId:', userId);
    if (userId !== null) {
      this.customerService.getUserProfile(userId).subscribe((res) => {
        this.currentUser = res.data;
        this.editableUser = { ...res.data };
      });
    } else {
      console.error('Không tìm thấy userId!');
    }
  }

  ngOnChanges() {
    if (this.currentUser) {
      this.editableUser = { ...this.currentUser };
    }
  }

  onSave() {
    const updateData = {
      email: this.editableUser.email,
      fullName: this.editableUser.fullName,
      gender: this.editableUser.gender,
      phone: this.editableUser.phone,
      address: this.editableUser.address,
      avatarImg: this.editableUser.avatarImg,
      dateOfBirth: this.editableUser.dateOfBirth
    };
    this.customerService.updateProfile(updateData).subscribe({
      next: () => {
        // Lấy lại profile mới nhất, lưu ý lấy từ res.data
        this.customerService.getUserProfile(this.userStorageService.getUserId()!).subscribe((res) => {
          this.currentUser = res.data;
          this.editableUser = { ...res.data };
        });
        alert('Cập nhật thành công!');
      },
      error: () => {
        alert('Cập nhật thất bại!');
      }
    });
  }
}

export interface UserProfile {
  email: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  totalToursBooked: number;
  phone: string;
  address: string;
  avatarImg: string;
  dateOfBirth: string; // yyyy-MM-dd
  points: number;
}
