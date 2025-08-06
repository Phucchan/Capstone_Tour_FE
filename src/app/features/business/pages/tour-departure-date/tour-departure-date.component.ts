// src/app/features/business/pages/tour-departure-date/tour-departure-date.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, forkJoin, BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, map, tap, finalize } from 'rxjs/operators';
import { NgSelectModule } from '@ng-select/ng-select';

import { TourDepartureService } from '../../../../core/services/tour-departure.service';
import { TourService } from '../../../../core/services/tour.service';
import { TourDetail } from '../../../../core/models/tour.model';
import {
  TourSchedule,
  TourScheduleOptions,
  TourPaxOption,
  UserBasic,
  TourScheduleCreateRequest,
} from '../../../../core/models/tour-schedule.model';

import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-tour-departure-date',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NgSelectModule,
    SpinnerComponent,
    CurrencyVndPipe,
    DatePipe,
  ],
  templateUrl: './tour-departure-date.component.html',
})
export class TourDepartureDateComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  private tourDepartureService = inject(TourDepartureService);

  tourId!: number;
  tourDetail$!: Observable<TourDetail>;

  private schedulesSubject = new BehaviorSubject<TourSchedule[]>([]);
  schedules$ = this.schedulesSubject.asObservable();

  options!: TourScheduleOptions;

  isLoading = true;
  isModalVisible = false;
  isSubmitting = false;

  departureForm!: FormGroup;
  private repeatSub!: Subscription;

  // Mảng dữ liệu cho dropdown lặp lại
  repeatTypes = [
    { value: 'NONE', label: 'Không lặp lại' },
    { value: 'WEEKLY', label: 'Hàng tuần' },
    { value: 'MONTHLY', label: 'Hàng tháng' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.handleRepeatChanges();

    this.route.paramMap
      .pipe(
        tap((params) => (this.tourId = +params.get('id')!)),
        switchMap(() => this.loadInitialData())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.repeatSub) {
      this.repeatSub.unsubscribe();
    }
  }

  private loadInitialData() {
    this.isLoading = true;
    this.tourDetail$ = this.tourService
      .getTourById(this.tourId)
      .pipe(map((res) => res.detail));

    return forkJoin({
      schedules: this.tourDepartureService.getTourSchedules(this.tourId),
      options: this.tourDepartureService.getScheduleOptions(this.tourId),
    }).pipe(
      tap(({ schedules, options }) => {
        this.options = options;
        const schedulesWithDetails = this.mapScheduleDetails(
          schedules,
          options
        );
        this.schedulesSubject.next(schedulesWithDetails);
      }),
      finalize(() => (this.isLoading = false))
    );
  }

  private initForm(): void {
    this.departureForm = this.fb.group({
      departureDate: [null, Validators.required],
      coordinatorId: [null, Validators.required],
      tourPaxId: [null, Validators.required],
      // Thêm 2 trường mới
      repeatType: ['NONE', Validators.required],
      repeatCount: [
        { value: 0, disabled: true },
        [Validators.required, Validators.min(1)],
      ],
    });
  }

  // Xử lý logic ẩn/hiện và yêu cầu của ô "Số lần lặp"
  private handleRepeatChanges(): void {
    const repeatTypeControl = this.departureForm.get('repeatType');
    const repeatCountControl = this.departureForm.get('repeatCount');

    if (repeatTypeControl && repeatCountControl) {
      this.repeatSub = repeatTypeControl.valueChanges.subscribe((value) => {
        if (value === 'NONE') {
          repeatCountControl.setValue(0);
          repeatCountControl.disable();
        } else {
          repeatCountControl.enable();
          repeatCountControl.setValue(1); // Set giá trị mặc định là 1
        }
      });
    }
  }

  private mapScheduleDetails(
    schedules: TourSchedule[],
    options: TourScheduleOptions
  ): TourSchedule[] {
    return schedules.map((schedule) => ({
      ...schedule,
      coordinator: options.coordinators.find(
        (c) => c.id === schedule.coordinatorId
      ),
      tourPax: options.tourPaxes.find((p) => p.id === schedule.tourPaxId),
    }));
  }

  showCreateModal(): void {
    this.departureForm.reset({
      repeatType: 'NONE',
      repeatCount: { value: 0, disabled: true },
    });
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  onSave(): void {
    if (this.departureForm.invalid) {
      this.departureForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.departureForm.getRawValue(); // Dùng getRawValue để lấy cả trường bị disable

    // Tạo chuỗi ngày giờ đúng định dạng YYYY-MM-DDTHH:mm:ss
    const localDate = new Date(formValue.departureDate);
    const year = localDate.getFullYear();
    const month = ('0' + (localDate.getMonth() + 1)).slice(-2);
    const day = ('0' + localDate.getDate()).slice(-2);
    const formattedDateString = `${year}-${month}-${day}T00:00:00`;

    const payload: TourScheduleCreateRequest = {
      coordinatorId: formValue.coordinatorId,
      tourPaxId: formValue.tourPaxId,
      departureDate: formattedDateString,
      repeatType: formValue.repeatType,
      repeatCount: formValue.repeatType === 'NONE' ? 0 : formValue.repeatCount,
    };

    console.log('Dữ liệu gửi lên server:', payload);

    this.tourDepartureService
      .createTourSchedule(this.tourId, payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          alert('Thêm (các) ngày khởi hành thành công!');
          this.closeModal();
          this.loadInitialData().subscribe();
        },
        error: (err) => {
          console.error('Lỗi chi tiết từ server:', err);
          alert(
            `Lỗi từ server: ${err.message || 'Không thể thêm ngày khởi hành.'}`
          );
        },
      });
  }

  formatPaxOption(pax: TourPaxOption): string {
    return `Gói ${pax.minQuantity} - ${pax.maxQuantity} khách`;
  }
}
