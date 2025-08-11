import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '../../../core/services/menu.service';
import { AdminSidebarSubMenuComponent } from './admin-sidebar-sub-menu/admin-sidebar-sub-menu.component';
import { MenuItem } from '../../../core/models/menu.model';
import { CurrentUserService } from '../../../core/services/user-storage/current-user.service';
import packageJson from '../../../../../package.json';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-admin-sidebar-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    AngularSvgIconModule,
    AdminSidebarSubMenuComponent,
  ],
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent implements OnInit {
  public appJson: any = packageJson;

  public layoutService = inject(LayoutService);

  ngOnInit(): void {}

  public toggleSidebar() {
    this.layoutService.toggleSidebar();
  }
}
