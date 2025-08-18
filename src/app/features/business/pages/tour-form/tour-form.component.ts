import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap, finalize, catchError } from 'rxjs/operators';


// Core Services & Models
import { TourService } from '../../../../core/services/tour.service';
import { RequestBookingService } from '../../services/request-booking.service';
import {
  TourOptionsData,
  TourDetail,
  TourPaxRequestDTO,
} from '../../../../core/models/tour.model';
import { RequestBookingDetail } from '../../models/request-booking.model';
import { TourDepartureService } from '../../../../core/services/tour-departure.service';
import { TourScheduleCreateRequest } from '../../../../core/models/tour-schedule.model';
import { TourPaxService } from '../../../../core/services/tour-pax.service';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';

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
import { NzSpaceModule } from 'ng-zorro-antd/space';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CurrencyPipe,
    RouterLink,
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
    NzDescriptionsModule,
    NzSpaceModule,
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
  private tourDepartureService = inject(TourDepartureService);
  private message = inject(NzMessageService);
  private tourPaxService = inject(TourPaxService);
  private currentUserService = inject(CurrentUserService);

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
  private requestStartDate: string | null = null;
  private requestEndDate: string | null = null;

  //Getter để lấy trạng thái tour
  get tourStatus(): string {
    return this.tourForm.get('tourStatus')?.value;
  }

  constructor() {
    this.buildForm();
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((queryParams) => {
      const requestBookingIdParam = queryParams.get('requestBookingId');
      const tourTypeParam = queryParams.get('tourType');
      this.requestStartDate = queryParams.get('startDate');
      this.requestEndDate = queryParams.get('endDate');
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
        if (
          this.isCustomRequestMode &&
          this.requestStartDate &&
          this.requestEndDate
        ) {
          this.publishAndCreateSchedule(createdTour);
        } else {
          this.message.success(
            this.isEditMode
              ? 'Cập nhật tour thành công!'
              : `Tạo tour thành công! Mã tour: ${createdTour.code}`
          );
          this.router.navigate(['/business/tours', createdTour.id, 'schedule']);
        }
      },
      error: (err: any) => {
        console.error('Lỗi khi lưu tour:', err);
        this.message.error('Có lỗi xảy ra khi lưu tour.');
      },
    });
  }

  //Hàm mới để publish tour trước khi tạo schedule
  private publishAndCreateSchedule(tour: TourDetail): void {
    // Tạo payload để cập nhật trạng thái tour
    const formValue = this.tourForm.getRawValue();
    const tourUpdateData = {
      name: formValue.name,
      description: formValue.description,
      tourType: formValue.tourType,
      tourStatus: 'PUBLISHED', // Đặt trạng thái là PUBLISHED
      departLocationId: formValue.departLocationId,
      destinationLocationIds: formValue.destinationLocationIds,
      tourThemeIds: formValue.tourThemeIds,
    };

    const formData = new FormData();
    formData.append(
      'tourData',
      new Blob([JSON.stringify(tourUpdateData)], { type: 'application/json' })
    );

    // Bước 1: Cập nhật tour sang trạng thái PUBLISHED
    this.tourService.updateTourWithFile(tour.id, formData).subscribe({
      next: () => {
        // Bước 2: Sau khi publish thành công, tiến hành tạo schedule
        this.autoCreateSchedule(tour.id);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật trạng thái tour sang PUBLISHED:', err);
        this.message.error(
          'Tạo tour thành công nhưng không thể chuyển sang trạng thái công khai.'
        );
        this.router.navigate(['/business/tours', tour.id]);
      },
    });
  }

  // Hàm mới để tự động tạo lịch trình (ngày khởi hành)
  private autoCreateSchedule(tourId: number): void {
    const currentUser = this.currentUserService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.message.error(
        'Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại.'
      );
      return;
    }
    const coordinatorId = currentUser.id;

    this.requestBookingDetail$!.pipe(
      switchMap((requestDetail) => {
        const totalGuests =
          requestDetail.adults +
          requestDetail.children +
          requestDetail.infants +
          requestDetail.toddlers;

        const paxPayload: TourPaxRequestDTO = {
          minQuantity: totalGuests,
          maxQuantity: totalGuests,
          manualPrice: true,
        };

        return this.tourPaxService.createTourPax(tourId, paxPayload);
      }),
      switchMap((newPax) => {
        if (!newPax || !newPax.id) {
          return throwError(() => new Error('Tạo gói giá thất bại.'));
        }
        const tourPaxId = newPax.id;

        // Chuyển đổi ngày sang định dạng ISO đầy đủ (YYYY-MM-DDTHH:mm:ss)
        const departureDateISO = new Date(this.requestStartDate!).toISOString();

        const schedulePayload: TourScheduleCreateRequest = {
          departureDate: departureDateISO,
          coordinatorId: coordinatorId,
          tourPaxId: tourPaxId,
        };

        return this.tourDepartureService.createTourSchedule(
          tourId,
          schedulePayload
        );
      }),
      catchError((err) => {
        console.error('Lỗi trong chuỗi tự động tạo lịch trình:', err);
        this.message.warning(
          'Tạo tour thành công nhưng không thể tự động tạo ngày khởi hành. Vui lòng thêm thủ công.'
        );
        this.router.navigate(['/business/tours', tourId, 'departure-dates']);
        return of(null);
      })
    ).subscribe((result) => {
      if (result) {
        this.message.success(
          `Tạo tour thành công và đã tự động thêm ngày khởi hành!`
        );
        this.router.navigate(['/business/tours', tourId, 'departure-dates']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/business/tours']);
  }
}
