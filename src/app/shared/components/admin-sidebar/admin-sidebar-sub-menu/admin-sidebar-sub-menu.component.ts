import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from '../../../../core/models/menu.model';
import { LayoutService } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-admin-sidebar-sub-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AngularSvgIconModule],
  templateUrl: './admin-sidebar-sub-menu.component.html',
})
export class AdminSidebarSubMenuComponent implements OnInit {
  @Input() public submenu: SubMenuItem[] = [];

  private layoutService = inject(LayoutService);

  ngOnInit(): void {}

  public toggleMenu(subMenu: SubMenuItem) {

     this.layoutService.toggleSubMenu(subMenu);
  }
}
