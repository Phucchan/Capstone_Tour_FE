import { Routes } from '@angular/router';

export const MARKETING_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'blogs', // Khi vào /marketing, tự động chuyển đến /marketing/blogs
    pathMatch: 'full',
  },
  {
    path: 'blogs',
    loadComponent: () =>
      import('./pages/blog-list/blog-list.component').then(
        (c) => c.BlogListComponent
      ),
    data: {
      title: 'Quản lý bài viết',
    },
  },
  {
    path: 'blogs/create',
    loadComponent: () =>
      import('./pages/blog-form/blog-form.component').then(
        (c) => c.BlogFormComponent
      ),
    data: {
      title: 'Tạo bài viết',
    },
  },
  {
    path: 'blogs/edit/:id',
    loadComponent: () =>
      import('./pages/blog-form/blog-form.component').then(
        (c) => c.BlogFormComponent
      ),
    data: {
      title: 'Chỉnh sửa bài viết',
    },
  },
  {
    path: 'discounts',
    loadComponent: () =>
      import('./pages/discount-management/discount-management.component').then(
        (c) => c.DiscountManagementComponent
      ),
    data: {
      title: 'Quản lý khuyến mãi',
    },
  },
];
