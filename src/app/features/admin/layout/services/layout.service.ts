import { Injectable, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
// Xóa import không còn sử dụng
// import { Menu } from '../../../../core/constants/menu';
import { MenuItem, SubMenuItem } from '../../../../core/models/menu.model';

@Injectable({
  providedIn: 'root',
})
export class layoutService implements OnDestroy {
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  // Xóa signal _pagesMenu vì component sẽ tự quản lý menu
  // private _pagesMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();

  constructor(private router: Router) {
    // Xóa toàn bộ logic cũ liên quan đến việc set và theo dõi _pagesMenu
    // vì logic này đã được chuyển vào admin-sidebar-menu.component.ts
  }

  get showSideBar() {
    return this._showSidebar();
  }
  get showMobileMenu() {
    return this._showMobileMenu();
  }
  // Xóa getter không còn sử dụng
  // get pagesMenu() {
  //   return this._pagesMenu();
  // }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }
  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  public toggleSidebar() {
    this._showSidebar.set(!this._showSidebar());
  }

  // Giữ lại các hàm toggle này vì component đang sử dụng chúng
  // để quản lý trạng thái đóng/mở của từng mục menu.
  public toggleMenu(menu: SubMenuItem) {
    this.showSideBar = true;
    menu.expanded = !menu.expanded;
  }

  public toggleSubMenu(submenu: SubMenuItem) {
    submenu.expanded = !submenu.expanded;
  }

  // Các hàm private này không còn cần thiết trong service nữa
  // private expand(items: Array<any>) { ... }
  // private isActive(instruction: any): boolean { ... }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
