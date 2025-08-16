// src/app/features/business/pages/tour-form/tour-form.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription, of, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { NgSelectModule } from '@ng-select/ng-select';

import { TourService } from '../../../../core/services/tour.service';
import { RequestBookingService } from '../../services/request-booking.service';
import {
  TourOptionsData,
  TourDetail,
} from '../../../../core/models/tour.model';
import { RequestBookingDetail } from '../../models/request-booking.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    RouterLink,
    SpinnerComponent,
  ],
  templateUrl: './tour-form.component.html',
})
export class TourFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tourService = inject(TourService);
  private requestBookingService = inject(RequestBookingService);

  public tourForm!: FormGroup;
  public pageTitle = 'Tạo Tour mới';
  public isEditMode = false;
  public tourId: number | null = null;
  public tourOptions$!: Observable<TourOptionsData>;
  private destinationSub!: Subscription;
  public durationDays = 0;

  public selectedFile: File | null = null;
  public imagePreview: string | ArrayBuffer | null = null;

  // --- Thuộc tính mới cho giao diện đối chiếu ---
  public isCustomRequestMode = false;
  public requestBookingId: number | null = null;
  public requestBookingDetail$: Observable<RequestBookingDetail> | null = null;

  constructor() {
    this.buildForm();
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((queryParams) => {
      const requestBookingIdParam = queryParams.get('requestBookingId');
      const tourTypeParam = queryParams.get('tourType');

      if (requestBookingIdParam && tourTypeParam === 'CUSTOM') {
        this.isCustomRequestMode = true;
        this.requestBookingId = +requestBookingIdParam;
        this.pageTitle = 'Tạo Tour theo Yêu cầu';
        // Lấy chi tiết yêu cầu để hiển thị
        this.requestBookingDetail$ =
          this.requestBookingService.getRequestDetail(this.requestBookingId);
        // Tải các lựa chọn (địa điểm, chủ đề)
        this.tourOptions$ = this.tourService.getTourOptions();
        // Điền sẵn và khóa loại tour
        this.tourForm.get('tourType')?.setValue('CUSTOM');
        this.tourForm.get('tourType')?.disable();
      } else {
        this.initializeNormalMode();
      }
    });

    this.destinationSub = this.tourForm
      .get('destinationLocationIds')!
      .valueChanges.subscribe((ids: number[]) => {
        this.durationDays = ids ? ids.length : 0;
      });
  }

  private initializeNormalMode(): void {
    const data$ = this.route.paramMap.pipe(
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

    data$.subscribe((data) => {
      this.tourOptions$ = of(data.options);
      if (this.isEditMode && data.detail) {
        this.pageTitle = 'Chi tiết & Cập nhật Tour';
        this.patchFormWithTourData(data.detail);
      }
    });
  }

  ngOnDestroy(): void {
    this.destinationSub?.unsubscribe();
  }

  private buildForm(): void {
    this.tourForm = this.fb.group({
      name: ['', Validators.required],
      code: [{ value: '', disabled: true }],
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
      tourType: tour.tourType,
      departLocationId: tour.departLocation.id,
      destinationLocationIds: tour.destinations.map((d) => d.id),
      tourThemeIds: tour.themes.map((t) => t.id),
    });
    if (tour.thumbnailUrl) {
      this.imagePreview = tour.thumbnailUrl;
    }
  }

  public onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
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

    if (this.selectedFile) {
      formData.append(
        'thumbnailFile',
        this.selectedFile,
        this.selectedFile.name
      );
    }

    const tourData: any = {
      name: formValue.name,
      description: formValue.description,
      tourType: formValue.tourType,
      tourStatus: formValue.tourStatus,
      departLocationId: formValue.departLocationId,
      destinationLocationIds: formValue.destinationLocationIds,
      tourThemeIds: formValue.tourThemeIds,
    };

    // Nếu là tạo tour từ yêu cầu, thêm requestBookingId
    if (this.isCustomRequestMode && this.requestBookingId) {
      tourData.requestBookingId = this.requestBookingId;
    }

    formData.append(
      'tourData',
      new Blob([JSON.stringify(tourData)], { type: 'application/json' })
    );

    const apiCall =
      this.isEditMode && this.tourId
        ? this.tourService.updateTourWithFile(this.tourId, formData)
        : this.tourService.createTourWithFile(formData);

    apiCall.subscribe({
      next: (createdTour) => {
        alert(
          this.isEditMode
            ? 'Cập nhật tour thành công!'
            : `Tạo tour thành công! Mã tour: ${createdTour.code}`
        );
        this.router.navigate(['/business/tours', createdTour.id, 'schedule']);
      },
      error: (err) => {
        console.error('Lỗi khi lưu tour:', err);
        alert('Có lỗi xảy ra khi lưu tour.');
      },
    });
  }

  public goBack(): void {
    this.router.navigate(['/business/tours']);
  }
}
