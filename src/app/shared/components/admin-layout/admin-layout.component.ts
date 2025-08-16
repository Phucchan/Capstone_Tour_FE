/*
 * FILE: src/app/shared/components/admin-layout/admin-layout.component.ts
 * MÔ TẢ:
 * - Cập nhật để tải cả 2 file CSS: một cho thư viện, một cho theme tùy chỉnh.
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminFooterComponent,
  ],
  templateUrl: './admin-layout.component.html',
  // [THAY ĐỔI] Tải cả 2 file CSS
  styleUrls: [
    '../../../../assets/styles/zorro-styles.css',
    '../../../../assets/styles/admin-theme.css',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AdminLayoutComponent {}
