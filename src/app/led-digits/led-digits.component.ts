import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-led-digits',
  templateUrl: './led-digits.component.html',
  styleUrls: ['./led-digits.component.sass'],
})
export class LedDigitsComponent implements OnInit {
  @Input() value = 0;

  onesDigit = 0;
  tensDigit = 0;
  hundredsDigit = 0;

  constructor() {}

  ngOnInit(): void {}

  clampNumber(number: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, number));
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('value' in changes) {
      const value = this.clampNumber(changes.value.currentValue, 0, 999);
      [this.hundredsDigit, this.tensDigit, this.onesDigit] = String(value)
        .padStart(3, '0')
        .split('')
        .map(Number);
    }
  }
}
