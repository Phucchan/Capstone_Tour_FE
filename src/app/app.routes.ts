import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ChatComponent } from './features/customer/components/chat/chat.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/homepage/homepage.component').then(
        (m) => m.HomepageComponent
      ),
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'customer',
    loadChildren: () =>
      import('./features/customer/customer.routes').then(
        (m) => m.CUSTOMER_ROUTES
      ),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['CUSTOMER'] },
  },
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
    path: 'chat',
    component: ChatComponent,
  },
];
