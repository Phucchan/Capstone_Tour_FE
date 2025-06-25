import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnDestroy, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { UserStorageService } from '../../../core/services/user-storage/user-storage.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SsrService } from '../../../core/services/ssr.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent  {
  
}