export class Cell {
  hasMine = false;
  flagged = false;
  uncovered = false;
  exploded = false;
  row: number;
  col: number;
  numberOfMines?: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }
}
