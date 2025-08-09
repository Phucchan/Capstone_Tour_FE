/*
----------------------------------------------------------------
-- File: src/app/features/accountant/layout/layout.component.ts
-- Ghi chú: Layout chính cho trang Accountant.
----------------------------------------------------------------
*/
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-accountant-layout',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent, AdminSidebarComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <app-admin-sidebar></app-admin-sidebar>
      <div class="flex flex-col flex-1">
        <app-admin-header></app-admin-header>
        <main class="h-full p-6 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {}
