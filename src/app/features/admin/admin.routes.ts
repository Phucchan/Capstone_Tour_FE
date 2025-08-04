import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { ListCustomerComponent } from './list-customer/list-customer.component';
import { ListStaffComponent } from './list-staff/list-staff.component';
import { PostStaffDetailComponent } from './post-staff-detail/post-staff-detail.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'list-customer', pathMatch: 'full' },
      {
        path: 'list-customer',
        // Sử dụng lazy loading cho standalone component
        loadComponent: () =>
          import('./list-customer/list-customer.component').then(
            (m) => m.ListCustomerComponent
          ),
      },
      {
        path: 'list-staff',
        loadComponent: () =>
          import('./list-staff/list-staff.component').then(
            (m) => m.ListStaffComponent
          ),
      },
      {
        path: 'post-staff-detail',
        loadComponent: () =>
          import('./post-staff-detail/post-staff-detail.component').then(
            (m) => m.PostStaffDetailComponent
          ),
      },
      // Route để chỉnh sửa nhân viên (sẽ dùng trong tương lai)
      // {
      //     path: 'post-staff-detail/:id',
      //     loadComponent: () => import('./post-staff-detail/post-staff-detail.component').then(m => m.PostStaffDetailComponent)
      // },
    ],
  },
];
