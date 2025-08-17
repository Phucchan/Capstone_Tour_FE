import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// NG-ZORRO Imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';

import { BlogManagementService } from '../../services/blog-management.service';
import { BlogManagerRequestDTO, BlogDetailDTO } from '../../models/blog.model';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // EditorComponent has been removed
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzSpinModule,
    NzAlertModule,
    NzSelectModule,
  ],
  templateUrl: './blog-form.component.html',
})
export class BlogFormComponent implements OnInit, OnDestroy {
  // Injected services
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogManagementService);
  private message = inject(NzMessageService);

  // Component state
  blogForm: FormGroup;
  isEditMode = false;
  blogId: number | null = null;
  isLoading = false;
  error: string | null = null;
  private subscriptions = new Subscription();

  // Placeholder for tag options
  tagOptions = [
    { label: 'Du lịch', value: 1 },
    { label: 'Ẩm thực', value: 2 },
    { label: 'Kinh nghiệm', value: 3 },
    { label: 'Văn hóa', value: 4 },
  ];

  // TinyMCE configuration has been removed

  constructor() {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      thumbnailImageUrl: ['', [Validators.required]],
      content: ['', [Validators.required]],
      tagIds: [[]],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.blogId = +idParam;
      this.loadBlogData();
    }
  }

  loadBlogData(): void {
    if (!this.blogId) return;

    this.isLoading = true;
    const sub = this.blogService
      .getBlogDetail(this.blogId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            const blog: BlogDetailDTO = response.data;
            this.blogForm.patchValue({
              title: blog.title,
              description: blog.description,
              thumbnailImageUrl: blog.thumbnailImageUrl,
              content: blog.content,
              tagIds: blog.tags.map((tag) => tag.id),
            });
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Không thể tải dữ liệu bài viết.';
          console.error(err);
        },
      });
    this.subscriptions.add(sub);
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      Object.values(this.blogForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isLoading = true;
    this.error = null;

    const requestData: BlogManagerRequestDTO = {
      ...this.blogForm.value,
      authorId: 1, // Hardcoded author ID, replace with actual user ID
    };

    const operation =
      this.isEditMode && this.blogId
        ? this.blogService.updateBlog(this.blogId, requestData)
        : this.blogService.createBlog(requestData);

    const sub = operation
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.message.success(
            `Bài viết đã được ${
              this.isEditMode ? 'cập nhật' : 'tạo'
            } thành công!`
          );
          this.router.navigate(['/marketing/blogs']);
        },
        error: (err) => {
          this.error =
            err.error?.message ||
            `Đã xảy ra lỗi khi ${
              this.isEditMode ? 'cập nhật' : 'tạo'
            } bài viết.`;
          console.error(err);
        },
      });
    this.subscriptions.add(sub);
  }

  onCancel(): void {
    this.router.navigate(['/marketing/blogs']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
