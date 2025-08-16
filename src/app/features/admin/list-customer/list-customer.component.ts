/*
 * FILE: src/app/features/admin/list-customer/list-customer.component.ts
 * MÔ TẢ:
 * - Đã thêm các import cần thiết từ NG-ZORRO.
 * - Cập nhật logic tìm kiếm để sử dụng debounceTime, giúp cải thiện hiệu suất.
 * - Thêm hàm getStatusColor để hiển thị màu trạng thái.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// --- [THAY ĐỔI] Import các module của NG-ZORRO ---
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { AdminService } from '../services/admin.service';
import { UserFullInformation } from '../models/user.model';
import { Paging } from '../../../core/models/paging.model';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { StatusVietnamesePipe } from '../../../shared/pipes/status-vietnamese.pipe';

@Component({
  selector: 'app-list-customer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
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
    NzSpinModule,
  ],
  templateUrl: './list-customer.component.html',
})
export class ListCustomerComponent implements OnInit {
  // Giữ nguyên các thuộc tính cũ
  customers: UserFullInformation[] = [];
  paging: Paging<UserFullInformation> | null = null;
  isLoading = true;
  keyword = '';

  // --- [THAY ĐỔI] Thêm Subject để xử lý debounce cho việc tìm kiếm ---
  private searchSubject = new Subject<string>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCustomers();

    // Lắng nghe sự kiện tìm kiếm
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.loadCustomers(1, searchValue);
      });
  }

  loadCustomers(page: number = 1, search: string | null = null): void {
    this.isLoading = true;
    const currentPage = page - 1; // API tính page từ 0
    const currentSearch = search === null ? this.keyword : search;

    this.adminService
      .getCustomers(currentPage, this.paging?.size ?? 10, currentSearch)
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.customers = response.data.items;
            this.paging = response.data;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load customers', err);
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.loadCustomers(page);
  }

  // --- [THAY ĐỔI] Cập nhật hàm onSearchChange ---
  onSearchChange(value: string): void {
    this.keyword = value;
    this.searchSubject.next(value);
  }

  // --- [THAY ĐỔI] Thêm hàm lấy màu cho trạng thái ---
  getStatusColor(deleted: boolean): string {
    return deleted ? 'red' : 'green';
  }
}
