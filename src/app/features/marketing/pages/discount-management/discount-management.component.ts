// src/app/features/marketing/pages/discount-management/discount-management.component.ts

import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { NzTableModule } from 'ng-zorro-antd/table'; 
import { NzPaginationModule } from 'ng-zorro-antd/pagination'; 
import { NzFormModule } from 'ng-zorro-antd/form'; 
import { NzInputModule } from 'ng-zorro-antd/input'; 
import { NzSelectModule } from 'ng-zorro-antd/select'; 
import { NzButtonModule } from 'ng-zorro-antd/button'; 
import { NzCardModule } from 'ng-zorro-antd/card'; 
import { NzModalModule } from 'ng-zorro-antd/modal'; 
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'; 
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'; 
import { NzTagModule } from 'ng-zorro-antd/tag'; 
import { BehaviorSubject, switchMap } from 'rxjs'; 
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { DiscountService, DiscountUpsertPayload, ScheduleItem, TourDiscountListItem } from '../../services/discount.service';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'; 
import { NzAvatarModule } from 'ng-zorro-antd/avatar';           
import { DurationFormatPipe } from '../../../../shared/pipes/duration-format.pipe';
interface NzDisabledTimeObj {
  nzDisabledHours: () => number[];
  nzDisabledMinutes: (h: number) => number[];
  nzDisabledSeconds: (h: number, m: number) => number[];
}
@Component({
  selector: 'app-discount-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // UI
    NzTableModule,
    NzPaginationModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzCardModule,
    NzModalModule,
    NzDatePickerModule,
    NzInputNumberModule,
    NzTagModule,
    NzPageHeaderModule, 
    NzAvatarModule,
    DurationFormatPipe     
  ],
  templateUrl: './discount-management.component.html',
})

export class DiscountManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DiscountService);
  private msg = inject(NzMessageService);

  // ===== List state =====
  filterForm!: FormGroup;
  pageIndex = 1;
  pageSize = 10;
  totalRecords = 0;
  isLoading = false;
  tours: TourDiscountListItem[] = [];
  private search$ = new BehaviorSubject<void>(undefined);

  // ===== Lich theo tour (lazy cache) =====
  cachedSchedules = new Map<number, ScheduleItem[]>();         
  loadingScheduleIds = new Set<number>();                      

  // ===== Modal: Lịch trình tour =====
  scheduleModalVisible = false;                                
  scheduleModalTitle = 'Lịch trình tour';                      
  selectedTour: TourDiscountListItem | null = null;            
  schedulesOfSelected: ScheduleItem[] = [];                    
  scheduleLoading = false;                                     

  // ===== Modal: Tạo/Sửa discount =====
  isEditModalVisible = false;                                  
  editModalTitle = 'Thêm khuyến mãi';                          
  editingDiscountId: number | null = null;                     
  discountForm!: FormGroup;          
  
  statusViMap: Record<string, string> = {  //change
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã xuất bản',
  CANCELLED: 'Đã hủy',
}; //change

getStatusColor(status?: string): string { //change
  switch (status) {
    case 'PUBLISHED': return 'green';
    case 'DRAFT': return 'blue';
    case 'CANCELLED': return 'red';
    default: return 'default';
  }
} 
getStatusVi(status?: string): string {
  if (!status) return '-';
  return this.statusViMap[status] || status;
}//change


  // ===== Thêm dưới vùng field trong class =====

// ===== Helpers: chặn ngày & giờ quá khứ (hỗ trợ Date | Date[]) =====

// change: alias type nhỏ gọn cho object DisabledTime


// change: lấy Date từ Date | Date[]
private pickDate(current: Date | Date[] | null | undefined, prefer: 'first' | 'last' = 'first'): Date {
  if (current instanceof Date) return current;
  if (Array.isArray(current)) {
    return (prefer === 'last' ? (current[1] ?? current[0]) : (current[0] ?? new Date())) as Date;
  }
  return new Date();
}

// change: object rỗng cho nzDisabledTime
emptyDisabledTime: NzDisabledTimeObj = {
  nzDisabledHours: () => [],
  nzDisabledMinutes: (_h: number) => [],
  nzDisabledSeconds: (_h: number, _m: number) => [],
};

// change: cho startDate – disable ngày quá khứ
disablePastDate = (current: Date | Date[]): boolean => {
  const d = this.pickDate(current);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd < today;
};

