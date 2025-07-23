import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerSidebarComponent } from '../customer-sidebar/customer-sidebar.component';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    CustomerSidebarComponent,
    RouterOutlet
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {}
