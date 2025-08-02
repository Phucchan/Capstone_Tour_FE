import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 1. Import CommonModule

@Component({
  selector: 'app-add-service-provider',
  standalone: true, // 2. Đánh dấu là standalone component
  imports: [CommonModule], // 3. Thêm CommonModule vào imports
  templateUrl: './add-service-provider.component.html',
  // 4. Xóa styleUrl vì đã dùng Tailwind CSS
})
export class AddServiceProviderComponent {

}
