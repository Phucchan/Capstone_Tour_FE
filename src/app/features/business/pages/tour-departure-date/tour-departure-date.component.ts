import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, forkJoin, BehaviorSubject, Subscription, of } from 'rxjs';
import { switchMap, map, tap, finalize } from 'rxjs/operators';

// Core Services & Models
import { TourDepartureService } from '../../../../core/services/tour-departure.service';
import { TourService } from '../../../../core/services/tour.service';
import { TourDetail } from '../../../../core/models/tour.model';
import {
  TourSchedule,
  TourScheduleOptions,
  TourPaxOption,
  TourScheduleCreateRequest,
} from '../../../../core/models/tour-schedule.model';

// Shared Pipes
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

// NG-ZORRO Imports
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalService, NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-tour-departure-date',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyVndPipe,
    FormatDatePipe,
    NzPageHeaderModule,
    NzButtonModule,
    NzTableModule,
    NzSpinModule,
    NzModalModule,
    NzFormModule,
    NzDatePickerModule,
    NzSelectModule,
    NzInputNumberModule,
    NzPopconfirmModule,
    NzEmptyModule,
    NzDividerModule,
    NzIconModule,
  ],
  templateUrl: './tour-departure-date.component.html',
})
export class TourDepartureDateComponent implements OnInit, OnDestroy {
  // --- Injections ---
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  private tourDepartureService = inject(TourDepartureService);
  private modalService = inject(NzModalService);
  private message = inject(NzMessageService);
  private router = inject(Router);

  // --- State ---
  tourId!: number;
  tourDetail$!: Observable<TourDetail>;
  private schedulesSubject = new BehaviorSubject<TourSchedule[]>([]);
  schedules$ = this.schedulesSubject.asObservable();
  options: TourScheduleOptions | null = null;
  isLoading = true;
  isSubmitting = false;
  departureForm!: FormGroup;
  private repeatSub!: Subscription;

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
    this.repeatSub?.unsubscribe();
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
      repeatType: ['NONE', Validators.required],
      repeatCount: [
        { value: 1, disabled: true },
        [Validators.required, Validators.min(1)],
      ],
    });
  }

  private handleRepeatChanges(): void {
    const repeatTypeControl = this.departureForm.get('repeatType');
    const repeatCountControl = this.departureForm.get('repeatCount');

    if (repeatTypeControl && repeatCountControl) {
      this.repeatSub = repeatTypeControl.valueChanges.subscribe((value) => {
        if (value === 'NONE') {
          repeatCountControl.setValue(1);
          repeatCountControl.disable();
        } else {
          repeatCountControl.enable();
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

  showCreateModal(modalContent: TemplateRef<{}>): void {
    this.departureForm.reset({
      repeatType: 'NONE',
      repeatCount: { value: 1, disabled: true },
    });

    this.modalService.create({
      nzTitle: 'Thêm Ngày Khởi Hành Mới',
      nzContent: modalContent,
      nzFooter: [
        { label: 'Hủy', onClick: () => this.modalService.closeAll() },
        {
          label: 'Lưu',
          type: 'primary',
          loading: this.isSubmitting,
          disabled: () => this.departureForm.invalid,
          onClick: () => this.onSave(),
        },
      ],
      nzMaskClosable: false,
      nzWidth: '600px',
    });
  }

  onSave(): void {
    if (this.departureForm.invalid) {
      Object.values(this.departureForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.departureForm.getRawValue();

    const localDate: Date = formValue.departureDate;
    const formattedDateString = `${localDate.getFullYear()}-${(
      '0' +
      (localDate.getMonth() + 1)
    ).slice(-2)}-${('0' + localDate.getDate()).slice(-2)}T00:00:00`;

    const payload: TourScheduleCreateRequest = {
      coordinatorId: formValue.coordinatorId,
      tourPaxId: formValue.tourPaxId,
      departureDate: formattedDateString,
      repeatType: formValue.repeatType,
      repeatCount: formValue.repeatType === 'NONE' ? 0 : formValue.repeatCount,
    };

    this.tourDepartureService
      .createTourSchedule(this.tourId, payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.message.success('Thêm (các) ngày khởi hành thành công!');
          this.modalService.closeAll();
          this.loadInitialData().subscribe();
        },
        error: (err) => {
          console.error('Lỗi chi tiết từ server:', err);
          this.message.error(
            err.error?.message || 'Không thể thêm ngày khởi hành.'
          );
        },
      });
  }

  onDelete(scheduleId: number): void {
    this.tourDepartureService
      .deleteTourSchedule(this.tourId, scheduleId)
      .subscribe({
        next: () => {
          this.message.success('Xóa ngày khởi hành thành công!');
          this.loadInitialData().subscribe();
        },
        error: (err) => {
          console.error('Lỗi xóa ngày khởi hành:', err);
          this.message.error('Không thể xóa ngày khởi hành.');
        },
      });
  }

  formatPaxOption(pax: TourPaxOption): string {
    if (!pax) return '';
    return `Gói ${pax.minQuantity} - ${pax.maxQuantity} khách`;
  }
  goBack(): void {
    this.router.navigate(['/business/tours', this.tourId]);
  }
}