// change: cho startDate – nếu là hôm nay thì khóa giờ/phút/giây quá khứ
disablePastTimeForStart = (current: Date | Date[]): NzDisabledTimeObj => {
  const d = this.pickDate(current);
  const now = new Date();
  if (d.toDateString() !== now.toDateString()) return this.emptyDisabledTime;

  return {
    nzDisabledHours: () => Array.from({ length: now.getHours() }, (_, i) => i),
    nzDisabledMinutes: (h: number) => (h === now.getHours()
      ? Array.from({ length: now.getMinutes() }, (_, i) => i) : []),
    nzDisabledSeconds: (h: number, m: number) =>
      (h === now.getHours() && m === now.getMinutes()
        ? Array.from({ length: now.getSeconds() }, (_, i) => i) : []),
  };
};

// change: cho endDate – không được trước start; nếu cùng ngày, khóa giờ/phút/giây nhỏ hơn start
disableEndDate = (current: Date | Date[]): boolean => {
  const d = this.pickDate(current);
  const start: Date | null = this.discountForm?.get('startDate')?.value;
  if (!start) return this.disablePastDate(d);
  const st = new Date(start); st.setHours(0,0,0,0);
  const dd = new Date(d);     dd.setHours(0,0,0,0);
  return dd < st || this.disablePastDate(d);
};

