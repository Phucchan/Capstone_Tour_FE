import { Routes } from '@angular/router';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { SellerBookingDetailComponent } from './pages/seller-booking-detail/seller-booking-detail.component';

export const SELLER_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: SellerDashboardComponent,
    title: 'Quản lý Booking',
  },
  {
    path: 'booking/:id',
    component: SellerBookingDetailComponent,
    title: 'Chi tiết Booking',
  },
];
