import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { switchMap, tap, map, finalize } from 'rxjs/operators';
import { TourService } from '../../../../core/services/tour.service';
import {
  TourDayManagerCreateRequestDTO,
  TourDayManagerDTO,
  TourDetail,
} from '../../../../core/models/tour.model';
// --- Import component form mới ---
import { TourDayFormComponent } from '../../components/tour-day-form/tour-day-form.component';

@Component({
  selector: 'app-tour-schedule',
  standalone: true,
  imports: [
    CommonModule,
    TourDayFormComponent, // <-- Thêm vào đây
  ],
  templateUrl: './tour-schedule.component.html',
  styleUrls: ['./tour-schedule.component.css'],
})
export class TourScheduleComponent implements OnInit {
  // --- Injections ---
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tourService = inject(TourService);

  // --- State Management ---
  public tourId!: number;
  public tourDetail$!: Observable<TourDetail>;
  private tourDaysSubject = new BehaviorSubject<TourDayManagerDTO[]>([]);
  public tourDays$ = this.tourDaysSubject.asObservable();
  public isLoading = true;

  // --- Modal State ---
  public isModalOpen = false;
  public currentDayToEdit: TourDayManagerDTO | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.tourId = +idParam;
        this.loadInitialData();
      } else {
        console.error('Không tìm thấy ID tour trên URL');
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

  // --- Event Handlers ---
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

  handleSave(formData: TourDayManagerCreateRequestDTO): void {
    let saveObservable: Observable<any>;

    if (this.currentDayToEdit) {
      // --- Chế độ Sửa ---
      saveObservable = this.tourService.updateTourDay(
        this.tourId,
        this.currentDayToEdit.id,
        formData
      );
    } else {
      // --- Chế độ Thêm mới ---
      saveObservable = this.tourService.addTourDay(this.tourId, formData);
    }

    saveObservable.subscribe({
      next: () => {
        alert(
          this.currentDayToEdit
            ? 'Cập nhật thành công!'
            : 'Thêm ngày mới thành công!'
        );
        this.closeModal();
        this.loadInitialData(); // Tải lại dữ liệu
      },
      error: (err) => {
        console.error('Lỗi khi lưu:', err);
        alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
      },
    });
  }

  handleDelete(day: TourDayManagerDTO): void {
    // Sử dụng `day.id` mà backend đã trả về
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa "Ngày ${day.dayNumber}: ${day.title}"?`
      )
    ) {
      this.tourService.deleteTourDay(this.tourId, day.id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadInitialData(); // Tải lại dữ liệu
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
          alert('Đã có lỗi xảy ra khi xóa.');
        },
      });
    }
  }
}
