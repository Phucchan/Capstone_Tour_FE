import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-staff-detail',
  standalone: true, // Đánh dấu component là standalone
  imports: [CommonModule], // Import các module cần thiết
  templateUrl: './post-staff-detail.component.html',
  // Không cần styleUrl vì đã dùng Tailwind
})
export class PostStaffDetailComponent {

}
