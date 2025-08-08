import { MenuItem } from '../models/menu.model';

// Danh sách tất cả các role trong hệ thống.
// Lấy từ file RoleName.java để đảm bảo tính nhất quán.
const ALL_ROLES = {
  ADMIN: 'ADMIN',
  MARKETING_MANAGER: 'MARKETING_MANAGER',
  SELLER: 'SELLER',
  BUSINESS_DEPARTMENT: 'BUSINESS_DEPARTMENT',
  SERVICE_COORDINATOR: 'SERVICE_COORDINATOR',
  ACCOUNTANT: 'ACCOUNTANT',
};

export const MENU_ITEMS: MenuItem[] = [
  // === Nhóm Quản trị Hệ thống ===
  {
    group: 'Quản trị hệ thống',
    separator: true,
    roles: [ALL_ROLES.ADMIN], // Chỉ ADMIN thấy nhóm này
    items: [
      {
        icon: 'assets/icons/heroicons/outline/users.svg',
        label: 'Quản lý người dùng',
        route: '/admin/user-management',
        roles: [ALL_ROLES.ADMIN],
      },
      {
        icon: 'assets/icons/heroicons/outline/cog.svg',
        label: 'Cấu hình hệ thống',
        route: '/admin/settings',
        roles: [ALL_ROLES.ADMIN],
      },
    ],
  },

  // === Nhóm Kinh doanh ===
  {
    group: 'Kinh doanh', // Đổi tên nhóm cho gọn hơn
    separator: true,
    roles: [ALL_ROLES.BUSINESS_DEPARTMENT], // Chỉ còn vai trò Business
    items: [
      {
        icon: 'assets/icons/heroicons/outline/chart-pie.svg',
        label: 'Dashboard Kinh doanh',
        route: '/business/dashboard',
        roles: [ALL_ROLES.BUSINESS_DEPARTMENT],
      },
      {
        icon: 'assets/icons/heroicons/outline/travel-bag-svgrepo-com.svg',
        label: 'Quản lý Tour',
        route: '/business/tours', // Đưa route trực tiếp, không cần menu con
        roles: [ALL_ROLES.BUSINESS_DEPARTMENT],
      },
    ],
  },

  // === NHÓM cho Coordinator ===
  {
    group: 'Điều phối Dịch vụ',
    separator: true,
    roles: [ALL_ROLES.SERVICE_COORDINATOR], // Chỉ SERVICE_COORDINATOR thấy nhóm này
    items: [
      {
        icon: 'assets/icons/heroicons/outline/users.svg', // Icon có thể thay đổi
        label: 'Quản lý Đối tác',
        route: '/coordinator/service-providers',
        roles: [ALL_ROLES.SERVICE_COORDINATOR],
      },
      {
        icon: 'assets/icons/heroicons/outline/category-svgrepo-com.svg', // Icon mới
        label: 'Quản lý Loại Dịch vụ',
        route: '/coordinator/service-types', // Link đến trang mới tạo
        roles: [ALL_ROLES.SERVICE_COORDINATOR],
      },
      {
        icon: 'assets/icons/heroicons/outline/location-pin-svgrepo-com.svg',
        label: 'Quản lý Địa điểm',
        route: '/business/locations', // Vẫn dùng route cũ nhưng gom về đây cho Coordinator
        roles: [ALL_ROLES.SERVICE_COORDINATOR],
      },
    ],
  },

  // === Nhóm Bán hàng & Marketing ===
  {
    group: 'Bán hàng & Marketing',
    separator: true,
    roles: [ALL_ROLES.SELLER, ALL_ROLES.MARKETING_MANAGER],
    items: [
      {
        icon: 'assets/icons/heroicons/outline/cart.svg',
        label: 'Quản lý Booking',
        route: '/seller/dashboard',
        roles: [ALL_ROLES.SELLER],
      },
    ],
  },

  // === Nhóm Kế toán ===
  {
    group: 'Kế toán',
    roles: [ALL_ROLES.ACCOUNTANT],
    items: [
      {
        icon: 'assets/icons/heroicons/outline/dollar-svgrepo.svg',
        label: 'Yêu cầu hoàn tiền',
        route: '/accountant/refunds',
        roles: [ALL_ROLES.ACCOUNTANT],
      },
    ],
  },
];
