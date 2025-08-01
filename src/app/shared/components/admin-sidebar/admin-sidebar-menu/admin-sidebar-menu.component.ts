// src/app/shared/components/admin-sidebar/admin-sidebar-menu/admin-sidebar-menu.component.ts
import { Component, OnInit } from '@angular/core';
import { AdminSidebarSubMenuComponent } from '../admin-sidebar-sub-menu/admin-sidebar-sub-menu.component';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { layoutService } from '../../../../features/admin/layout/services/layout.service';
import { MenuItem, SubMenuItem } from '../../../../core/models/menu.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <-- Thêm import 'map'
import { MenuService } from '../../../../core/services/menu.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service'; // <-- Thêm import UserStorageService

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
    private userStorageService: UserStorageService // <-- Inject service vào đây
  ) {}

  ngOnInit(): void {
    const userRoles = this.userStorageService.getUserRoles() || [];

    this.menuItems$ = this.menuService.menuItems$.pipe(
      map((menuItems) => {
        // 1. Lọc các nhóm menu (group) mà user có quyền thấy
        const filteredGroups = menuItems.filter(
          (group) =>
            !group.roles ||
            group.roles.length === 0 ||
            group.roles.some((role) => userRoles.includes(role))
        );

        // 2. Với mỗi nhóm, tiếp tục lọc các mục con (item) bên trong
        return (
          filteredGroups
            .map((group) => {
              const filteredItems = group.items.filter(
                (item) =>
                  !item.roles ||
                  item.roles.length === 0 ||
                  item.roles.some((role) => userRoles.includes(role))
              );
              // Trả về một object nhóm mới với các item đã được lọc
              return { ...group, items: filteredItems };
            })
            // 3. Cuối cùng, chỉ giữ lại những nhóm có ít nhất 1 mục con
            .filter((group) => group.items.length > 0)
        );
      })
    );
  }

  public toggleMenu(subMenu: SubMenuItem) {
    this.layoutService.toggleMenu(subMenu);
  }
}
