import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, forkJoin, map } from 'rxjs';

// --- [THÊM MỚI] Imports cho các module của NG-ZORRO ---
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';

// Models và Services cần thiết
import { LocationShort, ServiceTypeShort } from '../../../models/partner.model';
import { PartnerService } from '../../../services/partner.service';
import { ServiceTypeService } from '../../../services/service-type.service';
import { LocationService } from '../../../../business/services/location.service';
import { LocationDTO } from '../../../../../core/models/location.model';

@Component({
  selector: 'app-add-service-provider',
  standalone: true,
  // --- [CẬP NHẬT] Thêm các module của NG-ZORRO vào imports ---
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzSpinModule,
    NzAlertModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzGridModule,
  ],
  templateUrl: './add-service-provider.component.html',
})
export class AddServiceProviderComponent implements OnInit {
  partnerForm: FormGroup;
  locationOptions: LocationShort[] = [];
  serviceTypeOptions: ServiceTypeShort[] = [];

  isEditMode = false;
  partnerId: number | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage: string | null = null;
  pageTitle = 'Thêm mới Nhà cung cấp';

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService,
    private serviceTypeService: ServiceTypeService,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService // [THÊM MỚI] Inject NzMessageService
  ) {
    this.partnerForm = this.fb.group({
      name: ['', Validators.required],
      logoUrl: [''],
      contactPhone: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactName: [''],
      description: [''],
      websiteUrl: [''],
      locationId: [null, Validators.required],
      serviceTypeId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.partnerId = +id;
      this.pageTitle = 'Cập nhật Nhà cung cấp';
      this.loadPartnerForEdit();
    } else {
      this.isEditMode = false;
      this.pageTitle = 'Thêm mới Nhà cung cấp';
      this.loadDropdownData();
    }
  }

  loadPartnerForEdit(): void {
    if (!this.partnerId) return;
    this.isLoading = true;
    // [CẬP NHẬT] Tải đồng thời dữ liệu của partner và các dropdown
    forkJoin({
      partnerRes: this.partnerService.getPartnerDetail(this.partnerId),
      locations: this.loadLocationOptions(),
      serviceTypes: this.loadServiceTypeOptions(),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ partnerRes, locations, serviceTypes }) => {
          this.locationOptions = locations;
          this.serviceTypeOptions = serviceTypes;
          if (partnerRes.status === 200 && partnerRes.data) {
            const partnerData = partnerRes.data;
            this.partnerForm.patchValue({
              ...partnerData,
              locationId: partnerData.location?.id,
              serviceTypeId: partnerData.serviceType?.id,
            });
          } else {
            this.errorMessage = partnerRes.message;
          }
        },
        error: (err) => (this.errorMessage = err.message),
      });
  }

  loadDropdownData(): void {
    this.isLoading = true;
    forkJoin({
      locations: this.loadLocationOptions(),
      serviceTypes: this.loadServiceTypeOptions(),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ locations, serviceTypes }) => {
          this.locationOptions = locations;
          this.serviceTypeOptions = serviceTypes;
        },
        error: (err) => (this.errorMessage = err.message),
      });
  }

  // [TÁI CẤU TRÚC] Tách logic lấy location ra hàm riêng
  private loadLocationOptions() {
    return this.locationService.getLocations(0, 1000).pipe(
      map((response) => {
        if (response && response.data && Array.isArray(response.data.items)) {
          return response.data.items.map((loc: LocationDTO) => ({
            id: loc.id,
            name: loc.name,
          }));
        }
        return [];
      })
    );
  }

  // [TÁI CẤU TRÚC] Tách logic lấy service type ra hàm riêng
  private loadServiceTypeOptions() {
    return this.serviceTypeService.getServiceTypes().pipe(
      map((response) => {
        if (response.status === 200 && response.data) {
          return response.data.filter((st) => !st.deleted);
        }
        return [];
      })
    );
  }

  onSubmit(): void {
    // [CẬP NHẬT] Sử dụng for...in để duyệt và cập nhật trạng thái touched cho tất cả control
    if (this.partnerForm.invalid) {
      for (const i in this.partnerForm.controls) {
        if (this.partnerForm.controls.hasOwnProperty(i)) {
          this.partnerForm.controls[i].markAsDirty();
          this.partnerForm.controls[i].updateValueAndValidity();
        }
      }
      return;
    }
    if (this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = null; // Xóa lỗi cũ trước khi submit
    const requestData = this.partnerForm.value;

    const action$ = this.isEditMode
      ? this.partnerService.updatePartner(this.partnerId!, requestData)
      : this.partnerService.addPartner(requestData);

    action$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.message.success(
            this.isEditMode
              ? 'Cập nhật nhà cung cấp thành công!'
              : 'Thêm mới nhà cung cấp thành công!'
          );
          this.router.navigate(['/coordinator/service-providers']);
        } else {
          // [CẬP NHẬT] Hiển thị lỗi bằng NzMessageService hoặc nz-alert
          this.errorMessage = res.message;
          this.message.error(res.message || 'Đã có lỗi xảy ra.');
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.message.error(err.message || 'Đã có lỗi xảy ra.');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/coordinator/service-providers']);
  }
}
