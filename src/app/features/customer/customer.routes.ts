import { Route } from "@angular/router";
import { ProfileComponent } from "./components/profile/profile.component";
import { HomepageComponent } from "../public/homepage/homepage.component";
import { ChangePasswordComponent } from "./components/change-password/change-password.component";
import { CustomerProfileComponent } from "./components/customer-profile/customer-profile.component";


export const CUSTOMER_ROUTES: Route[] = [
  {
    path: '',
    component: ProfileComponent, // chính là layout chứa sidebar và router-outlet
    children: [
      { path: 
        '', redirectTo: 'profile',
         pathMatch: 'full' 
        },
      { path: 'customer/profile-info', 
        component: CustomerProfileComponent 
      },
      { path: 'change-password', 
        component: ChangePasswordComponent 
      },
      // các route khác nếu có
    ]
  }

];