/*
  File: src/app/features/seller/models/request-booking-summary.model.ts (TẠO MỚI)
  Mô tả: Dùng để hiển thị danh sách các yêu cầu tour tùy chỉnh.
  Tương ứng với: RequestBookingSummaryDTO.java
*/
export interface RequestBookingSummary {
  id: number;
  tourTheme: string;
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  reason: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string; // ISO Date String
}
