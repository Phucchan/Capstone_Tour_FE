import { Route } from "@angular/router";
import { ProfileComponent } from "./components/profile/profile.component";
import { HomepageComponent } from "../public/homepage/homepage.component";


export const CUSTOMER_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full',
  },
  {
    path: 'customer/profile',
    component: ProfileComponent
  },

];