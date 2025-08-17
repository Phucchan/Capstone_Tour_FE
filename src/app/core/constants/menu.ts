import { MenuItem } from '../models/menu.model';

/**
 * Định nghĩa hằng số cho tất cả các vai trò trong hệ thống.
 */
const ROLES = {
  ADMIN: 'ADMIN',
  MARKETING_MANAGER: 'MARKETING_MANAGER',
  SELLER: 'SELLER',
  BUSINESS_DEPARTMENT: 'BUSINESS_DEPARTMENT',
  SERVICE_COORDINATOR: 'SERVICE_COORDINATOR',
  ACCOUNTANT: 'ACCOUNTANT',
};

/**
 * MENU_ITEMS - Phiên bản đã được đối chiếu chính xác với các file routes.
 * Mỗi 'route' dưới đây đều tồn tại trong dự án của bạn.
 */
export const MENU_ITEMS: MenuItem[] = [
  // ============================================
  // === 1. Nhóm Quản trị Hệ thống (ADMIN) ===
  // ============================================
  {
    group: 'Quản trị Hệ thống',
    separator: true,
    roles: [ROLES.ADMIN],
    items: [
      // Route được sửa lại từ 'user-management' thành các route thực tế
      {
        icon: 'assets/icons/heroicons/outline/users.svg',
        label: 'Danh sách khách hàng',
        route: '/admin/list-customer', // <-- Đã sửa
        roles: [ROLES.ADMIN],
      },
      {
        icon: 'assets/icons/heroicons/outline/users.svg',
        label: 'Danh sách nhân viên',
        route: '/admin/list-staff', // <-- Đã sửa
        roles: [ROLES.ADMIN],
      },
    ],
  },

  // ============================================
  // === 2. Nhóm Quản lý Kinh doanh (BUSINESS) ===
  // ============================================
  {
    group: 'Quản lý Kinh doanh',
    separator: true,
    roles: [ROLES.BUSINESS_DEPARTMENT],
    items: [
      {
        icon: 'assets/icons/heroicons/outline/chart-pie.svg',
        label: 'Dashboard',
        route: '/business/dashboard', // Chính xác
        roles: [ROLES.BUSINESS_DEPARTMENT],
      },
      {
        icon: 'assets/icons/heroicons/outline/travel-bag-svgrepo-com.svg',
        label: 'Quản lý Tour',
        route: '/business/tours', // Chính xác
        roles: [ROLES.BUSINESS_DEPARTMENT],
      },
      {
        icon: 'assets/icons/heroicons/outline/request-quote-svgrepo-com.svg',
        label: 'Yêu cầu tạo Tour',
        route: '/business/request-bookings', // Khớp với routing
        roles: [ROLES.BUSINESS_DEPARTMENT],
      },
      {
        icon: 'assets/icons/heroicons/outline/location-pin-svgrepo-com.svg',
        label: 'Quản lý Địa điểm',
        route: '/business/locations', // Route này dùng chung với business, đã chính xác
        roles: [ROLES.SERVICE_COORDINATOR],
      },
    ],
  },

  // ============================================
  // === 3. Nhóm Điều phối Dịch vụ (COORDINATOR) ===
  // ============================================
  {
    group: 'Điều phối Dịch vụ',
    separator: true,
    roles: [ROLES.SERVICE_COORDINATOR],
    items: [
      {
        icon: 'assets/icons/heroicons/outline/users.svg',
        label: 'Quản lý Đối tác',
        route: '/coordinator/service-providers', // Chính xác
        roles: [ROLES.SERVICE_COORDINATOR],
      },
      {
        icon: 'assets/icons/heroicons/outline/category-svgrepo-com.svg',
        label: 'Quản lý Loại Dịch vụ',
        route: '/coordinator/service-types', // Chính xác
        roles: [ROLES.SERVICE_COORDINATOR],
      },
      {
        icon: 'assets/icons/heroicons/outline/ticket.svg', // Có thể chọn icon khác phù hợp hơn
        label: 'Phê duyệt Dịch vụ',
        route: '/coordinator/service-approval', // Trỏ đến route mới
        roles: [ROLES.SERVICE_COORDINATOR],
      },
    ],
  },

  // ============================================
  // === 4. Nhóm Bán hàng (SELLER) ===
  // ============================================
  {
    group: 'Quản lý Bán hàng',
    separator: true,
    roles: [ROLES.SELLER],
    items: [
      {
        icon: 'assets/icons/heroicons/outline/cart.svg',
        label: 'Quản lý Booking',
        route: '/seller/dashboard', // Chính xác
        roles: [ROLES.SELLER],
      },

      {
        icon: 'assets/icons/heroicons/outline/request-quote-svgrepo-com.svg',
        label: 'Yêu cầu đặt tour',
        route: '/seller/requests',
        roles: [ROLES.SELLER],
      },
    ],
  },

  // ============================================
  // === 5. Nhóm Marketing ===
  // ============================================
  {
    group: 'Quản lý Marketing',
    separator: true,
    roles: [ROLES.MARKETING_MANAGER],
    items: [
      {
        icon: 'assets/icons/heroicons/outline/marketing-svgrepo-com.svg',
        label: 'Quản lý Bài viết',
        route: '/marketing',
        roles: [ROLES.MARKETING_MANAGER],
      },
      {
        icon: 'assets/icons/heroicons/outline/ticket.svg',
        label: 'Quản lý Khuyến mãi',
        route: '/marketing/discounts',
        roles: [ROLES.MARKETING_MANAGER],
      },
    ],
  },

  // ============================================
  // === 6. Nhóm Kế toán (ACCOUNTANT) ===
  // ============================================
  {
    group: 'Quản lý Kế toán',
    separator: true,
    roles: [ROLES.ACCOUNTANT],
    items: [
      {
        icon: 'assets/icons/heroicons/outline/dollar-svgrepo-com.svg',
        label: 'Quyết toán Booking',
        route: '/accountant/bookings',
        roles: [ROLES.ACCOUNTANT],
      },
      {
        icon: 'assets/icons/heroicons/outline/refund-2-svgrepo-com.svg',
        label: 'Yêu cầu hoàn tiền',
        route: '/accountant/refunds', // Chính xác
        roles: [ROLES.ACCOUNTANT],
      },
    ],
  },
];
