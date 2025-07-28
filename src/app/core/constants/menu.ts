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

  // === Nhóm Kinh doanh & Điều hành ===
  {
    group: 'Kinh doanh & Điều hành',
    separator: true,
    roles: [ALL_ROLES.BUSINESS_DEPARTMENT, ALL_ROLES.SERVICE_COORDINATOR],
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
        route: null, // Đây là mục cha, không có route
        roles: [ALL_ROLES.BUSINESS_DEPARTMENT, ALL_ROLES.SERVICE_COORDINATOR],
        children: [
          {
            label: 'Danh sách Tour',
            route: '/business/tour-list',
          },
          {
            label: 'Tạo Tour mới',
            route: '/business/tour-form',
          },
          {
            label: 'Quản lý Địa điểm',
            route: '/business/location-management',
          },
        ],
      },
      {
        icon: 'assets/icons/heroicons/outline/ticket.svg',
        label: 'Lịch khởi hành',
        route: '/business/tour-schedule',
        roles: [ALL_ROLES.BUSINESS_DEPARTMENT, ALL_ROLES.SERVICE_COORDINATOR],
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
        route: '/sales/bookings',
        roles: [ALL_ROLES.SELLER],
      },
      {
        icon: 'assets/icons/heroicons/outline/marketing-svgrepo-com.svg',
        label: 'Quản lý Blog',
        route: '/marketing/blogs',
        roles: [ALL_ROLES.MARKETING_MANAGER],
      },
      {
        icon: 'assets/icons/heroicons/outline/dollar-svgrepo-com.svg',
        label: 'Quản lý Khuyến mãi',
        route: '/marketing/promotions',
        roles: [ALL_ROLES.MARKETING_MANAGER],
      },
    ],
  },

  // === Nhóm Kế toán ===
  {
    group: 'Kế toán',
    separator: true,
    roles: [ALL_ROLES.ACCOUNTANT],
    items: [
      {
        icon: 'assets/icons/heroicons/outline/bill.svg',
        label: 'Báo cáo Doanh thu',
        route: '/accounting/reports',
        roles: [ALL_ROLES.ACCOUNTANT],
      },
    ],
  },
];