disablePastTimeForEnd = (current: Date | Date[]): NzDisabledTimeObj => {
  const d = this.pickDate(current, 'last');
  const start: Date | null = this.discountForm?.get('startDate')?.value;
  if (!start) return this.emptyDisabledTime;

  const st = new Date(start);
  if (d.toDateString() !== st.toDateString()) {
    // khác ngày -> chỉ cần rule "không quá khứ trong ngày hiện tại"
    return this.disablePastTimeForStart(d);
  }
  return {
    nzDisabledHours: () => Array.from({ length: st.getHours() }, (_, i) => i),
    nzDisabledMinutes: (h: number) => (h === st.getHours()
      ? Array.from({ length: st.getMinutes() }, (_, i) => i) : []),
    nzDisabledSeconds: (h: number, m: number) =>
      (h === st.getHours() && m === st.getMinutes()
        ? Array.from({ length: st.getSeconds() }, (_, i) => i) : []),
  };
};

  ngOnInit(): void {
    // Filter
    this.filterForm = this.fb.group({
      keyword: [''],
      hasDiscount: [null],
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.pageIndex = 1;
      this.search$.next();
    });

    // Form add/edit discount
    this.discountForm = this.fb.group({
      scheduleId: [null, Validators.required],
      discountPercent: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    });

    // Load list
    this.search$
      .pipe(
        switchMap(() => {
          this.isLoading = true;
          const { keyword, hasDiscount } = this.filterForm.value;
          return this.service.getDiscountTours({
            page: this.pageIndex - 1,
            size: this.pageSize,
            keyword,
            hasDiscount,
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.tours = res.data.items || [];
          this.totalRecords = res.data.total || 0;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.msg.error('Tải danh sách thất bại');
          console.error(err);
        }
      });

    this.search$.next();
  }

  // ===== Pagination =====
  onPageIndexChange(p: number) { this.pageIndex = p; this.search$.next(); }     
  onPageSizeChange(size: number) { this.pageSize = size; this.pageIndex = 1; this.search$.next(); } 

  // ===== Lazy load schedules cho từng tour (hiển thị pills trong bảng) =====
  loadSchedulesForRow(tour: TourDiscountListItem) {                             
    if (this.cachedSchedules.has(tour.id) || this.loadingScheduleIds.has(tour.id)) return;
    this.loadingScheduleIds.add(tour.id);
    this.service.getSchedules(tour.id).subscribe({
      next: (res) => {
        this.cachedSchedules.set(tour.id, res.data || []);
        this.loadingScheduleIds.delete(tour.id);
      },
      error: () => {
        this.msg.error('Không tải được lịch của tour');
        this.loadingScheduleIds.delete(tour.id);
      }
    });
  }

  getRowSchedules(tourId: number): ScheduleItem[] {                              
    return this.cachedSchedules.get(tourId) || [];
  }

  // ===== Modal “Lịch trình tour” =====
openScheduleModal(tour: TourDiscountListItem) {
  this.selectedTour = tour;
  this.scheduleModalVisible = true;
  this.scheduleLoading = true;

  this.service.getSchedules(tour.id).subscribe({
    next: (res) => {
      this.schedulesOfSelected = res.data || [];

      console.log('[schedulesOfSelected]', tour.id, this.schedulesOfSelected); 
      if (!this.schedulesOfSelected.length) {
        this.msg.info('Tour này chưa có lịch khởi hành hoặc dữ liệu rỗng.'); 
      }
      this.scheduleLoading = false;
    },
    error: (e) => {
      this.msg.error('Không tải được lịch của tour');
      console.error(e); 
      this.scheduleLoading = false;
    }
  });
}
  closeScheduleModal() { this.scheduleModalVisible = false; }                    

  // ===== Modal Add/Edit discount =====
  showCreate(schedule?: ScheduleItem) { // change
  this.isEditModalVisible = true;
  this.editModalTitle = 'Thêm khuyến mãi';
  this.editingDiscountId = null;

  const defaultScheduleId = schedule?.id ?? this.schedulesOfSelected[0]?.id ?? null;

  const now = new Date();                      // change
  const endDefault = new Date(now.getTime() + 24*60*60*1000); // +1 ngày  // change

  this.discountForm.reset({
    scheduleId: defaultScheduleId,
    discountPercent: schedule?.discountPercent ?? null,
    startDate: now,            // change
    endDate: endDefault,       // change
  });
}

showEdit(schedule: ScheduleItem) { // change
  if (!schedule.discountId) return;
  this.isEditModalVisible = true;
  this.editModalTitle = 'Sửa khuyến mãi';
  this.editingDiscountId = schedule.discountId;
  const now = new Date();                                         // change
  const endDefault = new Date(now.getTime() + 24*60*60*1000);     // change
  this.discountForm.reset({
    scheduleId: schedule.id,
    discountPercent: schedule.discountPercent ?? null,
    startDate: now,                                                // change
    endDate: endDefault,                                           // change
  });
}
 
  private toIsoDateOnly(d: Date): string {                                 
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.toISOString();
  }                                                                         

  cancelEditModal() {
    this.isEditModalVisible = false;
  }

  submitDiscount() {
  if (this.discountForm.invalid) {
    this.discountForm.markAllAsTouched();
    return;
  }
  const v = this.discountForm.value;

  const scheduleId = Number(v.scheduleId);
  const discountPercent = Number(v.discountPercent);
  const start: Date = v.startDate;
  const end: Date = v.endDate;

  if (!scheduleId) { this.msg.error('Vui lòng chọn lịch áp dụng'); return; }
  if (!start || !end) { this.msg.error('Vui lòng chọn đủ ngày'); return; }

  const now = new Date();
  if (start < now || end < now) {
    this.msg.error('Thời gian khuyến mãi không được ở quá khứ');
    return;
  }
  if (end < start) {
    this.msg.error('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
    return;
  }

  const payload: DiscountUpsertPayload = {                      // change
    scheduleId,
    discountPercent,
    startDate: new Date(start).toISOString(),                   // change
    endDate: new Date(end).toISOString(),                       // change
  };

  console.log('[discount payload]', payload);                   // change

  const obs = this.editingDiscountId
    ? this.service.updateDiscount(this.editingDiscountId, payload)
    : this.service.createDiscount(payload);

  obs.subscribe({
    next: (res) => {
      this.msg.success(this.editingDiscountId ? 'Cập nhật thành công' : 'Tạo khuyến mãi thành công');
      this.isEditModalVisible = false;
      if (this.selectedTour) {
        this.openScheduleModal(this.selectedTour);
        this.cachedSchedules.delete(this.selectedTour.id);
        this.loadSchedulesForRow(this.selectedTour);
      }
      this.search$.next();
    },
    error: (e) => {
      // change: hiện thông điệp chi tiết từ server để dễ xử lý
      const serverMsg = e?.error?.message || e?.message || 'Lưu khuyến mãi thất bại';
      this.msg.error(serverMsg);
      console.error('Save discount error', e, payload);
    },
  });
}

  deleteDiscount(schedule: ScheduleItem) {
    if (!schedule.discountId) return;
    if (!confirm('Bạn có chắc muốn xóa khuyến mãi lịch này?')) return;
    this.service.deleteDiscount(schedule.discountId).subscribe({
      next: () => {
        this.msg.success('Đã xóa khuyến mãi');
        if (this.selectedTour) {
          this.openScheduleModal(this.selectedTour);
          this.cachedSchedules.delete(this.selectedTour.id);
          this.loadSchedulesForRow(this.selectedTour);
        }
        this.search$.next();
      },
      error: () => this.msg.error('Xóa thất bại'),
    });
  }
}
