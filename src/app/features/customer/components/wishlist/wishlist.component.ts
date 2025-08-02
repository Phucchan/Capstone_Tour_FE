import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { IconTransportPipe } from '../../../../shared/pipes/icon-transport.pipe';
import { WishlistService } from '../../services/wishlist.service';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyVndPipe, IconTransportPipe],
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent implements OnInit {
  userId!: number;
  tours: any[] = [];
  isLoading = true;

  constructor(
    private wishlistService: WishlistService,
    private currentUserService: CurrentUserService
  ) { }

  ngOnInit(): void {
    const user = this.currentUserService.getCurrentUser();
    this.userId = user.id;
    this.fetchWishlist();
  }

  fetchWishlist(): void {
    this.isLoading = true;
    this.wishlistService.getWishlist(this.userId).subscribe({
      next: (res) => {
        this.tours = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  remove(wishlistId: number): void {
    if (!confirm('Bạn có chắc muốn xoá tour này khỏi yêu thích?')) return;
    console.log('→ Gửi xoá wishlist:', this.userId, wishlistId);
    this.wishlistService.removeFromWishlist(this.userId, wishlistId).subscribe({
      next: () => {
        this.tours = this.tours.filter(t => t.id !== wishlistId);
      },
      error: () => alert('Xoá thất bại!')
    });
  }
}
