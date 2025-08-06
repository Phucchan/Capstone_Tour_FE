import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NgSelectModule } from '@ng-select/ng-select';

import { TourService } from '../../../../core/services/tour.service';
import {
  TourOptionsData,
  TourDetail,
  TourDetailWithOptions,
} from '../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './tour-form.component.html',
  // styleUrls: ['./tour-form.component.css'], // Bạn có thể thêm file css nếu cần
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
  public tourId: number | null = null;
  public tourOptions$!: Observable<TourOptionsData>;
  private destinationSub!: Subscription;
  public durationDays = 0;

  // Thuộc tính mới cho việc upload và xem trước ảnh
  public selectedFile: File | null = null;
  public imagePreview: string | ArrayBuffer | null = null;

  constructor() {
    this.buildForm();
  }

  ngOnInit(): void {
    const tourWithOptions$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.tourId = +id;
          return this.tourService.getTourById(this.tourId);
        }
        this.isEditMode = false;
        this.pageTitle = 'Tạo Tour Mới';
        return this.tourService
          .getTourOptions()
          .pipe(map((options) => ({ detail: null, options })));
      })
    );

    // SỬA LỖI: Xóa kiểu (data: TourDetailWithOptions) để TypeScript tự suy luận
    tourWithOptions$.subscribe((data) => {
      this.tourOptions$ = of(data.options);
      // Logic bên trong đã xử lý đúng trường hợp data.detail có thể là null
      if (this.isEditMode && data.detail) {
        this.pageTitle = 'Chi tiết & Cập nhật Tour';
        this.patchFormWithTourData(data.detail);
      }
    });

    this.destinationSub = this.tourForm
      .get('destinationLocationIds')!
      .valueChanges.subscribe((selectedIds: number[]) => {
        this.durationDays = selectedIds ? selectedIds.length : 0;
      });
  }

  ngOnDestroy(): void {
    if (this.destinationSub) {
      this.destinationSub.unsubscribe();
    }
  }

  private buildForm(): void {
    this.tourForm = this.fb.group({
      name: ['', Validators.required],
      code: [{ value: '', disabled: true }],
      // Thêm tourType, mặc định là FIXED
      tourType: ['FIXED', Validators.required],
      description: [''],
      tourStatus: ['DRAFT'],
      departLocationId: [null, Validators.required],
      destinationLocationIds: [[], Validators.required],
      tourThemeIds: [[], Validators.required],
    });
  }

  private patchFormWithTourData(tour: TourDetail): void {
    this.tourForm.patchValue({
      name: tour.name,
      code: tour.code,
      description: tour.description,
      tourStatus: tour.tourStatus,
      // Patch giá trị cho tourType
      tourType: tour.tourType,
      departLocationId: tour.departLocation.id,
      destinationLocationIds: tour.destinations.map((d) => d.id),
      tourThemeIds: tour.themes.map((t) => t.id),
    });
    // Hiển thị ảnh cũ khi edit
    if (tour.thumbnailUrl) {
      this.imagePreview = tour.thumbnailUrl;
    }
  }

  /**
   * Xử lý sự kiện khi người dùng chọn file ảnh
   * @param event Sự kiện input change
   */
  public onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Tạo ảnh xem trước
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  public onSubmit(): void {
    if (this.tourForm.invalid) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      this.tourForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const formValue = this.tourForm.getRawValue();

    // 1. Thêm file ảnh vào FormData nếu có file mới được chọn
    if (this.selectedFile) {
      formData.append(
        'thumbnailFile',
        this.selectedFile,
        this.selectedFile.name
      );
    }

    // 2. Thêm các dữ liệu khác của tour vào FormData
    // Backend sẽ cần parse chuỗi JSON này
    const tourData = {
      name: formValue.name,
      description: formValue.description,
      tourType: formValue.tourType,
      tourStatus: formValue.tourStatus,
      departLocationId: formValue.departLocationId,
      destinationLocationIds: formValue.destinationLocationIds,
      tourThemeIds: formValue.tourThemeIds,
    };
    // Gửi dưới dạng một Blob JSON
    formData.append(
      'tourData',
      new Blob([JSON.stringify(tourData)], { type: 'application/json' })
    );

    // 3. Gọi service tương ứng
    if (this.isEditMode && this.tourId) {
      this.tourService.updateTourWithFile(this.tourId, formData).subscribe({
        next: (updatedTour) => {
          alert('Cập nhật tour thành công!');
          // Cập nhật lại ảnh preview nếu có URL mới trả về
          if (updatedTour.thumbnailUrl) {
            this.imagePreview = updatedTour.thumbnailUrl;
            this.selectedFile = null; // Reset file đã chọn
          }
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật tour:', err);
          alert('Có lỗi xảy ra khi cập nhật tour.');
        },
      });
    } else {
      this.tourService.createTourWithFile(formData).subscribe({
        next: (createdTour) => {
          alert(`Tạo tour thành công! Mã tour của bạn là: ${createdTour.code}`);
          this.router.navigate(['/business/tour-list']);
        },
        error: (err) => {
          console.error('Lỗi khi tạo tour:', err);
          alert('Có lỗi xảy ra khi tạo tour.');
        },
      });
    }
  }

  public goBack(): void {
    this.router.navigate(['/business/tour-list']);
  }
}
