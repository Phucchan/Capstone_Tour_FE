// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   FormBuilder,
//   FormGroup,
//   ReactiveFormsModule,
//   Validators,
// } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { TourService } from '../../../../core/services/tour.service';
// import {
//   CreateTourRequest,
//   UpdateTourRequest,
// } from '../../../../core/models/tour.model';

// @Component({
//   selector: 'app-tour-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './tour-form.component.html',
//   styleUrls: ['./tour-form.component.css'],
// })
// export class TourFormComponent implements OnInit {
//   private fb = inject(FormBuilder);
//   private router = inject(Router);
//   private route = inject(ActivatedRoute);
//   private tourService = inject(TourService);

//   public tourForm!: FormGroup;
//   public isEditMode = false;
//   private tourId: number | null = null;
//   public pageTitle = 'Tạo Tour mới';

//   // Dữ liệu cho các dropdown, lấy từ file enum của backend
//   public tourTypes = ['FIXED', 'CUSTOM'];
//   public tourStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED'];

//   constructor() {
//     this.buildForm();
//   }

//   ngOnInit(): void {
//     const id = this.route.snapshot.paramMap.get('id');
//     if (id) {
//       this.isEditMode = true;
//       this.tourId = +id;
//       this.pageTitle = 'Chi tiết & Cập nhật Tour';
//       this.loadTourData();
//     }
//   }

//   buildForm(): void {
//     this.tourForm = this.fb.group({
//       // Các trường cho việc TẠO MỚI
//       name: [{ value: '', disabled: this.isEditMode }, Validators.required],
//       code: [{ value: '', disabled: this.isEditMode }, Validators.required],
//       tourType: [
//         { value: null, disabled: this.isEditMode },
//         Validators.required,
//       ],
//       tourStatus: [
//         { value: 'DRAFT', disabled: this.isEditMode },
//         Validators.required,
//       ],
//       // Các trường cho cả TẠO MỚI và CẬP NHẬT
//       thumbnailUrl: [''],
//       tourThemeId: [null, Validators.required],
//       departLocationId: [null, Validators.required],
//       destinationLocationId: [null, Validators.required],
//       durationDays: [1, [Validators.required, Validators.min(1)]],
//       description: [''],
//     });
//   }

//   loadTourData(): void {
//     if (!this.tourId) return;
//     this.tourService.getTourById(this.tourId).subscribe((tour) => {
//       // patchValue sẽ điền các giá trị khớp tên vào form
//       this.tourForm.patchValue(tour);
//       // Vô hiệu hóa các trường không được sửa
//       this.tourForm.get('name')?.disable();
//       this.tourForm.get('code')?.disable();
//       this.tourForm.get('tourType')?.disable();
//       this.tourForm.get('tourStatus')?.disable();
//     });
//   }

//   onSubmit(): void {
//     if (this.tourForm.invalid) {
//       this.tourForm.markAllAsTouched();
//       return;
//     }

//     if (this.isEditMode && this.tourId) {
//       const updateData: UpdateTourRequest = this.tourForm.value;
//       this.tourService.updateTour(this.tourId, updateData).subscribe({
//         next: () => this.router.navigate(['/business/tours']),
//         error: (err) => console.error('Lỗi khi cập nhật tour:', err),
//       });
//     } else {
//       const createData: CreateTourRequest = this.tourForm.value;
//       this.tourService.createTour(createData).subscribe({
//         next: () => this.router.navigate(['/business/tours']),
//         error: (err) => console.error('Lỗi khi tạo tour:', err),
//       });
//     }
//   }

//   goBack(): void {
//     this.router.navigate(['/business/tours']);
//   }
// }


// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   FormBuilder,
//   FormGroup,
//   ReactiveFormsModule,
//   Validators,
// } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Observable } from 'rxjs';

// import { TourService } from '../../../../core/services/tour.service';
// import {
//   TourOptionsData,
//   CreateTourRequest,
// } from '../../../../core/models/tour.model';

