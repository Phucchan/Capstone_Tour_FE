/*
----------------------------------------------------------------
-- File: src/app/features/accountant/accountant.routes.ts
-- Ghi chú: Định tuyến cho module Accountant.
----------------------------------------------------------------
*/
import { Routes } from '@angular/router';

export const ACCOUNTANT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then((c) => c.LayoutComponent),
    children: [
      {
        path: 'refunds',
        loadComponent: () =>
          import(
            './pages/refund-request-list/refund-request-list.component'
          ).then((c) => c.RefundRequestListComponent),
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
      {
        path: '',
        redirectTo: 'refunds',
        pathMatch: 'full',
      },
    ],
  },
];
