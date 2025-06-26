import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { UserStorageService } from './core/services/user-storage/user-storage.service';
import { SocketSerivce } from './core/services/socket/socket.service';
import { CurrentUserService } from './core/services/user-storage/current-user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Đi Đâu';

  constructor(
    private titleService: Title,
    @Inject(PLATFORM_ID) private platformId: Object,
    private socketService: SocketSerivce,
    private currentUserService: CurrentUserService
  ) {
    this.titleService.setTitle(this.title);
  }

  currentUser: any = {};
  isConnected = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();
    }

    this.currentUserService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.registerBeforeUnload();
        this.socketService.connect(user);

        this.socketService.getConnectionStatus().subscribe((status) => {
          console.log('Socket connected?', status);
          this.isConnected = status;
        });
      } 
    });
  }

  registerBeforeUnload() {
    window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
  }

  onBeforeUnload(event: BeforeUnloadEvent): void {
    this.socketService.disconnect(this.currentUser);
  }
}
