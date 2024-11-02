import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecetteIngredientsModalComponent } from './recette-ingredients-modal.component';

describe('RecetteIngredientsModalComponent', () => {
  let component: RecetteIngredientsModalComponent;
  let fixture: ComponentFixture<RecetteIngredientsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecetteIngredientsModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecetteIngredientsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
