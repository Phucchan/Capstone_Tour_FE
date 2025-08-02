// src/app/features/business/pages/tour-departure-date/tour-departure-date.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, forkJoin, BehaviorSubject } from 'rxjs';
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
    // RouterLink,
    ReactiveFormsModule,
    NgSelectModule,
    SpinnerComponent,
    CurrencyVndPipe,
    DatePipe,
  ],
  templateUrl: './tour-departure-date.component.html',
})
export class TourDepartureDateComponent implements OnInit {
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

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap
      .pipe(
        tap((params) => (this.tourId = +params.get('id')!)),
        switchMap(() => this.loadInitialData())
      )
      .subscribe();
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
    });
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
    this.departureForm.reset();
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
    const formValue = this.departureForm.value;
    // 1. Tạo đối tượng Date từ giá trị của form (input type="date" trả về múi giờ địa phương)
    const localDate = new Date(formValue.departureDate);

    // 2. Lấy các thành phần ngày, tháng, năm, giờ, phút, giây từ đối tượng Date đó.
    // Các hàm getFullYear(), getMonth(),... sẽ lấy theo múi giờ của trình duyệt.
    const year = localDate.getFullYear();
    const month = ('0' + (localDate.getMonth() + 1)).slice(-2); // Thêm '0' nếu cần
    const day = ('0' + localDate.getDate()).slice(-2);

    // Mặc định giờ bắt đầu là 00:00:00
    const hours = '00';
    const minutes = '00';
    const seconds = '00';

    // 3. Ghép lại thành chuỗi đúng định dạng mà LocalDateTime của Java có thể đọc được
    // Ví dụ: "2025-08-01T00:00:00"
    const formattedDateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    const payload: TourScheduleCreateRequest = {
      coordinatorId: formValue.coordinatorId,
      tourPaxId: formValue.tourPaxId,
      departureDate: formattedDateString, // <-- Sử dụng chuỗi đã định dạng
    };

    // Dòng này để bạn kiểm tra lại dữ liệu gửi đi trong Console của trình duyệt
    console.log('Dữ liệu gửi lên server:', payload);

    this.tourDepartureService
      .createTourSchedule(this.tourId, payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          alert('Thêm ngày khởi hành thành công!');
          this.closeModal();
          this.loadInitialData().subscribe();
        },
        error: (err) => {
          console.error(err);
          alert(`Lỗi: ${err.message || 'Không thể thêm ngày khởi hành.'}`);
        },
      });
  }

  formatPaxOption(pax: TourPaxOption): string {
    return `Gói ${pax.minQuantity} - ${pax.maxQuantity} khách`;
  }
}
