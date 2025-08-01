// src/app/features/business/pages/location-management/location-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { LocationDTO } from '../../../../core/models/location.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LocationFormComponent } from '../../components/location-form/location-form.component';
import { PagingDTO } from '../../../../core/models/paging.model';


@Component({
  selector: 'app-location-management',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    PaginationComponent,
    LocationFormComponent,
  ],
  templateUrl: './location-management.component.html',
})
export class LocationManagementComponent implements OnInit {
  locations: LocationDTO[] = [];
  isLoading = false;

  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  // Biến để quản lý modal
  isModalVisible = false;

  // Biến để lưu trữ địa điểm đang được chỉnh sửa (sẽ dùng sau)
  selectedLocation: LocationDTO | null = null;

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading = true;
    this.locations = [];

    this.locationService
      .getLocations(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: any) => {
          console.log('API Response Received:', response);

          let pagedData: PagingDTO<LocationDTO> | null = null;

          // Kiểm tra cả 2 cấu trúc response có thể có

          // 1: Interceptor đã "mở gói", response chính là PagingDTO
          // Ta kiểm tra bằng cách xem response có trực tiếp chứa mảng 'items' không.
          if (response && Array.isArray(response.items)) {
            pagedData = response;
          }
          // 2: Response là GeneralResponse đầy đủ (chưa bị mở gói)
          else if (
            response &&
            response.data &&
            Array.isArray(response.data.items)
          ) {
            pagedData = response.data;
          }

          // Nếu tìm thấy dữ liệu phân trang hợp lệ
          if (pagedData) {
            this.locations = pagedData.items;
            this.totalItems = pagedData.total;
            // Đồng bộ lại trang hiện tại với dữ liệu từ API để đảm bảo chính xác
            this.currentPage = pagedData.page;
          } else {
            // Ghi lại lỗi nếu cấu trúc không đúng như mong đợi
            console.error(
              'Failed to fetch locations: Invalid data structure received from API.',
              response
            );
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('An error occurred:', err);
          this.isLoading = false;
        },
      });
  }

  /**
   * Hàm được gọi khi người dùng thay đổi trang.
   * @param page - Số trang mới (được cho là 1-indexed từ component con)
   */
  onPageChange(page: number): void {
    // Gán trực tiếp giá trị mới và gọi API
    // API của chúng ta là 0-indexed, nên ta trừ đi 1
    this.currentPage = page - 1;
    this.loadLocations();
  }
  /**
   * Mở modal để thêm địa điểm mới.
   */
  openAddModal(): void {
    this.selectedLocation = null; // Đảm bảo không có location nào được chọn
    this.isModalVisible = true;
  }

  /**
   * Mở modal để chỉnh sửa một địa điểm đã có.
   * @param location - Đối tượng địa điểm được chọn từ bảng.
   */
  openEditModal(location: LocationDTO): void {
    this.selectedLocation = location;
    this.isModalVisible = true;
  }

  /**
   * Đóng modal.
   */
  closeModal(): void {
    this.isModalVisible = false;
  }

  /**
   * Xử lý sau khi form được lưu thành công.
   * @param success - Biến boolean cho biết thao tác có thành công hay không.
   */
  onFormSaved(success: boolean): void {
    if (success) {
      this.closeModal(); // Đóng modal
      this.loadLocations(); // Tải lại danh sách để cập nhật
    }
  }
}
