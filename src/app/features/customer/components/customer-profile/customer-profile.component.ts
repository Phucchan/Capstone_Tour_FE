import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';

@Component({
  selector: 'app-customer-profile',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.css'
})

export class CustomerProfileComponent {
  [x: string]: any;
  @Input() user: UserProfile | null = null;
  editableUser: Partial<UserProfile> = {};
  
  constructor
  (private customerService: CustomerService,
  private userStorageService: UserStorageService
  ) { }
  ngOnChanges() {
    if (this.user) {
      console.log('User data changed:', this.user);
      this.editableUser = { ...this.user };
      console.log('Editable user data:', this.editableUser);
    }
  }


  onSave() {
    const updateData = {
      fullName: this.editableUser.fullName,
      gender: this.editableUser.gender,
      email: this.editableUser.email,
      phone: this.editableUser.phone,
      address: this.editableUser.address,
      avatarImg: this.editableUser.avatarImg
    };
    this.customerService.updateProfile(updateData).subscribe({
      next: (updatedUser: UserProfile) => {
        this.user = updatedUser;
        alert('Cập nhật thành công!');
      },
      error: () => {
        alert('Cập nhật thất bại!');
      }
    });
  }


}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  gender: string;
  phone: string;
  address: string;
  avatarImg: string;
  createAt: string;
  birthDay?: string;
  totalTours?: number;
  points?: number;
}
