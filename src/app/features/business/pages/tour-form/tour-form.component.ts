import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TourService } from '../../../../core/services/tour.service';
import {
  TourOptionsData,
  CreateTourRequest,
  UpdateTourRequest,
  TourDetail,
} from '../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tour-form.component.html',
  styleUrls: ['./tour-form.component.css'],
})
export class TourFormComponent implements OnInit, OnDestroy {
  // --- Properties ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tourService = inject(TourService);

  public tourForm!: FormGroup;
  public pageTitle = 'Tạo Tour mới';
  public isEditMode = false;
  private tourId: number | null = null;
  public tourOptions$!: Observable<TourOptionsData>;

  public durationDays = 0;
  private destinationSub!: Subscription;

  // --- Lifecycle Hooks ---
  constructor() {
    // Xây dựng form ở constructor để đảm bảo form được khởi tạo sớm
    this.buildForm();
  }

  ngOnInit(): void {
    // Lấy các options cho dropdowns từ service
    this.tourOptions$ = this.tourService.getTourOptions();

    // Lắng nghe sự thay đổi của destinationLocationIds để tự động tính số ngày
    this.destinationSub = this.tourForm
      .get('destinationLocationIds')!
      .valueChanges.subscribe((selectedIds: number[]) => {
        this.durationDays = selectedIds ? selectedIds.length : 0;
      });

    // Kiểm tra route params để xác định là TẠO MỚI hay CẬP NHẬT
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            // --- Chế độ CẬP NHẬT ---
            this.isEditMode = true;
            this.tourId = +id;
            this.pageTitle = 'Chi tiết & Cập nhật Tour';
            // Lấy dữ liệu chi tiết của tour từ service
            return this.tourService.getTourById(this.tourId);
          }
          // --- Chế độ TẠO MỚI ---
          this.pageTitle = 'Tạo Tour Mới';
          this.isEditMode = false;
          return of(null); // Trả về a null observable nếu không có id
        })
      )
      .subscribe((tourData) => {
        if (this.isEditMode && tourData) {
          // Nếu ở chế độ cập nhật và có dữ liệu, điền vào form
          this.patchFormWithTourData(tourData);
        }
      });
  }

  ngOnDestroy(): void {
    // Hủy subscription để tránh rò rỉ bộ nhớ
    if (this.destinationSub) {
      this.destinationSub.unsubscribe();
    }
  }

  // --- Private Methods ---
  private buildForm(): void {
    // Định nghĩa cấu trúc và validators cho form
    this.tourForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      thumbnailUrl: [''],
      description: [''],
      tourType: ['FIXED'], // Mặc định là FIXED cho role Business
      tourStatus: ['DRAFT'], // Mặc định là DRAFT khi tạo mới
      departLocationId: [null, Validators.required],
      destinationLocationIds: [[], Validators.required],
      tourThemeIds: [[], Validators.required],
    });
  }

  private patchFormWithTourData(tour: TourDetail): void {
    // Cập nhật giá trị cho form từ dữ liệu tour
    this.tourForm.patchValue({
      name: tour.name,
      code: tour.code,
      thumbnailUrl: tour.thumbnailUrl,
      description: tour.description,
      tourType: tour.tourType,
      tourStatus: tour.tourStatus,
      departLocationId: tour.departLocation.id,
      // map để lấy ra mảng các id
      destinationLocationIds: tour.destinations.map((d) => d.id),
      tourThemeIds: tour.themes.map((t) => t.id),
    });

    // Không cho phép chỉnh sửa mã tour
    this.tourForm.get('code')?.disable();
  }

  // --- Public Methods (Handlers) ---
  public onSubmit(): void {
    if (this.tourForm.invalid) {
      this.tourForm.markAllAsTouched(); // Hiển thị lỗi validation nếu form không hợp lệ
      console.warn('Form is invalid!');
      return;
    }

    // Lấy dữ liệu từ form, bao gồm cả các trường bị disable (như 'code')
    const formValue = this.tourForm.getRawValue();

    if (this.isEditMode && this.tourId) {
      // --- Xử lý CẬP NHẬT ---
      const updateData: UpdateTourRequest = formValue;
      this.tourService.updateTour(this.tourId, updateData).subscribe({
        next: () => {
          alert('Cập nhật tour thành công! ✅');
          this.router.navigate(['/business/tours']);
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật tour:', err);
          alert(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        },
      });
    } else {
      // --- Xử lý TẠO MỚI ---
      const createData: CreateTourRequest = formValue;
      this.tourService.createTour(createData).subscribe({
        next: () => {
          alert('Tạo tour thành công! 🎉');
          this.router.navigate(['/business/tours']);
        },
        error: (err) => {
          console.error('Lỗi khi tạo tour:', err);
          alert(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        },
      });
    }
  }

  public goBack(): void {
    this.router.navigate(['/business/tours']);
  }
}
