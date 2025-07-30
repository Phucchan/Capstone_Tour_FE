// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CurrentUserService } from './user-storage/current-user.service';
import { MENU_ITEMS } from '../constants/menu';
import { MenuItem, SubMenuItem } from '../models/menu.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  // BehaviorSubject để lưu và phát ra danh sách menu đã được lọc
  private menuItemsSource = new BehaviorSubject<MenuItem[]>([]);
  public menuItems$: Observable<MenuItem[]> =
    this.menuItemsSource.asObservable();

  constructor(private currentUserService: CurrentUserService) {
    this.currentUserService.currentUser$.subscribe((user) => {
      const roles = user?.role || [];
      let finalMenu: MenuItem[];

      // === THAY ĐỔI QUAN TRỌNG NHẤT NẰM Ở ĐÂY ===
      if (roles.includes('ADMIN')) {
        // MỤC ĐÍCH DEMO: Nếu là ADMIN, hiển thị TOÀN BỘ menu mà không cần lọc.
        // Các nhóm chức năng trong menu.ts đã được tổ chức hợp lý,
        // nên việc hiển thị tất cả sẽ giúp admin thấy rõ chức năng của từng vai trò.
        finalMenu = MENU_ITEMS;
      } else {
        // Nếu không phải ADMIN, thực hiện lọc chính xác theo vai trò như cũ.
        finalMenu = this.filterMenuByRoles(MENU_ITEMS, roles);
      }

      this.menuItemsSource.next(finalMenu);
    });
  }

  /**
   * Hàm này giờ chỉ dùng cho các vai trò không phải ADMIN.
   * Lọc toàn bộ cấu trúc menu dựa trên vai trò của người dùng.
   * @param menuItems - Mảng menu gốc từ menu.ts
   * @param userRoles - Mảng các vai trò của người dùng
   * @returns Mảng menu đã được lọc
   */
  private filterMenuByRoles(
    menuItems: MenuItem[],
    userRoles: string[]
  ): MenuItem[] {
    if (!userRoles || userRoles.length === 0) {
      return []; // Nếu không có vai trò, trả về menu rỗng
    }
    // Sử dụng map và filter để tạo ra một mảng mới thay vì sửa đổi mảng cũ
    return menuItems
      .map((group) => {
        // Lọc các mục con (items) trong mỗi nhóm
        const filteredItems = this.filterSubMenuItems(group.items, userRoles);
        // Trả về một nhóm mới với các mục con đã được lọc
        return { ...group, items: filteredItems };
      })
      .filter((group) => {
        // Chỉ giữ lại những nhóm thỏa mãn điều kiện quyền và có ít nhất một mục con
        const hasAccessToGroup =
          !group.roles ||
          group.roles.length === 0 ||
          group.roles.some((role) => userRoles.includes(role));
        return hasAccessToGroup && group.items.length > 0;
      });
  }

  /**
   * Hàm đệ quy để lọc các mục menu con và các cấp con của nó.
   * @param subItems - Mảng các mục menu con
   * @param userRoles - Mảng các vai trò của người dùng
   * @returns Mảng các mục menu con đã được lọc
   */
  private filterSubMenuItems(
    subItems: SubMenuItem[],
    userRoles: string[]
  ): SubMenuItem[] {
    return subItems
      .filter((item) => {
        // Một mục được hiển thị nếu nó không yêu cầu vai trò, hoặc người dùng có vai trò phù hợp
        return (
          !item.roles ||
          item.roles.length === 0 ||
          item.roles.some((role) => userRoles.includes(role))
        );
      })
      .map((item) => {
        // Nếu mục này có menu con (children), tiếp tục lọc đệ quy
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterSubMenuItems(
            item.children,
            userRoles
          );
          // Trả về mục mới với children đã được lọc
          return { ...item, children: filteredChildren };
        }
        return item; // Trả về mục gốc nếu không có children
      })
      .filter((item) => {
        // Loại bỏ những mục cha không có mục con nào sau khi lọc
        // (ví dụ: một mục cha có children, nhưng tất cả children đều bị lọc bỏ)
        return !item.children || item.children.length > 0;
      });
  }
}
