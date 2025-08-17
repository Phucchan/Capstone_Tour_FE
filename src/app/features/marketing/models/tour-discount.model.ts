// src/app/features/marketing/models/tour-discount.model.ts

// Tương ứng với TourDiscountSummaryDTO từ BE để hiển thị trong bảng
export interface TourDiscountSummary {
  id: number;
  scheduleId: number;
  tourName: string;
  discountPercent: number;
  startDate: string; // Sử dụng string để dễ dàng xử lý, có thể chuyển thành Date nếu cần
  endDate: string;
}

// Tương ứng với TourDiscountRequestDTO từ BE để gửi đi khi tạo mới
export interface TourDiscountRequest {
  scheduleId: number;
  discountPercent: number;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
}

// Model cho TourSchedule để hiển thị trong ô select tìm kiếm
export interface TourScheduleSelectItem {
  id: number;
  tourName: string;
  departureDate: string;
}
