/**
 * DTO (Data Transfer Object) cho đối tượng Location,
 * khớp với cấu trúc dữ liệu trả về từ backend.
 */
export interface LocationDTO {
  id: number;
  name: string;
  description: string;
  image: string;
  deleted: boolean;
  createdAt: string; // Kiểu string vì JSON không có kiểu DateTime
}

/**
 * DTO cho việc tạo hoặc cập nhật một Location.
 */
export interface LocationRequestDTO {
  name: string;
  description: string;
  image: string;
}

/**
 * Interface chung cho dữ liệu phân trang từ API.
 */
export interface PagingDTO<T> {
  page: number;
  size: number;
  total: number;
  items: T[];
}

/**
 * Interface chung cho mọi response từ API.
 */
export interface GeneralResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
