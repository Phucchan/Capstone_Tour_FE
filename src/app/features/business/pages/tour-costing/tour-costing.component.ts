import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { switchMap, tap, finalize, map } from 'rxjs/operators';

import { TourService } from '../../../../core/services/tour.service';
import { TourPaxService } from '../../../../core/services/tour-pax.service';
import {
  ServiceBreakdownDTO,
  TourDetail,
  TourPaxFullDTO,
  TourPaxCreateRequestDTO,
  TourPaxUpdateRequestDTO,
  TourDayManagerDTO,
} from '../../../../core/models/tour.model';
import { PaxFormComponent } from '../../components/pax-form/pax-form.component';
import { ServiceFormComponent } from '../../components/service-form/service-form.component';

@Component({
  selector: 'app-tour-costing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CurrencyPipe,
    PaxFormComponent,
    ServiceFormComponent,
  ],
  templateUrl: './tour-costing.component.html',
  styleUrls: ['./tour-costing.component.css'],
})
export class TourCostingComponent implements OnInit {
  // --- Injections ---
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  private tourPaxService = inject(TourPaxService);
  public tourDaysForForm: TourDayManagerDTO[] = [];

  // --- State ---
  public tourId!: number;
  public tourDetail$!: Observable<TourDetail>;
  public serviceBreakdown$!: Observable<ServiceBreakdownDTO[]>;
  private paxConfigsSubject = new BehaviorSubject<TourPaxFullDTO[]>([]);
  public tourPaxConfigs$!: Observable<TourPaxFullDTO[]>;
  public isLoading = true;

  public costingForm!: FormGroup;
  public isPaxModalOpen = false;
  public currentPaxToEdit: TourPaxFullDTO | null = null;
  public isServiceModalOpen = false;

  ngOnInit(): void {
    this.costingForm = this.fb.group({
      profitRate: [10, [Validators.required, Validators.min(0)]], // Mặc định lợi nhuận 10%
      extraCost: [0, [Validators.required, Validators.min(0)]],
    });

    this.route.paramMap
      .pipe(
        tap((params) => {
          const idParam = params.get('id');
          if (!idParam) {
            this.router.navigate(['/business/tours']);
            return;
          }
          this.tourId = +idParam;
        }),
        switchMap(() => this.loadAllData())
      )
      .subscribe();
  }

  loadAllData() {
    this.isLoading = true;
    return forkJoin({
      detail: this.tourService
        .getTourById(this.tourId)
        .pipe(map((res) => res.detail)),
      services: this.tourPaxService.getServiceBreakdown(this.tourId),
      paxConfigs: this.tourPaxService.getTourPaxConfigurations(this.tourId),
      days: this.tourService.getTourDays(this.tourId),
    }).pipe(
      tap((response) => {
        this.tourDetail$ = of(response.detail);
        this.serviceBreakdown$ = of(response.services);
        this.paxConfigsSubject.next(response.paxConfigs);
        this.tourDaysForForm = response.days;
      }),
      finalize(() => (this.isLoading = false))
    );
  }

  calculatePrices(): void {
    if (this.costingForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.tourPaxService
      .calculatePrices(this.tourId, this.costingForm.value)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updatedPaxConfigs) => {
          this.paxConfigsSubject.next(updatedPaxConfigs);
          alert('Đã tính toán và cập nhật giá thành công!');
        },
        error: (err) => console.error('Lỗi khi tính giá:', err),
      });
  }
  // --- Service Modal Logic ---
  openServiceModal(): void {
    this.isServiceModalOpen = true;
  }

  closeServiceModal(): void {
    this.isServiceModalOpen = false;
  }

  // --- Pax Modal Logic ---
  openPaxModal(pax: TourPaxFullDTO | null = null): void {
    this.currentPaxToEdit = pax;
    this.isPaxModalOpen = true;
  }

  closePaxModal(): void {
    this.isPaxModalOpen = false;
    this.currentPaxToEdit = null;
  }

  // --- Pax Save Logic ---
  handlePaxSave(
    formData: TourPaxCreateRequestDTO | TourPaxUpdateRequestDTO
  ): void {
    let saveObservable: Observable<any>;
    if (this.currentPaxToEdit) {
      saveObservable = this.tourPaxService.updateTourPax(
        this.tourId,
        this.currentPaxToEdit.id,
        formData
      );
    } else {
      saveObservable = this.tourPaxService.createTourPax(this.tourId, formData);
    }
    saveObservable.subscribe({
      next: () => {
        this.closePaxModal();
        this.loadAllData().subscribe();
      },
      error: (err) => console.error('Lỗi khi lưu khoảng khách:', err),
    });
  }

  // --- Pax Delete Logic ---
  handlePaxDelete(paxId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa khoảng khách này?')) {
      this.tourPaxService.deleteTourPax(this.tourId, paxId).subscribe({
        next: () => {
          this.loadAllData().subscribe();
        },
        error: (err) => console.error('Lỗi khi xóa khoảng khách:', err),
      });
    }
  }
  // --- Service Save Logic ---
  handleServiceSave(event: { dayId: number; serviceId: number }): void {
    this.tourPaxService
      .addServiceToTourDay(this.tourId, event.dayId, event.serviceId)
      .subscribe({
        next: () => {
          this.closeServiceModal();
          this.loadAllData().subscribe(); // Tải lại toàn bộ dữ liệu
        },
        error: (err) => alert('Lỗi khi thêm dịch vụ: ' + err.error.message),
      });
  }
  // --- Service Delete Logic ---
  handleServiceDelete(service: ServiceBreakdownDTO): void {
    if (
      confirm(
        `Bạn có chắc muốn xóa dịch vụ "${service.serviceTypeName}" của "${service.partnerName}" khỏi Ngày ${service.dayNumber}?`
      )
    ) {
      this.tourPaxService
        .removeServiceFromTourDay(this.tourId, service.dayId, service.serviceId)
        .subscribe({
          next: () => {
            this.loadAllData().subscribe();
          },
          error: (err) => alert('Lỗi khi xóa dịch vụ: ' + err.error.message),
        });
    }
  }
}
