import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule, ProfileMenuComponent],
  templateUrl: './admin-header.component.html',
})
export class AdminHeaderComponent implements OnInit {
  public layoutService = inject(LayoutService);

  ngOnInit(): void {}
}
