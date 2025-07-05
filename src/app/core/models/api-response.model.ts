// src/app/core/models/api-response.model.ts

/**
 * Định nghĩa cấu trúc chung cho mọi response từ API.
 * T là một kiểu dữ liệu chung (generic type), đại diện cho
 * kiểu dữ liệu của thuộc tính "data" (ví dụ: BlogPaginationData, User, Tour...)
 */
export interface ApiResponse<T> {
  status: number;
  code: number;
  message: string;
  data: T;
}