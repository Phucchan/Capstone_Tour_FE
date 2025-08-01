// File: src/app/features/seller/layout/layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';
import { AdminFooterComponent } from '../../../shared/components/admin-footer/admin-footer.component';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    AdminSidebarComponent,
    AdminHeaderComponent,
    AdminFooterComponent,
  ],
  template: `
    <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <app-admin-sidebar></app-admin-sidebar>

      <div class="flex flex-col flex-1 w-full">
        <!-- Header -->
        <app-admin-header></app-admin-header>

        <!-- Main content -->
        <main class="h-full overflow-y-auto">
          <div class="container px-6 mx-auto grid">
            <router-outlet></router-outlet>
          </div>
        </main>

        <!-- Footer -->
        <app-admin-footer></app-admin-footer>
      </div>
    </div>
  `,
})
export class LayoutComponent {}
