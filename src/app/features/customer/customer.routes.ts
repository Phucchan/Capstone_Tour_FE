import { Route } from "@angular/router";
import { ChangePasswordComponent } from "./components/change-password/change-password.component";
import { CustomerProfileComponent } from "./components/customer-profile/customer-profile.component";
import { CustomerLayoutComponent } from "./components/Customer-layout/Customer-layout.component";
import { WishlistComponent } from "./components/wishlist/wishlist.component";
import { BookingHistoriesComponent } from "./components/booking-histories/booking-histories.component";
import { ListPlanComponent } from "./components/list-plan/list-plan.component";


export const CUSTOMER_ROUTES: Route[] = [

  {
    path: '',
    redirectTo: 'profile-info',
    pathMatch: 'full'
  },
  {
    path: 'profile-info',
    component: CustomerProfileComponent
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent
  },
  {
    path: 'wishlist',
    component: WishlistComponent
  },
  { path: 'booking-histories', 
    component: BookingHistoriesComponent 
  },

  
  {
    path: 'list-plan',
    component: ListPlanComponent
  },



];