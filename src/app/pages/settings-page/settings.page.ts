import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingstPage implements OnInit {

  isLoggedIn = false;
  user: any;


  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private router: Router,
    private authService : AuthService,
    private tokenStorage: TokenStorageService,
    private route: ActivatedRoute
  ) {

    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.user = this.tokenStorage.getUser();
    }

  }



  ngOnInit(): void {

  }
  async signOut() {
    console.log("tok");
    this.authService.signOut();
    window.location.reload();
  }







}