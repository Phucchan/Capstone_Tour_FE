// src/app/features/blog/blog.routes.ts
import { Routes } from '@angular/router';
import { BlogListComponent } from './pages/blog-list.component';

// Export một mảng các routes
export const BLOG_ROUTES: Routes = [
  {
    path: '', // Đường dẫn mặc định (/blogs)
    component: BlogListComponent
  },
  {
    path: ':id', // Đường dẫn cho trang chi tiết, ví dụ /blogs/123
    // Tự động tải component khi người dùng truy cập
    loadComponent: () => import('./pages/blog-detail.component').then(c => c.BlogDetailComponent),
    data: { title: 'Chi tiết bài viết' }
  }
];