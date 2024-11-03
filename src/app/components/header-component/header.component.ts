import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {

  @Input() public title: string = "";
  @Input() public back: boolean = false;
  @Input() public menu: boolean = false;
  @Input() public menuTab1: boolean = false;
  constructor(
    private router : Router,private translate: TranslateService,
    private languageService: LanguageService) { }

  ngOnInit() {}

  goToFrigoList() {
    this.router.navigate(["tabs/frigo-list"]);

  }

  goToShoppingListDetails() {
    this.router.navigate(["tabs/shopping-list"]);

  }
  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.languageService.setPreferredLanguage(lang);
  }


  goBack() {   this.router.navigate(['tabs/tab3']); }
}
