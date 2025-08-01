

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { IconTransportPipe } from '../../../shared/pipes/icon-transport.pipe';
import { ListTourService } from '../services/list-tour.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-list-tour-discount',
  standalone: true,
  templateUrl: './list-tour-discount.component.html',
  styleUrls: ['./list-tour-discount.component.css'],
  imports: [
    CommonModule, 
    RouterModule, 
    CurrencyVndPipe, 
    IconTransportPipe,
    PaginationComponent,
  ],
})
export class ListTourDiscountComponent implements OnInit {
  tours: any[] = [];
  total = 0;
  page = 0;
  size = 9;

  constructor(private http: HttpClient, private listTourService: ListTourService) { }

  ngOnInit(): void {
    this.listTourService.getDiscountTours().subscribe((res) => {
      console.log('>>> discount API result:', res);
      this.tours = res.data.items;
      this.loadDiscountTours();
    });
  }
  loadDiscountTours(): void {
  this.listTourService.getDiscountTours(this.page, this.size).subscribe((res) => {
    this.tours = res.data.items;
    this.total = res.data.total;
  });
}
onPageChange(newPage: number): void {
  this.page = newPage;
  this.loadDiscountTours();
}

  getDiscountedPrice(original: number, percent: number): number {
    return Math.floor(original * (1 - percent / 100));
  }
}
