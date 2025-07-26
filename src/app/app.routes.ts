import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ChatComponent } from './features/customer/components/chat/chat.component';
import { RegisterComponent } from './core/register/register/register.component';
import { PlanGenerateComponent } from './features/customer/components/plan-generate/plan-generate.component';
import { UnauthorizeComponent } from './core/pages/error-page/unauthorize/unauthorize.component';

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
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['ADMIN'] },
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: 'business',
    loadChildren: () =>
      import('./features/business/business.routes').then(
        (m) => m.BUSINESS_ROUTES
      ),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['BUSINESS_DEPARTMENT'] }, // <-- Đảm bảo tên role là chính xác
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
