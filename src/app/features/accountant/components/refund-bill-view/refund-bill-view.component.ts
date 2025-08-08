/*
----------------------------------------------------------------
-- File: src/app/features/accountant/components/refund-bill-view/refund-bill-view.component.ts
-- Ghi chú: Component hiển thị phiếu chi đã tạo.
----------------------------------------------------------------
*/
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTableModule } from 'ng-zorro-antd/table';
import { RefundBill } from '../../models/refund-bill.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-refund-bill-view',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzTableModule,
    FormatDatePipe,
    CurrencyVndPipe,
  ],
  templateUrl: './refund-bill-view.component.html',
})
export class RefundBillViewComponent {
  @Input() refundBill!: RefundBill;
}
