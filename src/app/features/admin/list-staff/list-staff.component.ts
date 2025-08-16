import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminService } from '../admin.service';
import { UserFullInformation } from '../models/user.model';
import { Paging } from '../../../core/models/paging.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { StatusVietnamesePipe } from '../../../shared/pipes/status-vietnamese.pipe';

@Component({
  selector: 'app-list-staff',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SpinnerComponent,
    AvatarComponent,
    PaginationComponent,
    StatusVietnamesePipe,
  ],
  templateUrl: './list-staff.component.html',
})
export class ListStaffComponent implements OnInit {
  staffs: UserFullInformation[] = [];
  paging: Paging<UserFullInformation> | null = null;
  isLoading = false;
  currentPage = 0;
  pageSize = 10;
  keyword = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    this.adminService
      .getStaff(this.currentPage, this.pageSize, this.keyword)
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.staffs = response.data.items;
            this.paging = response.data;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load staff', err);
          alert('Tải danh sách nhân viên thất bại!');
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadStaff();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadStaff();
  }

  // Sử dụng confirm() và alert() của trình duyệt thay cho Popconfirm và Message
  toggleStatus(staff: UserFullInformation): void {
    const action = staff.deleted ? 'Mở khóa' : 'Khóa';
    const confirmation = confirm(
      `Bạn có chắc chắn muốn ${action.toLowerCase()} tài khoản "${
        staff.fullName
      }" không?`
    );

    if (confirmation) {
      const newStatus = staff.deleted ? 'ACTIVE' : 'INACTIVE';
      this.adminService.changeUserStatus(staff.id, { newStatus }).subscribe({
        next: () => {
          alert(`${action} tài khoản thành công!`);
          this.loadStaff(); // Tải lại danh sách
        },
        error: (err) => {
          console.error(`Failed to change status for staff ${staff.id}`, err);
          alert(
            `Đã có lỗi xảy ra, không thể ${action.toLowerCase()} tài khoản.`
          );
        },
      });
    }
  }

  getStatus(deleted: boolean): string {
    return deleted ? 'INACTIVE' : 'ACTIVE';
  }
}
