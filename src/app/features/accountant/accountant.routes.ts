import { Routes } from '@angular/router';

/**
 * ACCOUNTANT_ROUTES giờ đây là một mảng các trang đơn lẻ.
 * LayoutComponent riêng đã được loại bỏ.
 */
export const ACCOUNTANT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'refunds',
    pathMatch: 'full',
  },
  {
    path: 'refunds',
    loadComponent: () =>
      import('./pages/refund-request-list/refund-request-list.component').then(
        (c) => c.RefundRequestListComponent
      ),
    title: 'Quản lý Hoàn tiền',
  },
  {
    path: 'refunds/:id',
    loadComponent: () =>
      import(
        './pages/refund-request-detail/refund-request-detail.component'
      ).then((c) => c.RefundRequestDetailComponent),
    title: 'Chi tiết Yêu cầu Hoàn tiền',
  },
];
