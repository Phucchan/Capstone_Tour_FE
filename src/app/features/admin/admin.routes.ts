import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AdminTestComponent } from './admin-test/admin-test.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent, // <-- Layout component must have <router-outlet>
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'test',
        component: AdminTestComponent,
      },
    ],
  },
];
