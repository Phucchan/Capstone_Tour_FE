import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ChatComponent } from './features/customer/components/chat/chat.component';
import { RegisterComponent } from './core/register/register/register.component';
import { UnauthorizeComponent } from './core/pages/error-page/unauthorize/unauthorize.component';
import { LayoutComponent } from './features/admin/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: '',
    component: LayoutComponent, // Layout CHUNG cho toàn bộ trang quản trị
    canActivate: [AuthGuard], // Guard bảo vệ tất cả các route con
    children: [
      // --- Các module chức năng sẽ được render bên trong LayoutComponent ---
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
        data: { expectedRoles: ['ADMIN'] },
      },
      {
        path: 'business',
        loadChildren: () =>
          import('./features/business/business.routes').then(
            (m) => m.BUSINESS_ROUTES
          ),
        data: { expectedRoles: ['BUSINESS_DEPARTMENT', 'SERVICE_COORDINATOR'] },
      },
      {
        path: 'seller',
        loadChildren: () =>
          import('./features/seller/seller.routes').then(
            (m) => m.SELLER_ROUTES
          ),
        data: { expectedRoles: ['SELLER'] },
      },
      {
        path: 'coordinator',
        loadChildren: () =>
          import('./features/coordinator/coordinator.routes').then(
            (m) => m.COORDINATOR_ROUTES
          ),
        data: { expectedRoles: ['SERVICE_COORDINATOR'] },
      },
      {
        path: 'accountant',
        loadChildren: () =>
          import('./features/accountant/accountant.routes').then(
            (m) => m.ACCOUNTANT_ROUTES
          ),
        data: { expectedRoles: ['ACCOUNTANT'] },
      },
      // BỔ SUNG ROUTE CHO MARKETING
      {
        path: 'marketing',
        loadChildren: () =>
          import('./features/marketing/marketing-blog.routes').then(
            (m) => m.MARKETING_BLOG_ROUTES
          ),
        data: { expectedRoles: ['MARKETING_MANAGER'] },
      },
    ],
  },

  {
    path: 'chat',
    component: ChatComponent,
  },
  {
    path: 'error/403-unauthorized',
    component: UnauthorizeComponent,
  },
];
