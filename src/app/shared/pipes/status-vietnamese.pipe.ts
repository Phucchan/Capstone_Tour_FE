import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusVietnamese',
  standalone: true,
})
export class StatusVietnamesePipe implements PipeTransform {
  // Bảng tra cứu các trạng thái và bản dịch tương ứng
  private readonly statusMap: { [key: string]: string } = {
    // BookingStatus
    PENDING: 'Đang chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
    CANCEL_REQUESTED: 'Yêu cầu hủy',
    REFUNDED: 'Đã hoàn tiền',

    // PaymentBillItemStatus
    PAID: 'Đã thanh toán',
    // 'UNPAID' trong enum có giá trị là 'PENDING', chúng ta sẽ ưu tiên nghĩa của booking
    UNPAID: 'Chưa thanh toán',

    // Trạng thái chung (Tour, User, Service...)
    ACTIVE: 'Đang hoạt động',
    INACTIVE: 'Ngưng hoạt động',

    // Trạng thái Phê duyệt
    APPROVED: 'Đã duyệt',
    REJECTED: 'Đã từ chối',

    // CostType
    FIXED: 'Chi phí cố định',
    PER_PERSON: 'Theo người',

    // PaymentMethod
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'Chuyển khoản',


    // PaymentType
    DEPOSIT: 'Đặt cọc',
    FINAL_PAYMENT: 'Thanh toán cuối',
    REFUND: 'Hoàn tiền',
    OTHER: 'Khác',
    RECEIPT: 'Phiếu thu',
    PAYMENT: 'Phiếu chi',
  };

  transform(value: string | undefined | null, context?: string): string {
    if (!value) {
      return '';
    }

    // Xử lý trường hợp đặc biệt: 'PENDING' có thể là 'Chưa thanh toán' hoặc 'Đang chờ xử lý'
    if (value.toUpperCase() === 'PENDING' && context === 'payment') {
      return this.statusMap['UNPAID'];
    }

    return this.statusMap[value.toUpperCase()] || value;
  }
}
