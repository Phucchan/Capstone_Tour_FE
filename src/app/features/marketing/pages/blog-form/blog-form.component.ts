/*
================================================================
File: src/app/features/marketing/pages/blog-form/blog-form.component.ts
Description: Component logic for the blog creation and editing form.
================================================================
*/
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BlogManagementService } from '../../services/blog-management.service';
import { BlogManagerRequestDTO } from '../../models/blog.model';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EditorComponent, // FIX: Added EditorComponent to imports
  ],
  templateUrl: './blog-form.component.html',
})
export class BlogFormComponent implements OnInit, OnDestroy {
  blogForm: FormGroup;
  isEditMode = false;
  blogId: number | null = null;
  isLoading = false;
  error: string | null = null;
  private subscriptions = new Subscription();

  // TinyMCE configuration
  tinymceConfig = {
    base_url: '/tinymce',
    suffix: '.min',
    plugins:
      'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    toolbar:
      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    height: 500,
    menubar: false,
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogManagementService
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      thumbnailImageUrl: ['', [Validators.required]],
      content: ['', [Validators.required]],
      tagIds: [[]], // Placeholder for tags
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
            const blog = response.data;
            this.blogForm.patchValue({
              title: blog.title,
              description: blog.description,
              thumbnailImageUrl: blog.thumbnailImageUrl,
              content: blog.content,
              // tagIds: blog.tags.map(tag => tag.id) // This needs adjustment based on how tags are fetched
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
      this.blogForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    // TODO: Replace with actual logged-in user ID and tag IDs from a tag-input component
    const requestData: BlogManagerRequestDTO = {
      ...this.blogForm.value,
      authorId: 1, // Hardcoded author ID, replace with actual user ID
      tagIds: [1, 2], // Hardcoded tag IDs
    };

    const operation =
      this.isEditMode && this.blogId
        ? this.blogService.updateBlog(this.blogId, requestData)
        : this.blogService.createBlog(requestData);

    const sub = operation
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          // alert(`Bài viết đã được ${this.isEditMode ? 'cập nhật' : 'tạo'} thành công!`);
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
