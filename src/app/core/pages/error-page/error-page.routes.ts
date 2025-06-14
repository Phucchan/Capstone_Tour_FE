import { Route } from "@angular/router";
import { NotFoundComponent } from "./not-found/not-found.component";
import { UnauthorizeComponent } from "./unauthorize/unauthorize.component";

export const ERROR_ROUTES: Route[] = [
  {
    path: '404-not-found',
    component: NotFoundComponent
  },
  {
    path: '403-unauthorized',
    component: UnauthorizeComponent
  },
];