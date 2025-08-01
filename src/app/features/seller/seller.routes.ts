import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { SellerBookingDetailComponent } from './pages/seller-booking-detail/seller-booking-detail.component';
import { SellerBookingCreateComponent } from './pages/seller-booking-create/seller-booking-create.component';



export const SELLER_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: SellerDashboardComponent,
        title: 'Quản lý Booking',
      },
      {
        path: 'create-booking',
        component: SellerBookingCreateComponent,
        title: 'Tạo Booking Mới',
      },
      {
        path: 'booking/:id',
        component: SellerBookingDetailComponent,
        title: 'Chi tiết Booking',
      },
    ],
  },
];
