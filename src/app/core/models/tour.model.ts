// Interface cho một tour trong danh sách
export interface TourListItem {
  id: number;
  name: string;
  thumbnailImage: string;
  typeName: string;
  tourStatus: string;
  durationDays: number;
}

// Interface cho đối tượng phân trang từ backend
export interface PagingDTO<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  // Backend không trả về totalPages, ta có thể tự tính nếu cần
}
// Các interface cho Tạo/Sửa/Chi tiết sẽ được thêm sau
