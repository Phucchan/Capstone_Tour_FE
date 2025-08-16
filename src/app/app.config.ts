import {
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { importProvidersFrom } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';

// *** THAY ĐỔI 2: Đăng ký dữ liệu locale Tiếng Việt ***
registerLocaleData(vi);

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  (key) => antDesignIcons[key]
);


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideAngularSvgIcon(),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    }),

    provideNzI18n(vi_VN),
    provideNzIcons(icons),
    importProvidersFrom(NzModalModule),
  ],
};
