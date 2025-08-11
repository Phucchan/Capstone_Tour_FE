import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  map,
  catchError,
  debounceTime,
  switchMap,
  first,
} from 'rxjs/operators';
import { AdminService } from '../../../../src/app/features/admin/admin.service';

export class CustomValidators {
  /**
   * Validator kiểm tra định dạng số điện thoại Việt Nam.
   * Chấp nhận các số bắt đầu bằng 0, có 10 chữ số.
   */
  static vietnamesePhone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Không validate nếu không có giá trị
    }
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b$/;
    const valid = phoneRegex.test(control.value);
    return valid ? null : { invalidPhone: true };
  }

  /**
   * Validator không cho phép chọn ngày trong tương lai.
   */
  static noFutureDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    // Reset giờ, phút, giây để chỉ so sánh ngày
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate > today ? { futureDate: true } : null;
  }

  /**
   * Validator không cho phép chọn ngày giờ trong quá khứ.
   */
  static noPastDateTime(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const selectedDateTime = new Date(control.value).getTime();
    const now = new Date().getTime();

    return selectedDateTime < now ? { pastDateTime: true } : null;
  }

  /**
   * Validator kiểm tra mật khẩu mạnh.
   * Yêu cầu: Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt.
   */
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const valid = passwordRegex.test(control.value);
    return valid ? null : { strongPassword: true };
  }

  /**
   * Factory function để tạo một AsyncValidator kiểm tra username đã tồn tại.
   * @param adminService Service để gọi API
   * @returns AsyncValidatorFn
   */
  static createUsernameTakenValidator(
    adminService: AdminService
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(500), // Chờ 500ms sau khi người dùng ngừng gõ
        switchMap((value) => adminService.checkUniqueness('username', value)),
        map((response) => (response.isTaken ? { usernameTaken: true } : null)),
        catchError(() => of(null)), // Bỏ qua lỗi mạng, không block form
        first() // Chỉ lấy giá trị đầu tiên để hoàn thành
      );
    };
  }

  /**
   * Factory function để tạo một AsyncValidator kiểm tra email đã tồn tại.
   * @param adminService Service để gọi API
   * @returns AsyncValidatorFn
   */
  static createEmailTakenValidator(
    adminService: AdminService
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(500),
        switchMap((value) => adminService.checkUniqueness('email', value)),
        map((response) => (response.isTaken ? { emailTaken: true } : null)),
        catchError(() => of(null)),
        first()
      );
    };
  }
}
