import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CurrentUserService } from './user-storage/current-user.service';
import { MENU_ITEMS } from '../constants/menu';
import { MenuItem, SubMenuItem } from '../models/menu.model';
import { UserStorageService } from './user-storage/user-storage.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuItemsSource = new BehaviorSubject<MenuItem[]>([]);
  public menuItems$: Observable<MenuItem[]> =
    this.menuItemsSource.asObservable();

  constructor(
    private currentUserService: CurrentUserService,
    private userStorageService: UserStorageService // Inject UserStorageService
  ) {
    // Lắng nghe sự thay đổi của người dùng đang đăng nhập
    this.currentUserService.currentUser$.subscribe((user) => {
      // Lấy vai trò từ user object, nếu không có thì thử lấy từ cookie
      const roles = this.getRolesFromUser(user);
      this.generateMenu(roles);
    });
  }

  /**
   * Tạo menu dựa trên vai trò của người dùng.
   * @param roles - Mảng các vai trò của người dùng
   */
  private generateMenu(roles: string[]): void {
    let finalMenu: MenuItem[];

    if (roles.includes('ADMIN')) {
      // Nếu là ADMIN, cung cấp toàn bộ menu mà không cần lọc.
      finalMenu = MENU_ITEMS;
    } else {
      // Đối với các vai trò khác, lọc menu như bình thường.
      finalMenu = this.filterMenuByRoles(MENU_ITEMS, roles);
    }

    this.menuItemsSource.next(finalMenu);
  }

  /**
   * Helper function để lấy vai trò từ user object một cách an toàn.
   * API trả về roles trong user.roles, còn cookie lưu ở user.role.
   * Hàm này sẽ xử lý cả hai trường hợp.
   */
  private getRolesFromUser(user: any): string[] {
    if (!user) {
      // Nếu không có user, thử lấy từ cookie một lần nữa
      const userFromCookie = this.userStorageService.getUser();
      if (!userFromCookie) return [];
      // API login trả về user.roles, còn cookie lưu là user.role
      return userFromCookie.roles || userFromCookie.role || [];
    }
    // API login trả về user.roles, còn cookie lưu là user.role
    return user.roles || user.role || [];
  }

  /**
   * Lọc menu dựa trên vai trò của người dùng.
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
