/*
================================================================
File: src/app/features/marketing/marketing-blog.routes.ts
Description: Defines routes for the marketing blog management feature.
================================================================
*/
import { Routes } from '@angular/router';
import { BlogListComponent } from './pages/blog-list/blog-list.component';
import { BlogFormComponent } from './pages/blog-form/blog-form.component';

export const MARKETING_ROUTES: Routes = [
  {
    path: '',
    component: BlogListComponent,
    title: 'Quản Lý Blog',
  },
  {
    path: 'new',
    component: BlogFormComponent,
    title: 'Tạo Bài Viết Mới',
  },
  {
    path: 'edit/:id',
    component: BlogFormComponent,
    title: 'Chỉnh Sửa Bài Viết',
  },
];
