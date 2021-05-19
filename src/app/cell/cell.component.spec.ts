import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellComponent } from './cell.component';

describe('CellComponent', () => {
  let component: CellComponent;
  let fixture: ComponentFixture<CellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a cell', () => {
    const fixture = TestBed.createComponent(CellComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('div.cell')).toBeTruthy();
  });

  it('should not have a bomb by default', () => {
    const cellComponent = new CellComponent();
    expect(cellComponent.hasMine).toBeFalse();
  });
});
