import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CurrentUserService } from './user-storage/current-user.service';
import { MENU_ITEMS } from '../constants/menu';
import { MenuItem, SubMenuItem } from '../models/menu.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuItemsSource = new BehaviorSubject<MenuItem[]>([]);
  public menuItems$: Observable<MenuItem[]> =
    this.menuItemsSource.asObservable();

  constructor(private currentUserService: CurrentUserService) {
    // Lắng nghe sự thay đổi của người dùng đang đăng nhập
    this.currentUserService.currentUser$.subscribe((user) => {
      const roles = user?.role || [];
      let finalMenu: MenuItem[];

      // ======================================================
      // === LOGIC QUAN TRỌNG CHO VIỆC DEMO ===
      // ======================================================
      if (roles.includes('ADMIN')) {
        // Nếu là ADMIN, cung cấp toàn bộ menu mà không cần lọc.
        // Điều này cho phép Admin thấy tất cả các chức năng để demo.
        finalMenu = MENU_ITEMS;
      } else {
        // Đối với các vai trò khác, lọc menu như bình thường.
        finalMenu = this.filterMenuByRoles(MENU_ITEMS, roles);
      }

      this.menuItemsSource.next(finalMenu);
    });
  }

  /**
   * Lọc menu dựa trên vai trò của người dùng (chỉ áp dụng cho user không phải Admin).
   * @param menuItems - Mảng menu gốc
   * @param userRoles - Mảng vai trò của người dùng
   * @returns Mảng menu đã được lọc
   */
  private filterMenuByRoles(
    menuItems: MenuItem[],
    userRoles: string[]
  ): MenuItem[] {
    if (!userRoles || userRoles.length === 0) {
      return [];
    }
    return menuItems
      .map((group) => {
        const filteredItems = this.filterSubMenuItems(group.items, userRoles);
        return { ...group, items: filteredItems };
      })
      .filter((group) => {
        const hasAccessToGroup =
          !group.roles ||
          group.roles.length === 0 ||
          group.roles.some((role) => userRoles.includes(role));
        return hasAccessToGroup && group.items.length > 0;
      });
  }

  /**
   * Hàm đệ quy để lọc các mục menu con.
   */
  private filterSubMenuItems(
    subItems: SubMenuItem[],
    userRoles: string[]
  ): SubMenuItem[] {
    return subItems
      .filter((item) => {
        return (
          !item.roles ||
          item.roles.length === 0 ||
          item.roles.some((role) => userRoles.includes(role))
        );
      })
      .map((item) => {
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterSubMenuItems(
            item.children,
            userRoles
          );
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter((item) => {
        return !item.children || item.children.length > 0;
      });
  }
}
