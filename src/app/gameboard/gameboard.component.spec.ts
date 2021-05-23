import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameboardComponent } from './gameboard.component';

describe('GameboardComponent', () => {
  let component: GameboardComponent;
  let fixture: ComponentFixture<GameboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameboardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a default height', () => {
    const gameboard = new GameboardComponent();
    expect(gameboard.height).toBeDefined();
  });

  it('should have a default width', () => {
    const gameboard = new GameboardComponent();
    expect(gameboard.width).toBeDefined();
  });

  it('should have a default number of mines', () => {
    const gameboard = new GameboardComponent();
    expect(gameboard.mines).toBeDefined();
  });

  it('should render a gameboard', () => {
    const fixture = TestBed.createComponent(GameboardComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('div.gameboard')).toBeTruthy();
  });

  it('should render game cells', () => {
    const fixture = TestBed.createComponent(GameboardComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const component = fixture.componentInstance;
    const numberOfCells = component.width * component.height;
    expect(compiled.querySelectorAll('div.col').length).toBe(numberOfCells);
  });
});
