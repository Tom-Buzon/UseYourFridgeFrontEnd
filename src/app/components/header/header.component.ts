import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {

  @Input() public title: string = "";
  @Input() public back: boolean = false;
  @Input() public menu: boolean = false;
  constructor(
    private router : Router,private translate: TranslateService) { }

  ngOnInit() {}

  goToFrigoList() {
    this.router.navigate(["tabs/frigo-list"]);

  }

  goBack() {   this.router.navigate(['tabs/tab3']); }
}
