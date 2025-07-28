import { Component, OnInit } from '@angular/core';
import { AdminSidebarSubMenuComponent } from '../admin-sidebar-sub-menu/admin-sidebar-sub-menu.component';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { layoutService } from '../../../../features/admin/layout/services/layout.service';
import { MenuItem, SubMenuItem } from '../../../../core/models/menu.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MENU_ITEMS } from '../../../../core/constants/menu';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';

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
  public menuFiltered: MenuItem[] = [];
  // Thay đổi để lưu một mảng các role
  private userRoles: string[] = [];

  constructor(
    public layoutService: layoutService,
    private router: Router,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    // Lấy đối tượng người dùng hiện tại
    const currentUser = this.currentUserService.getCurrentUser();

    // Lấy mảng các role từ đối tượng người dùng.
    // Dựa trên user-storage.service.ts, thuộc tính này tên là 'role' nhưng chứa một mảng.
    this.userRoles = currentUser && currentUser.role ? currentUser.role : [];

    // Để demo, bạn có thể gán cứng ở đây, ví dụ: this.userRoles = ['ADMIN'];

    // Lọc menu dựa trên mảng các role
    this.menuFiltered = this.filterMenuByRoles(MENU_ITEMS, this.userRoles);
  }

  public toggleMenu(subMenu: SubMenuItem) {
    this.layoutService.toggleMenu(subMenu);
  }

  /**
   * Hàm đệ quy để lọc các nhóm menu chính dựa trên vai trò của người dùng.
   * @param menuItems Danh sách menu đầy đủ.
   * @param userRoles Mảng các vai trò của người dùng hiện tại.
   * @returns Danh sách menu đã được lọc.
   */
  private filterMenuByRoles(
    menuItems: MenuItem[],
    userRoles: string[]
  ): MenuItem[] {
    if (!userRoles || userRoles.length === 0) {
      return []; // Nếu không có vai trò, không hiển thị gì cả.
    }

    const filteredResult: MenuItem[] = [];

    menuItems.forEach((group) => {
      // Người dùng có thể thấy một nhóm nếu:
      // 1. Họ có quyền 'ADMIN'.
      // 2. Nhóm không định nghĩa 'roles' (công khai cho mọi người đã đăng nhập).
      // 3. Người dùng có ít nhất một quyền nằm trong danh sách quyền của nhóm.
      const canViewGroup =
        userRoles.includes('ADMIN') ||
        !group.roles ||
        group.roles.some((role) => userRoles.includes(role));

      if (canViewGroup) {
        // Nếu có thể xem nhóm, tiếp tục lọc các mục con bên trong
        const filteredItems = this.filterSubMenuItems(group.items, userRoles);

        // Chỉ thêm nhóm vào kết quả nếu nhóm đó có ít nhất một mục con được phép xem
        if (filteredItems.length > 0) {
          filteredResult.push({ ...group, items: filteredItems });
        }
      }
    });

    return filteredResult;
  }

  /**
   * Hàm đệ quy để lọc các mục menu con.
   * @param subItems Danh sách các mục con.
   * @param userRoles Mảng các vai trò của người dùng.
   * @returns Danh sách các mục con đã được lọc.
   */
  private filterSubMenuItems(
    subItems: SubMenuItem[],
    userRoles: string[]
  ): SubMenuItem[] {
    const filtered: SubMenuItem[] = [];
    subItems.forEach((item) => {
      // Logic tương tự như lọc nhóm
      const canViewItem =
        userRoles.includes('ADMIN') ||
        !item.roles ||
        item.roles.some((role) => userRoles.includes(role));

      if (canViewItem) {
        const newItem = { ...item };
        // Nếu có menu con cấp 3, tiếp tục lọc đệ quy
        if (item.children && item.children.length > 0) {
          newItem.children = this.filterSubMenuItems(item.children, userRoles);
          // Chỉ thêm mục cha nếu nó có mục con hợp lệ
          if (newItem.children.length > 0) {
            filtered.push(newItem);
          }
        } else {
          // Nếu không có con, thêm vào luôn
          filtered.push(newItem);
        }
      }
    });
    return filtered;
  }
}
