import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedDigitsComponent } from './led-digits.component';

describe('LedDigitsComponent', () => {
  let component: LedDigitsComponent;
  let fixture: ComponentFixture<LedDigitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LedDigitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LedDigitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
