import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.sass']
})
export class CellComponent implements OnInit {
  @Input() hasMine = false;
  @Input() uncovered = false;
  @Input() flagged = false;

  constructor() { }

  ngOnInit(): void {
  }

}
