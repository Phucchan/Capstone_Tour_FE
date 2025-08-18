// src/app/features/customer/components/voucher-page/voucher-page.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VoucherService } from '../../services/voucher.service';
import { CustomerService } from '../../services/customer.service';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

 enum VoucherStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    EXPIRED = 'EXPIRED',
    USED = 'USED',
  }

   
@Component({
  selector: 'app-voucher-page',
  standalone: true,
  imports: [CommonModule, 
    FormsModule,
    PaginationComponent
  ],
  templateUrl: './voucher-page.component.html',
  styleUrls: ['./voucher-page.component.css']
})
export class VoucherPageComponent implements OnInit {
  // --- state hiển thị ---
  isLoading = true;         
  redeemingId: number | null = null; 

  // điểm hiện có
  points = 0;               

  // search / paging cho danh sách voucher công khai
  keyword = '';             
  page = 0;                 
  size = 5;                
  total = 0;                
  vouchers: any[] = [];     

  // voucher của tôi
  myVouchers: any[] = [];   

  VoucherStatusLabel: Record<VoucherStatus, string> = {
    [VoucherStatus.ACTIVE]: 'Đang hoạt động',
    [VoucherStatus.INACTIVE]: 'Không hoạt động',
    [VoucherStatus.EXPIRED]: 'Hết hạn',
    [VoucherStatus.USED]: 'Đã sử dụng',
  };
  
getStatusLabel(status: VoucherStatus): string {
    return this.VoucherStatusLabel[status] ?? status;
  }

  
  

  constructor(
    private voucherService: VoucherService,
    private customerService: CustomerService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.loadAll(); 
  }

  // load profile (điểm), list voucher, my voucher
  
  private loadAll(): void {
    const userId = this.currentUserService.getCurrentUser().id;
    this.isLoading = true;
    // lấy điểm
    this.customerService.getUserProfile(userId).subscribe({
      next: (res) => {
        this.points = res?.data?.points ?? 0;
      },
      error: () => {},
    });

    // danh sách voucher công khai
    this.fetchVouchers();

    // danh sách voucher của tôi
    this.fetchMyVouchers();
  }

  
  fetchVouchers(): void {
    this.voucherService.getVouchers({
      page: this.page,
      size: this.size,
      keyword: this.keyword?.trim() || undefined,
    }).subscribe({
      next: (res) => {
        // API mẫu: { data: { page, size, total, items: [...] } }
        const data = res?.data ?? {};
        this.vouchers = data.items ?? [];
        this.total = data.total ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.vouchers = [];
        this.total = 0;
        this.isLoading = false;
      }
    });
  }

  
  fetchMyVouchers(): void {
    const userId = this.currentUserService.getCurrentUser().id;
    this.voucherService.getUserVouchers(userId).subscribe({
      next: (arr) => { this.myVouchers = arr; },
    error: () => { this.myVouchers = []; }
    });
  }

  // tìm kiếm
  
  onSearch(): void {
    this.page = 0;
    this.fetchVouchers();
  }

  // clear keyword
  
  clearKeyword(): void {
    this.keyword = '';
    this.page = 0;
    this.fetchVouchers();
  }

  // phân trang
  
  onPageChange(p: number): void {
    const totalPages = Math.ceil(this.total / this.size);
    if (p < 0 || p >= totalPages) return;
    this.page = p;
    this.fetchVouchers();
  }

  // điều kiện có thể đổi voucher
  
  canRedeem(v: any): boolean {
    const statusOk = (v?.voucherStatus ?? 'ACTIVE') === 'ACTIVE';
    const pointsOk = this.points >= (v?.pointsRequired ?? 0);
    const now = new Date().getTime();
    const from = v?.validFrom ? new Date(v.validFrom).getTime() : -Infinity;
    const to   = v?.validTo   ? new Date(v.validTo).getTime()   : Infinity;
    const dateOk = now >= from && now <= to;
    return statusOk && pointsOk && dateOk;
  }

  // đổi voucher
  
  redeem(v: any): void {
    if (!this.canRedeem(v)) return;
    const userId = this.currentUserService.getCurrentUser().id;
    this.redeemingId = v.id;

    this.voucherService.redeemVoucher(userId, v.id).subscribe({
      next: () => {
        // reload lại điểm, list voucher, my voucher
        this.customerService.getUserProfile(userId).subscribe({
          next: (res) => { this.points = res?.data?.points ?? this.points; },
          error: () => {}
        });
        this.fetchVouchers();
        this.fetchMyVouchers();
        this.redeemingId = null;
        alert('Đổi voucher thành công!');
      },
      error: (err) => {
        this.redeemingId = null;
        alert(err?.error?.message || 'Đổi voucher thất bại');
      }
    });
  }
   
}