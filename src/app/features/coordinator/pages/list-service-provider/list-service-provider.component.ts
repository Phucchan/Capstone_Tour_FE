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
import { Observable } from 'rxjs';

// --- [THÊM MỚI] Imports cho các module của NG-ZORRO ---
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

// --- Imports từ project của bạn ---
import { PartnerService } from '../../services/partner.service';
import { PartnerSummary } from '../../models/partner.model';
import { Paging } from '../../../../core/models/paging.model';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-list-service-provider',
  standalone: true,
  // --- [CẬP NHẬT] Thêm các module của NG-ZORRO vào imports ---
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzPopconfirmModule,
    NzBreadCrumbModule,
    NzEmptyModule,
    NzToolTipModule,
  ],
  templateUrl: './list-service-provider.component.html',
})
export class ListServiceProviderComponent implements OnInit {
  isLoading = true;
  partners: PartnerSummary[] = [];
  errorMessage: string | null = null;

  // Phân trang: nz-table sử dụng index bắt đầu từ 1
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  filterForm: FormGroup;

  constructor(
    private partnerService: PartnerService,
    private router: Router,
    private message: NzMessageService // [THÊM MỚI] Inject NzMessageService để hiển thị thông báo
  ) {
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      isDeleted: new FormControl(null),
    });
  }

  ngOnInit(): void {
    // Lắng nghe sự thay đổi của form lọc và tải lại dữ liệu
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => this.loadPartners(true)), // Khi lọc, reset về trang đầu tiên
        switchMap(() => this.loadPartners())
      )
      .subscribe();

    // Tải dữ liệu lần đầu
    this.loadPartners().subscribe();
  }

  /**
   * Tải danh sách nhà cung cấp.
   * @param resetPageIndex - Cờ để xác định có reset về trang đầu tiên không (dùng khi lọc).
   */
  loadPartners(
    resetPageIndex: boolean = false
  ): Observable<ApiResponse<Paging<PartnerSummary>>> {
    if (resetPageIndex) {
      this.currentPage = 1;
    }
    this.isLoading = true;
    const { keyword, isDeleted } = this.filterForm.value;

    // [CẬP NHẬT] Chuyển đổi page index từ 1-based (của Zorro) sang 0-based (của API)
    const apiPageIndex = this.currentPage - 1;

    return this.partnerService
      .getPartners(apiPageIndex, this.pageSize, keyword, isDeleted)
      .pipe(
        tap({
          next: (response) => {
            if (response.data) {
              const pageData = response.data as Paging<PartnerSummary>;
              this.partners = pageData.items;
              this.totalItems = pageData.total;
              // API trả về page 0-based, không cần cập nhật lại currentPage ở đây
              // vì nó đã được binding 2 chiều với nz-table
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

  editPartner(id: number): void {
    this.router.navigate(['/coordinator/service-providers/edit', id]);
  }

  /**
   * Thay đổi trạng thái của đối tác.
   * [CẬP NHẬT] Sử dụng NzMessageService để hiển thị thông báo thay vì alert().
   * Popconfirm đã xử lý việc hỏi xác nhận.
   */
  toggleStatus(partner: PartnerSummary): void {
    const newStatus = !partner.deleted;
    const actionText = newStatus ? 'Vô hiệu hóa' : 'Kích hoạt';

    this.partnerService
      .changePartnerStatus(partner.id, { deleted: newStatus })
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.message.success(
              `${actionText} nhà cung cấp "${partner.name}" thành công!`
            );
            // Cập nhật lại trạng thái ngay trên giao diện
            const index = this.partners.findIndex((p) => p.id === partner.id);
            if (index !== -1) {
              this.partners[index].deleted = newStatus;
              // Tạo một mảng mới để trigger change detection của nz-table
              this.partners = [...this.partners];
            }
          } else {
            this.message.error(
              response.message || `Lỗi khi ${actionText.toLowerCase()}`
            );
          }
        },
        error: (err) => {
          this.message.error(
            err.message || `Đã có lỗi xảy ra khi ${actionText.toLowerCase()}`
          );
        },
      });
  }
}
