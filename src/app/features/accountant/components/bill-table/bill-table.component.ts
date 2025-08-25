import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { PaymentBillList } from '../../models/payment-bill-list.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { PaymentBillItemStatus } from '../../../../core/models/enums';


@Component({
  selector: 'app-bill-table',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzTagModule,
    FormatDatePipe,
    CurrencyVndPipe,
  ],
  templateUrl: './bill-table.component.html',
})
export class BillTableComponent {
  @Input() bills: PaymentBillList[] = [];
  @Output() markPaid = new EventEmitter<number>();

  PaymentBillItemStatus = PaymentBillItemStatus;

  onMarkPaid(billId: number): void {
    this.markPaid.emit(billId);
  }
}
