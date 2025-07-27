import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TourPaxFullDTO } from '../../../../core/models/tour.model';

@Component({
  selector: 'app-pax-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pax-form.component.html',
})
export class PaxFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() isVisible = false;
  @Input() paxData: TourPaxFullDTO | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  public paxForm: FormGroup;
  public formTitle = 'Thêm Khoảng khách';

  constructor() {
    this.paxForm = this.fb.group({
      minQuantity: [1, [Validators.required, Validators.min(1)]],
      maxQuantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paxData'] && this.paxData) {
      this.formTitle = 'Sửa Khoảng khách';
      this.paxForm.patchValue(this.paxData);
    } else {
      this.formTitle = 'Thêm Khoảng khách';
      this.paxForm.reset({ minQuantity: 1, maxQuantity: 1 });
    }
  }

  onSave(): void {
    if (this.paxForm.invalid) {
      this.paxForm.markAllAsTouched();
      return;
    }
    if (this.paxForm.value.minQuantity > this.paxForm.value.maxQuantity) {
      alert('Số khách tối thiểu không được lớn hơn số khách tối đa.');
      return;
    }
    this.save.emit(this.paxForm.value);
  }

  onClose(): void {
    this.close.emit();
  }
}
