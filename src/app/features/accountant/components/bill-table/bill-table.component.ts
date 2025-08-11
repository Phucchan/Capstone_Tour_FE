/*
----------------------------------------------------------------
-- File: src/app/features/accountant/components/bill-table/bill-table.component.ts
-- Ghi chú: Component hiển thị bảng danh sách các loại phiếu.
----------------------------------------------------------------
*/
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PaymentBillList } from '../../models/payment-bill-list.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-bill-table',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    FormatDatePipe,
    CurrencyVndPipe,
  ],
  templateUrl: './bill-table.component.html',
})
export class BillTableComponent {
  @Input() bills: PaymentBillList[] = [];
  @Output() markPaid = new EventEmitter<number>();

  onMarkPaid(billId: number): void {
    this.markPaid.emit(billId);
  }
}
