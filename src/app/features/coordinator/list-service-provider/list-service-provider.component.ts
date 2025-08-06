import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { PartnerService } from '../services/partner.service';
import { PartnerSummary } from '../models/partner.model';

// SỬA LỖI: Import các component dùng chung
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-list-service-provider',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent, // Đảm bảo đã import
    SpinnerComponent, // Đảm bảo đã import
  ],
  templateUrl: './list-service-provider.component.html',
})
export class ListServiceProviderComponent implements OnInit {
  partners: PartnerSummary[] = [];
  totalItems = 0;
  isLoading = false;
  errorMessage: string | null = null;
  filterForm: FormGroup;
  currentPage = 0;
  pageSize = 10;

  constructor(private partnerService: PartnerService) {
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      isDeleted: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.loadPartners();
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadPartners();
    });
  }

  loadPartners(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;
    const { keyword, isDeleted } = this.filterForm.value;

    this.partnerService
      .getPartners(this.currentPage, this.pageSize, keyword, isDeleted)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          // SỬA LỖI 1: Thay 'response.isSuccess' bằng 'response.status === 200'
          if (response.status === 200 && response.data) {
            this.partners = response.data.items;
            this.totalItems = response.data.total;
          } else {
            this.errorMessage =
              response.message || 'Đã có lỗi không xác định xảy ra.';
            this.partners = [];
            this.totalItems = 0;
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Không thể kết nối đến máy chủ.';
          this.partners = [];
          this.totalItems = 0;
        },
      });
  }

  toggleStatus(partner: PartnerSummary): void {
    const newStatus = !partner.deleted;
    const confirmationMessage = `Bạn có chắc muốn ${
      newStatus ? 'vô hiệu hóa' : 'kích hoạt'
    } đối tác "${partner.name}" không?`;

    // Sử dụng một modal/dialog tùy chỉnh thay vì confirm()
    if (window.confirm(confirmationMessage)) {
      this.partnerService
        .changePartnerStatus(partner.id, { deleted: newStatus })
        .subscribe({
          next: () => {
            this.loadPartners();
          },
          error: (err) => {
            // Sử dụng một modal/dialog tùy chỉnh thay vì alert()
            alert(`Cập nhật thất bại: ${err.message}`);
          },
        });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPartners();
  }
}
