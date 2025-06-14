import { Component, Input, OnInit } from '@angular/core';
import { layoutService } from '../../../../features/admin/layout/services/layout.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SubMenuItem } from '../../../../core/models/menu.model';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-admin-sidebar-sub-menu',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    AngularSvgIconModule
  ],
  templateUrl: './admin-sidebar-sub-menu.component.html',
  styleUrl: './admin-sidebar-sub-menu.component.css'
})
export class AdminSidebarSubMenuComponent implements OnInit {
  @Input() public submenu = <SubMenuItem>{};

  constructor(public layoutService: layoutService) {}

  ngOnInit(): void {}

  public toggleMenu(menu: any) {
    this.layoutService.toggleSubMenu(menu);
  }

  private collapse(items: Array<any>) {
    items.forEach((item) => {
      item.expanded = false;
      if (item.children) this.collapse(item.children);
    });
  }

}
