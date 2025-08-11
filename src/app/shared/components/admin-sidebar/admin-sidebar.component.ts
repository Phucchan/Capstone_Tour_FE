import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import packageJson from '../../../../../package.json';
import { LayoutService } from '../../../core/services/layout.service';
import { AdminSidebarMenuComponent } from './admin-sidebar-menu/admin-sidebar-menu.component';

@Component({
  // SỬA LỖI 1: Đổi selector cho đúng với cách gọi trong layout.component.html
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    // Import component menu chính
    AdminSidebarMenuComponent,
  ],
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent implements OnInit {
  public appJson: any = packageJson;
  public layoutService = inject(LayoutService);

  ngOnInit(): void {}

  public toggleSidebar() {
    this.layoutService.toggleSidebar();
  }
}
