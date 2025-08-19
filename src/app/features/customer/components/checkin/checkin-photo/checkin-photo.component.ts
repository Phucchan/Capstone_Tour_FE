// src/app/features/customer/pages/checkin/checkin-photos.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { CheckinService, CheckinPhoto } from '../../../services/checkin.service';
import { CurrentUserService } from '../../../../../core/services/user-storage/current-user.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-checkin-photos',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './checkin-photo.component.html',
})
export class CheckinPhotosComponent implements OnInit {
  userId!: number;
  bookingId!: number;

  photos: CheckinPhoto[] = [];
  isLoading = true;

  // upload UI
  uploading = false;
  progress = 0;

  // ====== NEW: selection cho xóa nhiều ====== // change
  selected = new Set<number>();           // id ảnh đã chọn
  selectAllChecked = false;               // trạng thái ô “chọn tất cả”

  // ====== NEW: lightbox viewer ====== // change
  viewerOpen = false;
  currentIndex = 0; // index trong mảng photos


  constructor(
    private route: ActivatedRoute,
    private checkinService: CheckinService,
    private currentUserService: CurrentUserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = this.currentUserService.getCurrentUser(); // giống Wishlist
    this.userId = user.id;
    this.bookingId = Number(this.route.snapshot.paramMap.get('bookingId'));
    this.fetch();
  }

  fetch(): void {
    this.isLoading = true;
    this.checkinService.getPhotos(this.userId, this.bookingId).subscribe({
      next: (res) => {
        this.photos = res.data ?? [];
        this.isLoading = false;
        this.selected.clear();
        this.selectAllChecked = false;
      },
      error: (err) => {
        console.error('load photos error', err);
        this.toastr.error('Không tải được ảnh check-in');
        this.isLoading = false;
      },
    });
  }

  onSelectFile(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toastr.warning('Vui lòng chọn file ảnh');
      return;
    }

    this.uploading = true;
    this.progress = 0;

    this.checkinService.uploadPhoto(this.userId, this.bookingId, file).subscribe({
      next: (e) => {
        const p = this.checkinService.extractProgress(e);
        if (p !== null) this.progress = p;

        // nhận body => đã xong
        // @ts-ignore
        if (e?.body) {
          this.toastr.success('Tải ảnh thành công');
          this.uploading = false;
          this.fetch(); // reload
          (ev.target as HTMLInputElement).value = '';
        }
      },
      error: (err) => {
        console.error('upload error', err);
        this.toastr.error('Tải ảnh thất bại');
        this.uploading = false;
      },
    });
  }

    // ====== Chọn / bỏ chọn 1 ảnh ====== // change
  toggleSelect(p: CheckinPhoto): void {
    if (this.selected.has(p.id)) this.selected.delete(p.id);
    else this.selected.add(p.id);
    this.syncSelectAll();
  }

  // ====== Chọn / bỏ chọn tất cả ====== // change
  toggleSelectAll(): void {
    this.selectAllChecked = !this.selectAllChecked;
    if (this.selectAllChecked) {
      this.photos.forEach(p => this.selected.add(p.id));
    } else {
      this.selected.clear();
    }
  }

   private syncSelectAll(): void { // change
    this.selectAllChecked = this.photos.length > 0 && this.selected.size === this.photos.length;
  }
    // ====== Xóa nhiều ====== // change
  removeSelected(): void {
    if (this.selected.size === 0) return;
    const ok = confirm(`Xóa ${this.selected.size} ảnh đã chọn?`);
    if (!ok) return;

    const ids = Array.from(this.selected);
    let okCount = 0, failCount = 0;

    // Thực hiện tuần tự để BE đơn giản (có thể đổi sang forkJoin nếu BE ok)
    const run = async () => {
      for (const id of ids) {
        await new Promise<void>((resolve) => {
          this.checkinService.deletePhoto(this.userId, id).subscribe({
            next: () => { okCount++; resolve(); },
            error: () => { failCount++; resolve(); },
          });
        });
      }
      if (okCount) this.toastr.success(`Đã xóa ${okCount} ảnh`);
      if (failCount) this.toastr.error(`Không xóa được ${failCount} ảnh`);
      this.fetch();
    };
    run();
  }



  remove(photo: CheckinPhoto): void {
    const ok = confirm('Xóa ảnh này?');
    if (!ok) return;
      const urlPreview =
    `${environment.apiUrl}/customer/${this.userId}/checkin/photos/${photo.id}`;
  console.log('[DELETE photo] →', urlPreview, {
    userId: this.userId, photoId: photo.id
  });

    this.checkinService.deletePhoto(this.userId, photo.id).subscribe({
      next: () => {
        this.toastr.success('Đã xóa ảnh');
        this.fetch();
      },
      error: () => this.toastr.error('Xóa ảnh thất bại'),
    });
  }

    // ====== Lightbox: mở ảnh ====== // change
  openViewer(index: number): void {
    this.currentIndex = index;
    this.viewerOpen = true;
  }

  // ====== Lightbox: đóng ====== // change
  closeViewer(): void {
    this.viewerOpen = false;
  }

  // ====== Lightbox: điều hướng ====== // change
  next(): void {
    if (this.photos.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
  }
  prev(): void {
    if (this.photos.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
  }

  // ====== Lightbox: phím tắt ====== // change
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.viewerOpen) return;
    if (e.key === 'Escape') this.closeViewer();
    else if (e.key === 'ArrowRight') this.next();
    else if (e.key === 'ArrowLeft') this.prev();
  }
}

