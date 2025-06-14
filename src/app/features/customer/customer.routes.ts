import { Route } from "@angular/router";
import { ProfileComponent } from "./components/profile/profile.component";


export const CUSTOMER_ROUTES: Route[] = [
  {
    path: 'profile',
    component: ProfileComponent
  },
];