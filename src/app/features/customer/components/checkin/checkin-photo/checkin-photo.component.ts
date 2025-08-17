// src/app/features/customer/pages/checkin/checkin-photos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { CheckinService, CheckinPhoto } from '../../../services/checkin.service';
import { CurrentUserService } from '../../../../../core/services/user-storage/current-user.service';

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

  remove(photo: CheckinPhoto): void {
    const ok = confirm('Xóa ảnh này?');
    if (!ok) return;
    this.checkinService.deletePhoto(this.userId, photo.id).subscribe({
      next: () => {
        this.toastr.success('Đã xóa ảnh');
        this.fetch();
      },
      error: () => this.toastr.error('Xóa ảnh thất bại'),
    });
  }
}
