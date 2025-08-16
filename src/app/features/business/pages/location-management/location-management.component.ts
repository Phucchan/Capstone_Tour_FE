/*
 * FILE: src/app/features/business/pages/location-management/location-management.component.ts
 * MÔ TẢ:
 * - Thêm các module NG-ZORRO cần thiết.
 * - Thay thế modal tự quản lý bằng NzModalService để hiển thị form.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// --- [THAY ĐỔI] Import các module của NG-ZORRO ---
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

import { LocationService } from '../../services/location.service';
import { LocationDTO } from '../../../../core/models/location.model';
import { LocationFormComponent } from '../../components/location-form/location-form.component';

@Component({
  selector: 'app-location-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocationFormComponent,
    // --- [THAY ĐỔI] Thêm các module NG-ZORRO ---
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzEmptyModule,
    NzAvatarModule,
  ],
  templateUrl: './location-management.component.html',
})
export class LocationManagementComponent implements OnInit {
  locations: LocationDTO[] = [];
  isLoading = true;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 1;
  keyword = '';

  private searchSubject = new Subject<string>();

  private locationService = inject(LocationService);
  private modalService = inject(NzModalService);
  private message = inject(NzMessageService);

  ngOnInit(): void {
    this.loadLocations();

    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.keyword = searchValue;
        this.loadLocations(1);
      });
  }

  loadLocations(pageIndex: number = this.pageIndex): void {
    this.isLoading = true;
    this.pageIndex = pageIndex;
    this.locationService
      .getLocations(pageIndex - 1, this.pageSize, this.keyword)
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.locations = response.data.items;
            this.totalItems = response.data.total;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('An error occurred:', err);
          this.message.error('Tải danh sách địa điểm thất bại!');
          this.isLoading = false;
        },
      });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex } = params;
    this.loadLocations(pageIndex);
  }

  openLocationModal(location?: LocationDTO): void {
    const isEditMode = !!location;
    const modalTitle = isEditMode ? 'Chỉnh sửa Địa điểm' : 'Thêm Địa điểm mới';

    const modalRef = this.modalService.create({
      nzTitle: modalTitle,
      nzContent: LocationFormComponent,
      // [SỬA LỖI] Xóa thuộc tính 'nzComponentParams' không hợp lệ.
      // Dữ liệu sẽ được truyền vào ở bước dưới.
      nzFooter: null, // Form sẽ tự có nút bấm
      nzWidth: '600px',
    });

    // [SỬA LỖI] Gán dữ liệu vào @Input của component sau khi modal được tạo.
    if (modalRef.componentInstance) {
      modalRef.componentInstance.locationToEdit = location
        ? { ...location }
        : null;
    }

    // Lắng nghe sự kiện khi form được lưu
    modalRef.componentInstance?.formSaved.subscribe((success: boolean) => {
      if (success) {
        modalRef.close();
        this.loadLocations(); // Tải lại dữ liệu
      }
    });
  }
}
