import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Định nghĩa interface cho Nhà cung cấp
export interface ServiceProvider {
  id: number;
  image: string;
  name: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  status: 'Hoạt động' | 'Ngưng hoạt động';
}

@Component({
  selector: 'app-list-service-provider',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './list-service-provider.component.html',
  // Không cần file CSS riêng khi dùng Tailwind
})
export class ListServiceProviderComponent implements OnInit {

  serviceProviders: ServiceProvider[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadSampleData();
  }

  loadSampleData(): void {
    this.serviceProviders = [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
        name: 'Nhà hàng Paradise',
        website: 'https://paradise.com',
        email: 'contact@paradise.com',
        phone: '028 3838 3838',
        address: '123 Lê Lợi, Quận 1, TP.HCM',
        status: 'Hoạt động'
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
        name: 'Khách sạn Ocean View',
        website: 'https://oceanview.vn',
        email: 'booking@oceanview.vn',
        phone: '0236 3999 888',
        address: '456 Võ Nguyên Giáp, Đà Nẵng',
        status: 'Hoạt động'
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbb563?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
        name: 'Resort Green Valley',
        website: 'https://greenvalley.com',
        email: 'info@greenvalley.com',
        phone: '0258 3777 999',
        address: '789 Trần Phú, Nha Trang',
        status: 'Ngưng hoạt động'
      }
    ];
  }

  /**
   * === THÊM PHƯƠNG THỨC MỚI TẠI ĐÂY ===
   * Hàm để thay đổi trạng thái của nhà cung cấp khi click.
   * @param provider Nhà cung cấp được chọn.
   */
  toggleStatus(provider: ServiceProvider): void {
    // Thay đổi trạng thái của nhà cung cấp
    provider.status = provider.status === 'Hoạt động' ? 'Ngưng hoạt động' : 'Hoạt động';

    // Trong một ứng dụng thực tế, bạn sẽ gọi API để cập nhật trạng thái trên server ở đây.
    // Ví dụ: this.serviceProviderService.updateStatus(provider.id, provider.status).subscribe();
    console.log(`Đã cập nhật trạng thái cho nhà cung cấp '${provider.name}' thành '${provider.status}'`);
  }

  viewDetails(providerId: number): void {
    console.log('Xem chi tiết cho nhà cung cấp ID:', providerId);
    // Ví dụ: this.router.navigate(['/coordinator/service-providers', providerId]);
  }
}
