import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ChatComponent } from './features/customer/components/chat/chat.component';
import { RegisterComponent } from './core/register/register/register.component';
import { PlanGenerateComponent } from './features/customer/components/plan-generate/plan-generate.component';
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
  // {
  //   path: 'customer',
  //   loadChildren: () =>
  //     import('./features/customer/customer.routes').then(
  //       (m) => m.CUSTOMER_ROUTES
  //     ),
  //   canActivate: [AuthGuard],
  //   data: { expectedRoles: ['CUSTOMER'] },
  // },


  // --- Gom tất cả các route quản lý vào chung một Layout ---
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: '',
    component: LayoutComponent, // SỬ DỤNG LAYOUT LÀM COMPONENT CHA
    canActivate: [AuthGuard], // AuthGuard bảo vệ tất cả các route con bên dưới
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
        // Dữ liệu phân quyền sẽ được kiểm tra bởi AuthGuard của route cha
        data: { expectedRoles: ['ADMIN'] },
      },
      {
        path: 'business',
        loadChildren: () =>
          import('./features/business/business.routes').then(
            (m) => m.BUSINESS_ROUTES
          ),
        // AuthGuard ở route cha sẽ dùng data này để kiểm tra quyền
        data: { expectedRoles: ['BUSINESS_DEPARTMENT', 'SERVICE_COORDINATOR'] },
      },
      // Thêm các vai trò khác ở đây nếu chúng cũng dùng chung layout
      // Ví dụ:
      // {
      //   path: 'sales',
      //   loadChildren: () => import('./features/sales/sales.routes').then(m => m.SALES_ROUTES),
      //   data: { expectedRoles: ['SELLER'] }
      // }
    ],
  },
   


  {
    path: 'chat',
    component: ChatComponent,
  },
  {
    path: 'test',
    component: PlanGenerateComponent,
  },
  {
    path: 'error/403-unauthorized',
    component: UnauthorizeComponent,
  },
];
