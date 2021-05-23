export interface Cell {
  hasMine: boolean;
  flagged: boolean;
  uncovered: boolean;
  exploded: boolean;
  row: number;
  col: number;
  numberOfMines?: number;
}
