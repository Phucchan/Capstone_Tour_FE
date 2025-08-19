// src/app/features/marketing/pages/discount-management/discount-management.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'; // SỬA LỖI 1: Thêm FormsModule
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  switchMap,
  tap,
} from 'rxjs';

import { DiscountService } from '../../services/discount.service';
import {
  TourDiscountRequest,
  TourDiscountSummary,
  TourScheduleSelectItem,
} from '../../models/tour-discount.model';
import { Paging } from '../../../../core/models/paging.model';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-discount-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // SỬA LỖI 1: Thêm FormsModule vào imports
    ReactiveFormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzInputNumberModule,
    NzDatePickerModule,
  ],
  templateUrl: './discount-management.component.html',
})
export class DiscountManagementComponent implements OnInit {
  // Services
  private discountService = inject(DiscountService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);

  // Component State
  data: Paging<TourDiscountSummary> = {
    items: [],
    page: 0,
    size: 10,
    total: 0,
  };
  isLoading = true;
  searchKeyword = '';

  // Modal State
  isModalVisible = false;
  isModalLoading = false;
  discountForm!: FormGroup;

  // Tour Schedule Search State
  isScheduleSearching = false;
  tourSchedules: TourScheduleSelectItem[] = [];
  private searchSchedule$ = new Subject<string>();

  ngOnInit(): void {
    this.fetchData();
    this.initForm();
    this.initScheduleSearch();
  }

  fetchData(page: number = 0, size: number = 10, keyword: string = ''): void {
    this.isLoading = true;
    this.discountService
      .getDiscounts(keyword, page, size)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((res: ApiResponse<Paging<TourDiscountSummary>>) => {
        // Thêm kiểu dữ liệu cho res
        // SỬA LỖI 2: Kiểm tra 'status' thay vì 'isSuccess'
        if (res.status === 200) {
          this.data = res.data;
        }
      });
  }

  onSearch(): void {
    this.fetchData(0, this.data.size, this.searchKeyword);
  }

  onPageIndexChange(page: number): void {
    // nz-table page index is 1-based, API is 0-based
    this.fetchData(page - 1, this.data.size, this.searchKeyword);
  }

  private initForm(): void {
    this.discountForm = this.fb.group({
      scheduleId: [null, [Validators.required]],
      discountPercent: [
        null,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      dateRange: [null, [Validators.required]],
    });
  }

  private initScheduleSearch(): void {
    this.searchSchedule$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((term) => term.length >= 2),
        tap(() => {
          this.isScheduleSearching = true;
          this.tourSchedules = [];
        }),
        switchMap((term) =>
          this.discountService
            .searchTourSchedules(term)
            .pipe(finalize(() => (this.isScheduleSearching = false)))
        )
      )
      .subscribe((res: ApiResponse<TourScheduleSelectItem[]>) => {
        // Thêm kiểu dữ liệu cho res
        // SỬA LỖI 2: Kiểm tra 'status' thay vì 'isSuccess'
        if (res.status === 200) {
          this.tourSchedules = res.data;
        }
      });
  }

  onScheduleSearch(value: string): void {
    if (value) {
      this.searchSchedule$.next(value);
    }
  }

  showCreateModal(): void {
    this.discountForm.reset();
    this.isModalVisible = true;
  }

  handleOk(): void {
    if (this.discountForm.invalid) {
      Object.values(this.discountForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isModalLoading = true;
    const formValue = this.discountForm.value;

    const request: TourDiscountRequest = {
      scheduleId: formValue.scheduleId,
      discountPercent: formValue.discountPercent,
      startDate: formValue.dateRange[0].toISOString(),
      endDate: formValue.dateRange[1].toISOString(),
    };

    this.discountService
      .createDiscount(request)
      .pipe(finalize(() => (this.isModalLoading = false)))
      .subscribe({
        next: (res: ApiResponse<TourDiscountSummary>) => {
          // Thêm kiểu dữ liệu cho res
          // SỬA LỖI 2: Kiểm tra 'status' thay vì 'isSuccess'
          if (res.status === 200) {
            this.message.success('Tạo khuyến mãi thành công!');
            this.isModalVisible = false;
            this.fetchData(); // Refresh data
          } else {
            this.message.error(res.message || 'Đã có lỗi xảy ra.');
          }
        },
        error: (err) =>
          this.message.error('Đã có lỗi xảy ra. Vui lòng thử lại.'),
      });
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  // Validator for date range picker to disable past dates
  disabledDate = (current: Date): boolean => {
    return current && current.getTime() < Date.now() - 86400000; // a day tolerance
  };
}
