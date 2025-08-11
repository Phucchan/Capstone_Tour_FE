import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Observable } from 'rxjs';
import { MenuService } from '../../../../core/services/menu.service';
import { AdminSidebarSubMenuComponent } from '../admin-sidebar-sub-menu/admin-sidebar-sub-menu.component';
import { MenuItem, SubMenuItem } from '../../../../core/models/menu.model';
import { LayoutService } from '../../../../core/services/layout.service';

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

  private menuService = inject(MenuService);
  public layoutService = inject(LayoutService);

  ngOnInit(): void {
    // Component chỉ cần lấy dữ liệu đã được lọc sẵn từ service của bạn
    this.menuItems$ = this.menuService.menuItems$;
  }

  // SỬA LỖI 1: Hàm này phải nhận vào SubMenuItem vì 'item' trong template là SubMenuItem
  public toggleMenu(item: SubMenuItem): void {
    item.expanded = !item.expanded;
  }
}
