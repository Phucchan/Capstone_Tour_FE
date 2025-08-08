import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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
}
