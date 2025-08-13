import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

// *** THAY ĐỔI 1: Import các thành phần i18n ***
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n';

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
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';
import {
  DollarCircleOutline,
  ArrowLeftOutline,
  PlusCircleOutline,
  MinusCircleOutline,
  CheckSquareOutline,
  FileAddOutline,
  CheckCircleOutline,
  EyeOutline,
  SearchOutline,
} from '@ant-design/icons-angular/icons';

// *** THAY ĐỔI 2: Đăng ký dữ liệu locale Tiếng Việt ***
registerLocaleData(vi);

// Khai báo một mảng chứa tất cả các icon cần dùng
const icons = [
  DollarCircleOutline,
  ArrowLeftOutline,
  PlusCircleOutline,
  MinusCircleOutline,
  CheckSquareOutline,
  FileAddOutline,
  CheckCircleOutline,
  EyeOutline,
  SearchOutline,
];

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

    importProvidersFrom(NzIconModule.forRoot(icons)),
    { provide: NZ_ICONS, useValue: icons },

    // *** THAY ĐỔI 3: Cung cấp locale cho ng-zorro ***
    { provide: NZ_I18N, useValue: vi_VN },
  ],
};
