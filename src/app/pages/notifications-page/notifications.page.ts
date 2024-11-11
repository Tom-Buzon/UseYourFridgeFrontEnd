import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  isLoggedIn = false;
  user: any;
  notifications: any;
  public notificationsObs$ = this.notificationsService.getData();
  public notificationsResults: any;
  private destroyRef = inject(DestroyRef);
  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private router: Router,
    private authService : AuthService,
    private notificationsService : NotificationsService,
    private tokenStorage: TokenStorageService,
    private route: ActivatedRoute
  ) {

    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.user = this.tokenStorage.getUser();
    }

  }



  ngOnInit(): void {

    this.notificationsObs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {

      this.notificationsResults = data;
    });
  }
  async signOut() {
    console.log("tok");
    this.authService.signOut();
    window.location.reload();
  }







}