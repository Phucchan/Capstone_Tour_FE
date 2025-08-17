import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // THÊM: CurrencyPipe
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap, finalize } from 'rxjs/operators';

// Core Services & Models
import { TourService } from '../../../../core/services/tour.service';
import { RequestBookingService } from '../../services/request-booking.service';
import {
  TourOptionsData,
  TourDetail,
} from '../../../../core/models/tour.model';
import { RequestBookingDetail } from '../../models/request-booking.model';

// NG-ZORRO Imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CurrencyPipe,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzPageHeaderModule,
    NzGridModule,
    NzCardModule,
    NzSpinModule,
    NzUploadModule,
    NzRadioModule,
    NzInputNumberModule,
    NzIconModule,
    NzAlertModule,
    NzDescriptionsModule, // THÊM: NzDescriptionsModule
  ],
  templateUrl: './tour-form.component.html',
})
export class TourFormComponent implements OnInit {
  // --- Injections ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tourService = inject(TourService);
  private requestBookingService = inject(RequestBookingService);
  private message = inject(NzMessageService);

  // --- State ---
  tourForm!: FormGroup;
  pageTitle = 'Tạo Tour mới';
  isEditMode = false;
  isLoading = true;
  isSubmitting = false;
  tourId: number | null = null;
  tourOptions$!: Observable<TourOptionsData>;
  durationDays = 0;

  // --- File Upload State ---
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  fileList: NzUploadFile[] = [];

  // --- Custom Request Mode State ---
  isCustomRequestMode = false;
  requestBookingId: number | null = null;
  requestBookingDetail$: Observable<RequestBookingDetail> | null = null;

  constructor() {
    this.buildForm();
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((queryParams) => {
      const requestBookingIdParam = queryParams.get('requestBookingId');
      const tourTypeParam = queryParams.get('tourType');

      if (requestBookingIdParam && tourTypeParam === 'CUSTOM') {
        this.setupCustomRequestMode(+requestBookingIdParam);
      } else {
        this.setupNormalMode();
      }
    });

    this.tourForm
      .get('destinationLocationIds')!
      .valueChanges.subscribe((ids: number[]) => {
        this.durationDays = ids ? ids.length : 0;
      });
  }

  private setupCustomRequestMode(reqId: number): void {
    this.isCustomRequestMode = true;
    this.requestBookingId = reqId;
    this.pageTitle = 'Tạo Tour theo Yêu cầu';

    // Sử dụng `tap` để tự động điền form sau khi nhận dữ liệu
    this.requestBookingDetail$ = this.requestBookingService
      .getRequestDetail(this.requestBookingId)
      .pipe(
        tap((requestDetail) => {
          // Tự động điền các trường form từ thông tin yêu cầu
          this.tourForm.patchValue({
            tourType: 'CUSTOM',
            departLocationId: requestDetail.departureLocationId,
            destinationLocationIds: requestDetail.destinationLocationIds,
            tourThemeIds: requestDetail.tourThemeIds,
            // Gợi ý tên tour từ yêu cầu của khách
            name: `Tour theo yêu cầu của ${requestDetail.customerName} - ${
              requestDetail.destinationDetail || 'Khám phá'
            }`,
          });
        })
      );

    this.tourOptions$ = this.tourService.getTourOptions();
    this.tourForm.get('tourType')?.disable();
    this.isLoading = false;
  }

  private setupNormalMode(): void {
    const data$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.tourId = +id;
          this.pageTitle = 'Chi tiết & Cập nhật Tour';
          return this.tourService.getTourById(this.tourId);
        }
        this.isEditMode = false;
        this.pageTitle = 'Tạo Tour Mới';
        return this.tourService
          .getTourOptions()
          .pipe(map((options) => ({ detail: null, options })));
      })
    );

    data$.subscribe({
      next: (data) => {
        this.tourOptions$ = of(data.options);
        if (this.isEditMode && data.detail) {
          this.patchFormWithTourData(data.detail);
        }
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
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
      this.fileList = [
        {
          uid: '-1',
          name: 'thumbnail.png',
          status: 'done',
          url: tour.thumbnailUrl,
        },
      ];
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.selectedFile = file as unknown as File;
    const reader = new FileReader();
    reader.onload = (e) => (this.imagePreview = e.target?.result ?? null);
    reader.readAsDataURL(this.selectedFile);
    return false;
  };

  onSubmit(): void {
    if (this.tourForm.invalid) {
      Object.values(this.tourForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    this.isSubmitting = true;
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

    apiCall.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: (createdTour: TourDetail) => {
        this.message.success(
          this.isEditMode
            ? 'Cập nhật tour thành công!'
            : `Tạo tour thành công! Mã tour: ${createdTour.code}`
        );
        this.router.navigate(['/business/tours', createdTour.id, 'schedule']);
      },
      error: (err: any) => {
        console.error('Lỗi khi lưu tour:', err);
        this.message.error('Có lỗi xảy ra khi lưu tour.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/business/tours']);
  }
}
