import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerSidebarComponent } from '../customer-sidebar/customer-sidebar.component';

@Component({
  selector: 'app-customer-layout',
  imports: [
    CommonModule,
    CustomerSidebarComponent,
    RouterOutlet
  ],
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css']
})
export class CustomerLayoutComponent {

}
