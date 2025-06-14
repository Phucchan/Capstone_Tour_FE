import { Component, OnInit } from '@angular/core';
import { AdminSidebarSubMenuComponent } from '../admin-sidebar-sub-menu/admin-sidebar-sub-menu.component';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { layoutService } from '../../../../features/admin/layout/services/layout.service';
import { SubMenuItem } from '../../../../core/models/menu.model';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-admin-sidebar-menu',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    AdminSidebarSubMenuComponent,
    AngularSvgIconModule
  ],
  templateUrl: './admin-sidebar-menu.component.html',
  styleUrl: './admin-sidebar-menu.component.css'
})
export class AdminSidebarMenuComponent implements OnInit {
  constructor(public layoutService: layoutService, private router: Router) {
  }
  public toggleMenu(subMenu: SubMenuItem) {
    this.layoutService.toggleMenu(subMenu);
  }
  ngOnInit(): void {}
}
