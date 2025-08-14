// src/app/features/business/components/location-form/location-form.component.ts
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocationDTO } from '../../../../core/models/location.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { LocationService } from '../../services/location.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './location-form.component.html',
})
export class LocationFormComponent implements OnInit, OnChanges {
  @Input() locationToEdit: LocationDTO | null = null;
  @Output() formSaved = new EventEmitter<boolean>();
  @Output() formCancelled = new EventEmitter<void>();

  locationForm: FormGroup;
  isSubmitting = false;
  imagePreview: string | ArrayBuffer | null = null;
  private selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService
  ) {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      // Trường image không còn là control nữa, ta sẽ quản lý file riêng
    });
  }

  ngOnInit(): void {
    this.updateForm();
  }

  // Cập nhật form khi input locationToEdit thay đổi
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locationToEdit']) {
      this.updateForm();
    }
  }

  updateForm(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.locationToEdit) {
      this.locationForm.patchValue({
        name: this.locationToEdit.name,
        description: this.locationToEdit.description,
      });
      this.imagePreview = this.locationToEdit.image;
    } else {
      this.locationForm.reset();
    }
  }

  get f() {
    return this.locationForm.controls;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Kiểm tra kích thước file (ví dụ: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file quá lớn, vui lòng chọn file dưới 5MB.');
        input.value = ''; // Xóa file đã chọn
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }
    // Khi thêm mới, file là bắt buộc
    if (!this.locationToEdit && !this.selectedFile) {
      alert('Vui lòng chọn ảnh đại diện.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('name', this.f['name'].value);
    formData.append('description', this.f['description'].value);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    const apiCall = this.locationToEdit
      ? this.locationService.updateLocation(this.locationToEdit.id, formData)
      : this.locationService.createLocation(formData);

    apiCall.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.formSaved.emit(true);
      },
      error: (err) => {
        console.error('API error:', err);
        alert(`Lỗi: ${err.error?.message || 'Không thể lưu địa điểm.'}`);
        this.formSaved.emit(false);
      },
    });
  }

  cancel(): void {
    this.formCancelled.emit();
  }
}
