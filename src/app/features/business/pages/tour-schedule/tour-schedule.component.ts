import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, finalize } from 'rxjs/operators';
import { TourService } from '../../../../core/services/tour.service';
import {
  TourDayManagerDTO,
  TourDetail,
} from '../../../../core/models/tour.model';
import { TourDayFormComponent } from '../../components/tour-day-form/tour-day-form.component';

@Component({
  selector: 'app-tour-schedule',
  standalone: true,
  imports: [CommonModule, TourDayFormComponent],
  templateUrl: './tour-schedule.component.html',
  styleUrls: ['./tour-schedule.component.css'],
})
export class TourScheduleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tourService = inject(TourService);

  public tourId!: number;
  public tourDetail$!: Observable<TourDetail>;
  private tourDaysSubject = new BehaviorSubject<TourDayManagerDTO[]>([]);
  public tourDays$ = this.tourDaysSubject.asObservable();
  public isLoading = true;

  public isModalOpen = false;
  public currentDayToEdit: TourDayManagerDTO | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.tourId = +idParam;
        this.loadInitialData();
      } else {
        this.router.navigate(['/business/tours']);
      }
    });
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
    this.isModalOpen = true;
  }

  openEditModal(day: TourDayManagerDTO): void {
    this.currentDayToEdit = day;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentDayToEdit = null;
  }

  // SỬA LỖI: Hàm này được gọi khi form con lưu thành công, chỉ cần đóng modal và tải lại dữ liệu
  handleFormSave(): void {
    this.closeModal();
    this.loadInitialData();
  }

  handleDelete(day: TourDayManagerDTO): void {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa "Ngày ${day.dayNumber}: ${day.title}"?`
      )
    ) {
      this.tourService.deleteTourDay(this.tourId, day.id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadInitialData();
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
          alert('Đã có lỗi xảy ra khi xóa.');
        },
      });
    }
  }
}
