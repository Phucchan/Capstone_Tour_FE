import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Admin',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Thống kê',
          route: '/ceo/dashboard',
        },
        {
          icon: 'assets/icons/heroicons/outline/cart.svg',
          label: 'Danh sách booking',
          route: '/admin/booking',
        },
        
      ],
    },
  ];
}
