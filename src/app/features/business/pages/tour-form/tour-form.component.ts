import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NgSelectModule } from '@ng-select/ng-select';

import { TourService } from '../../../../core/services/tour.service';
import {
  TourOptionsData,
  CreateTourRequest,
  UpdateTourRequest,
  TourDetail,
  TourDayManagerDTO,
  TourDetailWithOptions,
} from '../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './tour-form.component.html',
  styleUrls: ['./tour-form.component.css'],
})
export class TourFormComponent implements OnInit, OnDestroy {
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

    tourWithOptions$.subscribe((data: any) => {
      this.tourOptions$ = of(data.options);
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
      thumbnailUrl: [''],
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
      thumbnailUrl: tour.thumbnailUrl,
      description: tour.description,
      tourStatus: tour.tourStatus,
      departLocationId: tour.departLocation.id,
      destinationLocationIds: tour.destinations.map((d) => d.id),
      tourThemeIds: tour.themes.map((t) => t.id),
    });
  }

  public onSubmit(): void {
    if (this.tourForm.invalid) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      this.tourForm.markAllAsTouched();
      return;
    }

    const formValue = this.tourForm.getRawValue();

    if (this.isEditMode && this.tourId) {
      const updateData: UpdateTourRequest = {
        name: formValue.name,
        thumbnailUrl: formValue.thumbnailUrl,
        description: formValue.description,
        tourStatus: formValue.tourStatus,
        departLocationId: formValue.departLocationId,
        destinationLocationIds: formValue.destinationLocationIds,
        tourThemeIds: formValue.tourThemeIds,
      };
      this.tourService.updateTour(this.tourId, updateData).subscribe({
        next: () => {
          alert('Cập nhật tour thành công!');
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật tour:', err);
          alert('Có lỗi xảy ra khi cập nhật tour.');
        },
      });
    } else {
      const createData: CreateTourRequest = {
        name: formValue.name,
        thumbnailUrl: formValue.thumbnailUrl,
        description: formValue.description,
        departLocationId: formValue.departLocationId,
        destinationLocationIds: formValue.destinationLocationIds,
        tourThemeIds: formValue.tourThemeIds,
      };
      this.tourService.createTour(createData).subscribe({
        next: (createdTour) => {
          alert(`Tạo tour thành công! Mã tour của bạn là: ${createdTour.code}`);
          this.router.navigate(['/business/tours', createdTour.id, 'schedule']);
        },
        error: (err) => {
          console.error('Lỗi khi tạo tour:', err);
          alert('Có lỗi xảy ra khi tạo tour.');
        },
      });
    }
  }

  public goBack(): void {
    this.router.navigate(['/business/tours']);
  }
}
