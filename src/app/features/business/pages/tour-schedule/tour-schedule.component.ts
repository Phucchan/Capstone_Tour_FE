import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { TourService } from '../../../../core/services/tour.service';
import {
  TourDayManagerDTO,
  TourDetail,
} from '../../../../core/models/tour.model';
import { TourDayFormComponent } from '../../components/tour-day-form/tour-day-form.component';

// NG-ZORRO Imports
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-tour-schedule',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TourDayFormComponent,
    // --- NG-ZORRO ---
    NzPageHeaderModule,
    NzButtonModule,
    NzSpinModule,
    NzEmptyModule,
    NzCardModule,
    NzTagModule,
    NzDropDownModule,
    NzIconModule,
    NzModalModule,
    NzPopconfirmModule,
  ],
  templateUrl: './tour-schedule.component.html',
})
export class TourScheduleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tourService = inject(TourService);
  private message = inject(NzMessageService);

  public tourId!: number;
  public tourDetail$: Observable<TourDetail> | null = null;
  private tourDaysSubject = new BehaviorSubject<TourDayManagerDTO[]>([]);
  public tourDays$ = this.tourDaysSubject.asObservable();
  public isLoading = true;

  public isModalOpen = false;
  public modalTitle = '';
  public currentDayToEdit: TourDayManagerDTO | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.tourId = +idParam;
      this.loadInitialData();
    } else {
      this.router.navigate(['/business/tours']);
    }
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      detail: this.tourService
        .getTourById(this.tourId)
        .pipe(map((res) => res.detail)),
      days: this.tourService.getTourDays(this.tourId),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((response) => {
        this.tourDetail$ = of(response.detail);
        this.tourDaysSubject.next(response.days);
      });
  }

  openAddModal(): void {
    this.currentDayToEdit = null;
    this.modalTitle = 'Thêm ngày mới vào lịch trình';
    this.isModalOpen = true;
  }

  openEditModal(day: TourDayManagerDTO): void {
    this.currentDayToEdit = day;
    this.modalTitle = `Chỉnh sửa Ngày ${day.dayNumber}: ${day.title}`;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentDayToEdit = null;
  }

  handleFormSave(): void {
    this.message.success('Lưu thông tin thành công!');
    this.closeModal();
    this.loadInitialData();
  }

  handleDelete(day: TourDayManagerDTO): void {
    this.tourService.deleteTourDay(this.tourId, day.id).subscribe({
      next: () => {
        this.message.success(`Đã xóa "Ngày ${day.dayNumber}"`);
        this.loadInitialData();
      },
      error: (err) => {
        console.error('Lỗi khi xóa:', err);
        this.message.error('Đã có lỗi xảy ra khi xóa.');
      },
    });
  }

  // FIX: Added the missing goBack function
  goBack(): void {
    this.router.navigate(['/business/tours']);
  }
}
