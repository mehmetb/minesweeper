import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Cell } from '../cell';

@Component({
  selector: 'app-gameboard',
  templateUrl: './gameboard.component.html',
  styleUrls: ['./gameboard.component.sass']
})
export class GameboardComponent implements OnInit {
  @Input() height = 16;
  @Input() width = 30;
  @Input() mines = 99;

  rows: Cell[][] = [];

  gameOver = false;
  mousedown = false;

  get smileyFace() {
    if (this.gameOver) {
      return '😡';
    }

    return this.mousedown ? '😮' : '🙂';
  }

  constructor() {
    this.resetGameBoard();
  }

  resetGameBoard() {
    this.rows = [];
    const totalCells = this.width * this.height;
    let totalMines = 0;

    for (let i = 0; i < this.height; ++i) {
      const row = [];

      for (let j = 0; j < this.width; ++j) {
        const hasMine = totalMines < this.mines && Math.random() < (1 / totalCells);
        const cell: Cell = {
          hasMine,
          flagged: false,
          uncovered: false,
        };
        row.push(cell);
      }

      this.rows.push(row);
    }
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
  }
}