// @Component({
//   selector: 'app-tour-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './tour-form.component.html',
//   styleUrls: ['./tour-form.component.css'],
// })
// export class TourFormComponent implements OnInit {
//   private fb = inject(FormBuilder);
//   private router = inject(Router);
//   private route = inject(ActivatedRoute);
//   private tourService = inject(TourService);

//   public tourForm!: FormGroup;
//   public isEditMode = false; // Sẽ dùng ở giai đoạn sau
//   public pageTitle = 'Tạo Tour mới';

//   // Observable để chứa dữ liệu cho các dropdown
//   public tourOptions$!: Observable<TourOptionsData>;

//   constructor() {
//     this.tourForm = this.fb.group({
//       name: ['', Validators.required],
//       code: ['', Validators.required],
//       thumbnailUrl: [''],
//       description: [''],
//       departLocationId: [null, Validators.required],
//       destinationLocationIds: [[]], // Giá trị ban đầu là mảng rỗng
//       tourThemeIds: [[], Validators.required], // Yêu cầu chọn ít nhất 1 chủ đề
//     });
//   }

//   ngOnInit(): void {
//     // Lấy dữ liệu cho các dropdown ngay khi component được tạo
//     this.tourOptions$ = this.tourService.getTourOptions();

//     // Logic cho chế độ edit sẽ được thêm sau
//     const id = this.route.snapshot.paramMap.get('id');
//     if (id) {
//       this.isEditMode = true;
//       this.pageTitle = 'Chi tiết & Cập nhật Tour';
//     }
//   }

//   onSubmit(): void {
//     if (this.tourForm.invalid) {
//       this.tourForm.markAllAsTouched();
//       return;
//     }

//     if (this.isEditMode) {
//       // Logic cập nhật sẽ làm ở bước sau
//     } else {
//       const createData: CreateTourRequest = this.tourForm.value;
//       this.tourService.createTour(createData).subscribe({
//         next: () => {
//           alert('Tạo tour thành công!'); // Sẽ thay bằng thông báo đẹp hơn
//           this.router.navigate(['/business/tours']);
//         },
//         error: (err) => {
//           console.error('Lỗi khi tạo tour:', err);
//           alert('Có lỗi xảy ra, vui lòng thử lại.');
//         },
//       });
//     }
//   }

//   goBack(): void {
//     this.router.navigate(['/business/tours']);
//   }
// }


import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { TourService } from '../../../../core/services/tour.service';
import {
  TourOptionsData,
  CreateTourRequest,
} from '../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tour-form.component.html',
  styleUrls: ['./tour-form.component.css'],
})
export class TourFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private tourService = inject(TourService);

  public tourForm!: FormGroup;
  public pageTitle = 'Tạo Tour mới';
  public tourOptions$!: Observable<TourOptionsData>;

  public durationDays = 0; // Biến để hiển thị số ngày
  private destinationSub!: Subscription;

  constructor() {
    this.tourForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      thumbnailUrl: [''],
      description: [''],
      departLocationId: [null, Validators.required],
      destinationLocationIds: [[], Validators.required],
      tourThemeIds: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    this.tourOptions$ = this.tourService.getTourOptions();

    // Lắng nghe sự thay đổi của ô chọn điểm đến để cập nhật số ngày
    this.destinationSub = this.tourForm
      .get('destinationLocationIds')!
      .valueChanges.subscribe((selectedIds: number[]) => {
        this.durationDays = selectedIds.length;
      });
  }

  ngOnDestroy(): void {
    // Hủy subscription để tránh rò rỉ bộ nhớ
    if (this.destinationSub) {
      this.destinationSub.unsubscribe();
    }
  }

  onSubmit(): void {
    if (this.tourForm.invalid) {
      this.tourForm.markAllAsTouched();
      return;
    }

    const createData: CreateTourRequest = this.tourForm.value;
    this.tourService.createTour(createData).subscribe({
      next: () => {
        alert('Tạo tour thành công!');
        this.router.navigate(['/business/tours']);
      },
      error: (err) => {
        console.error('Lỗi khi tạo tour:', err);
        alert(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/business/tours']);
  }
}
