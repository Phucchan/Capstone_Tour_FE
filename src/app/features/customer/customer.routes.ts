import { Route } from "@angular/router";
import { ChangePasswordComponent } from "./components/change-password/change-password.component";
import { CustomerProfileComponent } from "./components/customer-profile/customer-profile.component";
import { CustomerLayoutComponent } from "./components/Customer-layout/Customer-layout.component";


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



];