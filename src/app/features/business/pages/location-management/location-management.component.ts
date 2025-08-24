import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';


import { LocationService } from '../../services/location.service';
import { LocationDTO } from '../../../../core/models/location.model';
import { LocationFormComponent } from '../../components/location-form/location-form.component';

@Component({
  selector: 'app-location-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzEmptyModule,
    NzAvatarModule,
    NzDropDownModule,
    NzPopconfirmModule,
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
      nzFooter: null, // Form sẽ tự có nút bấm
      nzWidth: '600px',
    });

    if (modalRef.componentInstance) {
      modalRef.componentInstance.locationToEdit = location
        ? { ...location }
        : null;
    }

    modalRef.componentInstance?.formSaved.subscribe((success: boolean) => {
      if (success) {
        modalRef.close();
        this.loadLocations(); // Tải lại dữ liệu
      }
    });
  }

  /**
   * Xử lý việc thay đổi trạng thái ẩn/hiện của địa điểm
   * @param location - Địa điểm cần thay đổi
   * @param newStatus - Trạng thái mới (true = ẩn, false = hiện)
   */
  changeStatus(location: LocationDTO, newStatus: boolean): void {
    this.isLoading = true; // Hiển thị loading trên bảng
    this.locationService
      .changeLocationStatus(location.id, newStatus)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.message.success(
            `Đã ${newStatus ? 'ẩn' : 'hiện'} địa điểm "${location.name}"`
          );
          this.loadLocations(); // Tải lại dữ liệu để cập nhật bảng
        },
        error: (err) => {
          console.error('Lỗi khi thay đổi trạng thái:', err);
          this.message.error('Có lỗi xảy ra, không thể thay đổi trạng thái.');
        },
      });
  }
}
