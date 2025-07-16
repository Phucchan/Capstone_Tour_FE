import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from '../../../../core/services/tour.service';
import {
  CreateTourRequest,
  UpdateTourRequest,
} from '../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tour-form.component.html',
  styleUrls: ['./tour-form.component.css'],
})
export class TourFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tourService = inject(TourService);

  public tourForm!: FormGroup;
  public isEditMode = false;
  private tourId: number | null = null;
  public pageTitle = 'Tạo Tour mới';

  // Dữ liệu cho các dropdown, lấy từ file enum của backend
  public tourTypes = ['FIXED', 'CUSTOM'];
  public tourStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED'];

  constructor() {
    this.buildForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.tourId = +id;
      this.pageTitle = 'Chi tiết & Cập nhật Tour';
      this.loadTourData();
    }
  }

  buildForm(): void {
    this.tourForm = this.fb.group({
      // Các trường cho việc TẠO MỚI
      name: [{ value: '', disabled: this.isEditMode }, Validators.required],
      code: [{ value: '', disabled: this.isEditMode }, Validators.required],
      tourType: [
        { value: null, disabled: this.isEditMode },
        Validators.required,
      ],
      tourStatus: [
        { value: 'DRAFT', disabled: this.isEditMode },
        Validators.required,
      ],
      // Các trường cho cả TẠO MỚI và CẬP NHẬT
      thumbnailUrl: [''],
      tourThemeId: [null, Validators.required],
      departLocationId: [null, Validators.required],
      destinationLocationId: [null, Validators.required],
      durationDays: [1, [Validators.required, Validators.min(1)]],
      description: [''],
    });
  }

  loadTourData(): void {
    if (!this.tourId) return;
    this.tourService.getTourById(this.tourId).subscribe((tour) => {
      // patchValue sẽ điền các giá trị khớp tên vào form
      this.tourForm.patchValue(tour);
      // Vô hiệu hóa các trường không được sửa
      this.tourForm.get('name')?.disable();
      this.tourForm.get('code')?.disable();
      this.tourForm.get('tourType')?.disable();
      this.tourForm.get('tourStatus')?.disable();
    });
  }

  onSubmit(): void {
    if (this.tourForm.invalid) {
      this.tourForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.tourId) {
      const updateData: UpdateTourRequest = this.tourForm.value;
      this.tourService.updateTour(this.tourId, updateData).subscribe({
        next: () => this.router.navigate(['/business/tours']),
        error: (err) => console.error('Lỗi khi cập nhật tour:', err),
      });
    } else {
      const createData: CreateTourRequest = this.tourForm.value;
      this.tourService.createTour(createData).subscribe({
        next: () => this.router.navigate(['/business/tours']),
        error: (err) => console.error('Lỗi khi tạo tour:', err),
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/business/tours']);
  }
}
