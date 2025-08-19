import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StyleManagerService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Tải một file stylesheet bằng cách tạo thẻ <link> trong <head>
   * @param styleName Tên file CSS (ví dụ: 'ng-zorro-antd.min.css')
   */
  loadStyle(styleName: string) {
    const head = this.document.getElementsByTagName('head')[0];
    const style = this.document.getElementById(styleName) as HTMLLinkElement;

    if (style) {
      // Style đã được tải rồi
      return;
    }

    const newLink = this.document.createElement('link');
    newLink.id = styleName;
    newLink.rel = 'stylesheet';
    newLink.href = `${styleName}`; // Đường dẫn đến file CSS

    head.appendChild(newLink);
  }

  /**
   * Gỡ bỏ một file stylesheet khỏi <head>
   * @param styleName ID của thẻ <link> cần gỡ bỏ
   */
  removeStyle(styleName: string) {
    const style = this.document.getElementById(styleName);
    if (style) {
      style.remove();
    }
  }
}
