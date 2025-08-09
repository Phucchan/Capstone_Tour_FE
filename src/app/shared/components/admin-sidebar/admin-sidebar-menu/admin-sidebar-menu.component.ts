// src/app/shared/components/admin-sidebar/admin-sidebar-menu/admin-sidebar-menu.component.ts
import { Component, OnInit } from '@angular/core';
import { AdminSidebarSubMenuComponent } from '../admin-sidebar-sub-menu/admin-sidebar-sub-menu.component';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { layoutService } from '../../../../features/admin/layout/services/layout.service';
import { MenuItem, SubMenuItem } from '../../../../core/models/menu.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenuService } from '../../../../core/services/menu.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';

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
  public menuItems$!: Observable<MenuItem[]>;

  constructor(
    public layoutService: layoutService,
    private menuService: MenuService,
    private userStorageService: UserStorageService
  ) {}

  ngOnInit(): void {
    const userRoles = this.userStorageService.getUserRoles() || [];

    // ======================================================
    // === LOGIC SỬA LỖI QUAN TRỌNG NHẤT ===
    // ======================================================
    if (userRoles.includes('ADMIN')) {
      // NẾU LÀ ADMIN:
      // Nhận trực tiếp luồng menu từ MenuService mà KHÔNG cần lọc lại.
      // Vì MenuService đã đảm bảo cung cấp toàn bộ menu cho Admin rồi.
      this.menuItems$ = this.menuService.menuItems$;
    } else {
      // NẾU KHÔNG PHẢI ADMIN:
      // Giữ nguyên logic lọc quyền như cũ cho các vai trò khác.
      this.menuItems$ = this.menuService.menuItems$.pipe(
        map((menuItems) => {
          const filteredGroups = menuItems.filter(
            (group) =>
              !group.roles ||
              group.roles.length === 0 ||
              group.roles.some((role) => userRoles.includes(role))
          );

          return filteredGroups
            .map((group) => {
              const filteredItems = group.items.filter(
                (item) =>
                  !item.roles ||
                  item.roles.length === 0 ||
                  item.roles.some((role) => userRoles.includes(role))
              );
              return { ...group, items: filteredItems };
            })
            .filter((group) => group.items.length > 0);
        })
      );
    }
  }

  public toggleMenu(subMenu: SubMenuItem) {
    this.layoutService.toggleMenu(subMenu);
  }
}
