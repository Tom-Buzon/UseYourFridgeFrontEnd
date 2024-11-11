import { Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie'; // Import the options.

@Component({
  selector: 'app-lottie',
  templateUrl: './lottie.component.html',
  styleUrls: ['./lottie.component.scss']
})
export class MyLottieComponent implements OnInit {
  
  @Input() public animation: string = "";

  // Set the path to the lottie file.
  options!: WritableSignal<AnimationOptions>;

  shown = signal(true);

  styles: Partial<CSSStyleDeclaration> = {
    margin: '0 auto',
    width: '50%'
  };

  constructor() {

   }

  ngOnInit(): void {
    this.options = signal({
      path: 'assets/animations/'+this.animation+'.json',
    });
  }

}