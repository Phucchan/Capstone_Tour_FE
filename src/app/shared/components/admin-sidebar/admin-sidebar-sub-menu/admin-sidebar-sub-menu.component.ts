import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from '../../../../core/models/menu.model';
import { LayoutService } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-admin-sidebar-sub-menu',
  standalone: true,
  // Thêm chính nó vào imports để cho phép đệ quy
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    AngularSvgIconModule,
    AdminSidebarSubMenuComponent,
  ],
  templateUrl: './admin-sidebar-sub-menu.component.html',
})
export class AdminSidebarSubMenuComponent {
  // Component này nhận vào một MẢNG các mục menu con
  @Input() public submenu: SubMenuItem[] = [];

  public layoutService = inject(LayoutService);

  public toggleMenu(item: SubMenuItem): void {
    // Xử lý việc đóng/mở menu con cấp nhỏ hơn (nếu có)
    item.expanded = !item.expanded;
  }
}
