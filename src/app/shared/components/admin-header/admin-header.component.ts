import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { layoutService } from '../../../features/admin/layout/services/layout.service';

@Component({
  selector: 'app-admin-header',
  imports: [
    AngularSvgIconModule,
    ProfileMenuComponent
  ],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent implements OnInit {
  constructor(public layoutService: layoutService) {}

  ngOnInit(): void {}
}
