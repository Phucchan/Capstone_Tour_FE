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


/**
 * @description Interface cho chi tiết một tour.
 * Khớp với `TourDetailManagerDTO.java`.
 */
export interface TourDetail {
    id: number;
    name: string;
    thumbnailUrl: string;
    tourThemeName: string; // Dùng để hiển thị
    tourThemeId?: number; // Cần backend trả về để điền vào form
    departLocationName: string; // Dùng để hiển thị
    departLocationId?: number; // Cần backend trả về để điền vào form
    destinationLocationId?: number; // Cần backend trả về để điền vào form
    durationDays: number;
    description: string;
    code?: string;
    tourType?: string;
    tourStatus?: string;
}

/**
 * @description Interface cho request tạo tour mới.
 * Khớp với `TourCreateManagerRequestDTO.java`.
 */
export interface CreateTourRequest {
  name: string;
  code: string;
  thumbnailUrl: string;
  description: string;
  departLocationId: number;
  destinationLocationIds: number[]; // Mảng các ID điểm đến
  tourThemeIds: number[]; // Mảng các ID chủ đề
  // tourType và tourStatus sẽ được backend tự xử lý
  // `durationDays` sẽ được backend tự tính, không cần gửi lên.
}

// /**
//  * @description Interface cho request cập nhật tour.
//  * Khớp với `TourUpdateManagerRequestDTO.java`.
//  */
// export interface UpdateTourRequest {
//   thumbnailUrl: string;
//   tourThemeId: number;
//   departLocationId: number;
//   destinationLocationId: number;
//   durationDays: number;
//   description: string;
// }
// Interface cho các lựa chọn trong dropdown
export interface TourOption {
  id: number;
  name: string;
}

// Interface cho dữ liệu trả về từ API /tours/options
export interface TourOptionsData {
  themes: TourOption[];
  departures: TourOption[];
  destinations: TourOption[];
}
