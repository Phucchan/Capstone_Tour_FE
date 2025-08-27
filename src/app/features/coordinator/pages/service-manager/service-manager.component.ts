// Vị trí: src/app/features/marketing/pages/service-manager/service-manager.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormsModule } from '@angular/forms';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CoordinatorServiceApi, ServiceItem, ServiceCreateRequest } from '../../services/service-manager.service';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';           // change
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';          // change
import { NzIconModule } from 'ng-zorro-antd/icon';    

@Component({
  selector: 'app-service-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzTagModule,
    NzAvatarModule,
    NzButtonModule,
    NzDropDownModule,
    NzMenuModule,
    NzModalModule,
    NzInputModule,  // change
    NzFormModule,   // change
    NzSelectModule,
    NzBreadCrumbModule,   // change
    NzPageHeaderModule,   // change
    NzIconModule, // change
  ],
  host: { 'ngSkipHydration': '' },
  templateUrl: './service-manager.component.html'
})
export class ServiceManagerComponent implements OnInit {
  private api = inject(CoordinatorServiceApi); // change
  private modalSrv  = inject(NzModalService);
  private msg = inject(NzMessageService);
  private fb = inject(FormBuilder);

  // Query state
  query = { page: 0, size: 10, keyword: '' }; // change

  // Table state
  items: ServiceItem[] = [];
  total = 0;
  loading = false;

  // Modal/Form state
  form!: FormGroup;
  ui = { visible: false, mode: 'create' as 'create' | 'edit', saving: false, currentId: 0 };

  ngOnInit(): void {
    this.buildForm();
    this.reload(); // change
  }

  buildForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      serviceTypeId: [null, Validators.required],
      partnerId: [null, Validators.required],
      imageUrl: [''],
      description: [''],
      nettPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      costType: ['FIXED', Validators.required]
    });
  }

  // Helpers hiển thị trạng thái
  statusVi(status?: string) { // change
    switch ((status || '').toUpperCase()) {
      case 'ACTIVE': return 'Kích hoạt';
      case 'DEACTIVE': return 'Ngưng';
      case 'PENDING': return 'Chờ duyệt';
      default: return status || '-';
    }
  }
  statusColor(status?: string) { // change
    switch ((status || '').toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'DEACTIVE': return 'red';
      case 'PENDING': return 'gold';
      default: return 'default';
    }
  }

  // Paging
  onPageIndexChange(i: number) { this.query.page = i - 1; this.reload(); } // change
  onPageSizeChange(s: number) { this.query.size = s; this.query.page = 0; this.reload(); } // change

  // Actions
  reload() {
    this.loading = true;
    this.api.search(this.query.page, this.query.size, this.query.keyword)
      .subscribe({
        next: (res) => {
          this.items = res.items;
          this.total = res.total;
        },
        error: () => this.msg.error('Không tải được danh sách'),
        complete: () => this.loading = false
      });
  }

  reset() { this.query = { page: 0, size: 10, keyword: '' }; this.reload(); } // change

  openCreate() { // change
  if (!this.form) this.buildForm(); // change
  this.form.reset({ costType: 'FIXED', nettPrice: 0, sellingPrice: 0 });
  this.ui = { visible: true, mode: 'create', saving: false, currentId: 0 }; // change: set visible sau khi patch
}

openEdit(id: number) { // change
  if (!this.form) this.buildForm(); // change
  this.form.reset();
  this.api.getById(id).subscribe({
    next: (d) => {
      this.form.patchValue({
        name: d.name,
        serviceTypeId: d.serviceTypeId,
        partnerId: d.partnerId,
        imageUrl: d.imageUrl,
        description: d.description,
        nettPrice: d.nettPrice,
        sellingPrice: d.sellingPrice,
        costType: d.costType || 'FIXED'
      });
      this.ui = { visible: true, mode: 'edit', saving: false, currentId: id }; // change: mở modal sau khi patch
    },
    error: () => this.msg.error('Không tải được chi tiết')
  });
}

  closeModal() { this.ui.visible = false; } // change

  submitForm() { // change
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload = this.form.value as ServiceCreateRequest;
    this.ui.saving = true;

    const obs = this.ui.mode === 'create'
      ? this.api.create(payload)
      : this.api.update(this.ui.currentId, payload);

    obs.subscribe({
      next: () => {
        this.msg.success(this.ui.mode === 'create' ? 'Đã tạo dịch vụ' : 'Đã cập nhật');
        this.ui.visible = false;
        this.reload();
      },
      error: () => this.msg.error('Lưu không thành công'),
      complete: () => this.ui.saving = false
    });
  }

  updateStatus(id: number, status: 'PENDING' | 'ACTIVE' | 'DEACTIVE') { // change
    this.api.updateStatus(id, status).subscribe({
      next: () => { this.msg.success('Đã cập nhật trạng thái'); this.reload(); },
      error: () => this.msg.error('Không cập nhật được trạng thái')
    });
  }

  confirmDelete(id: number) { // change
    this.modalSrv.confirm({
      nzTitle: 'Xoá dịch vụ?',
      nzContent: 'Thao tác này không thể hoàn tác.',
      nzOkDanger: true,
      nzOnOk: () => new Promise<void>((resolve) => {
        this.api.delete(id).subscribe({
          next: () => { this.msg.success('Đã xoá'); this.reload(); resolve(); },
          error: () => { this.msg.error('Xoá không thành công'); resolve(); }
        });
      })
    });
  }
}
