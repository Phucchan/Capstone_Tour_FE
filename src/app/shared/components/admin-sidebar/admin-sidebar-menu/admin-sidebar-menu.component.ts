// src/app/shared/components/admin-sidebar/admin-sidebar-menu/admin-sidebar-menu.component.ts
import { Component, OnInit } from '@angular/core';
import { AdminSidebarSubMenuComponent } from '../admin-sidebar-sub-menu/admin-sidebar-sub-menu.component';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { layoutService } from '../../../../features/admin/layout/services/layout.service';
import { MenuItem, SubMenuItem } from '../../../../core/models/menu.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Observable } from 'rxjs';
import { MenuService } from '../../../../core/services/menu.service';

@Component({
  selector: 'app-admin-sidebar-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    AdminSidebarSubMenuComponent,
    AngularSvgIconModule,
  ],
  templateUrl: './admin-sidebar-menu.component.html',
})
export class AdminSidebarMenuComponent implements OnInit {
  // Component giờ chỉ cần một Observable để nhận menu
  public menuItems$!: Observable<MenuItem[]>;

  // Inject MenuService thay vì CurrentUserService
  constructor(
    public layoutService: layoutService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    // Lấy menu từ service
    this.menuItems$ = this.menuService.menuItems$;
  }

  // Hàm này vẫn giữ nguyên để xử lý việc đóng/mở menu
  public toggleMenu(subMenu: SubMenuItem) {
    this.layoutService.toggleMenu(subMenu);
  }
}
