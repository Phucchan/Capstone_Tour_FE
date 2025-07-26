export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
}

export interface MonthlyNewUser {
  year: number;
  month: number;
  userCount: number;
}

export interface TourRevenue {
  id: number;
  name: string;
  tourType: string;
  totalRevenue: number;
}
