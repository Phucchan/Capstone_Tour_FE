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
    // Service sẽ tự động xử lý việc lọc menu cho tất cả các role, kể cả ADMIN.
    this.menuItems$ = this.menuService.menuItems$;
  }

  public toggleMenu(subMenu: SubMenuItem) {
    this.layoutService.toggleMenu(subMenu);
  }
}
