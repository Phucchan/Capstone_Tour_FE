import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  tap,
} from 'rxjs/operators';
import { PartnerService } from '../../services/partner.service';
import { PartnerSummary } from '../../models/partner.model';
import { Paging } from '../../../../core/models/paging.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-list-service-provider',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SpinnerComponent,
    PaginationComponent,
  ],
  templateUrl: './list-service-provider.component.html',
})
export class ListServiceProviderComponent implements OnInit {
  isLoading = true;
  partners: PartnerSummary[] = [];
  errorMessage: string | null = null;

  // Phân trang
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  // Form lọc
  filterForm: FormGroup;

  constructor(private partnerService: PartnerService, private router: Router) {
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      isDeleted: new FormControl(null), // null: all, false: active, true: inactive
    });
  }

  // === SỬA LỖI: Bỏ đi một chữ 'void' bị thừa ===
  ngOnInit(): void {
    // Tải dữ liệu lần đầu
    this.loadPartners().subscribe();

    // Lắng nghe sự thay đổi của form lọc
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap(() => this.loadPartners(0))
      )
      .subscribe();
  }

  /**
   * Hàm này trả về một Observable để tương thích với switchMap.
   */
  loadPartners(
    page: number = this.currentPage
  ): Observable<ApiResponse<Paging<PartnerSummary>>> {
    this.isLoading = true;
    this.currentPage = page;
    const { keyword, isDeleted } = this.filterForm.value;

    return this.partnerService
      .getPartners(this.currentPage, this.pageSize, keyword, isDeleted)
      .pipe(
        tap({
          next: (response) => {
            if (response.data) {
              const pageData = response.data as Paging<PartnerSummary>;
              this.partners = pageData.items;
              this.totalItems = pageData.total;
              this.currentPage = pageData.page;
              this.errorMessage = null;
            } else {
              this.errorMessage =
                response.message || 'Không thể tải danh sách đối tác.';
              this.partners = [];
              this.totalItems = 0;
            }
          },
          error: (err) => {
            this.errorMessage =
              err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            this.partners = [];
            this.totalItems = 0;
          },
        }),
        finalize(() => (this.isLoading = false))
      );
  }

  onPageChange(page: number): void {
    this.loadPartners(page).subscribe();
  }

  editPartner(id: number): void {
    this.router.navigate(['/coordinator/service-providers/edit', id]);
  }

  /**
   * Thay đổi trạng thái của đối tác bằng cách gọi API PATCH
   */
  toggleStatus(partner: PartnerSummary): void {
    const newStatus = !partner.deleted;
    const actionText = newStatus ? 'vô hiệu hóa' : 'kích hoạt';

    if (
      !confirm(
        `Bạn có chắc muốn ${actionText} nhà cung cấp "${partner.name}" không?`
      )
    ) {
      return;
    }

    this.partnerService
      .changePartnerStatus(partner.id, { deleted: newStatus })
      .subscribe({
        next: (response) => {
          if (response.data) {
            alert(`Đã ${actionText} thành công!`);
            // Cập nhật lại trạng thái của đối tác trong danh sách hiện tại để giao diện thay đổi ngay lập tức
            const index = this.partners.findIndex((p) => p.id === partner.id);
            if (index !== -1) {
              this.partners[index].deleted = newStatus;
            }
          } else {
            alert(`Lỗi: ${response.message}`);
          }
        },
        error: (err) => {
          alert(`Đã có lỗi xảy ra: ${err.message}`);
        },
      });
  }
}
