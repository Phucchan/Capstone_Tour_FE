/*
 * FILE: src/app/features/admin/list-staff/list-staff.component.ts
 * MÔ TẢ:
 * - Đã thêm các module NG-ZORRO cần thiết.
 * - Cập nhật logic tìm kiếm để sử dụng debounceTime.
 * - Thay thế confirm() và alert() bằng NzMessageService và NzModalService.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// --- [THAY ĐỔI] Import các module của NG-ZORRO ---
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AdminService } from '../services/admin.service';
import { UserFullInformation } from '../models/user.model';
import { Paging } from '../../../core/models/paging.model';
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
    AvatarComponent,
    PaginationComponent,
    StatusVietnamesePipe,
    // --- [THAY ĐỔI] Thêm các module NG-ZORRO vào imports ---
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzEmptyModule,
    NzPopconfirmModule,
  ],
  templateUrl: './list-staff.component.html',
})
export class ListStaffComponent implements OnInit {
  staffs: UserFullInformation[] = [];
  paging: Paging<UserFullInformation> | null = null;
  isLoading = true;
  keyword = '';

  private searchSubject = new Subject<string>();

  constructor(
    private adminService: AdminService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadStaff();

    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.loadStaff(1, searchValue);
      });
  }

  loadStaff(page: number = 1, search: string | null = null): void {
    this.isLoading = true;
    const currentPage = page - 1;
    const currentSearch = search === null ? this.keyword : search;

    this.adminService
      .getStaff(currentPage, this.paging?.size ?? 10, currentSearch)
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
          this.message.error('Tải danh sách nhân viên thất bại!');
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.loadStaff(page);
  }

  onSearchChange(value: string): void {
    this.keyword = value;
    this.searchSubject.next(value);
  }

  toggleStatus(staff: UserFullInformation): void {
    const action = staff.deleted ? 'Mở khóa' : 'Khóa';

    // Gửi đi trạng thái quản lý tài khoản, không phải trạng thái chat
    const newStatus = staff.deleted ? 'ACTIVE' : 'INACTIVE';

    this.adminService.changeUserStatus(staff.id, { newStatus }).subscribe({
      next: () => {
        this.message.success(`${action} tài khoản thành công!`);
        // Cập nhật giao diện ngay lập tức
        staff.deleted = !staff.deleted;
      },
      error: (err) => {
        console.error(`Failed to change status for staff ${staff.id}`, err);
        this.message.error(
          `Đã có lỗi xảy ra, không thể ${action.toLowerCase()} tài khoản.`
        );
      },
    });
  }

  getStatusColor(deleted: boolean): string {
    return deleted ? 'red' : 'green';
  }
}
