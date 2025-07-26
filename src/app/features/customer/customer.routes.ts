import { Route } from "@angular/router";
import { HomepageComponent } from "../public/homepage/homepage.component";
import { ChangePasswordComponent } from "./components/change-password/change-password.component";
import { CustomerProfileComponent } from "./components/customer-profile/customer-profile.component";
import { CustomerLayoutComponent } from "./components/Customer-layout/Customer-layout.component";


export const CUSTOMER_ROUTES: Route[] = [
  {
    path: 'customer/profile',
    component: CustomerLayoutComponent, // chính là layout chứa sidebar và router-outlet
    children: [
      {
        path: '',
        redirectTo: 'profile',
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
      // các route khác nếu có
    ]
  }

];