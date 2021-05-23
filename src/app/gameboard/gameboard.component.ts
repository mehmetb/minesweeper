import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Cell } from '../cell';
import { MathHelper } from '../math-helper';

@Component({
  selector: 'app-gameboard',
  templateUrl: './gameboard.component.html',
  styleUrls: ['./gameboard.component.sass'],
})
export class GameboardComponent implements OnInit {
  @Input() height = 16;
  @Input() width = 30;
  @Input() mines = 99;

  grid: Cell[][] = [];

  gameLost = false;
  gameWon = false;
  mousedown = false;

  startTime: Date | null = null;
  elapsedTime = 0;
  hiddenMines = 0;

  get gameOver() {
    return this.gameLost || this.gameWon;
  }

  get smileyFace() {
    if (this.gameLost) {
      return '😡';
    }

    if (this.gameWon) {
      return '😎';
    }

    return this.mousedown ? '😮' : '🙂';
  }

  constructor() {
    this.restartGame();
    this.timeLoop();
  }

  *getGridCells() {
    for (const row of this.grid) {
      for (const cell of row) {
        yield cell;
      }
    }
  }

  restartGame() {
    const totalCells = this.width * this.height;
    const maxMines = this.mines;

    if (totalCells < maxMines) {
      throw new Error(
        'Invalid gameboard parameters: There are more mines than cells.'
      );
    }

    // reset state
    this.startTime = null;
    this.elapsedTime = 0;
    this.gameLost = false;
    this.gameWon = false;
    this.hiddenMines = this.mines;
    this.grid = [];

    for (let i = 0; i < this.height; ++i) {
      const row = [];

      for (let j = 0; j < this.width; ++j) {
        const cell: Cell = {
          hasMine: false,
          flagged: false,
          uncovered: false,
          exploded: false,
          row: i,
          col: j,
        };
        row.push(cell);
      }

      this.grid.push(row);
    }
  }

  getCurrentNumberOfMines(): number {
    return this.grid.reduce((totalMines, row) => {
      return (
        totalMines +
        row.reduce((rowMines, cell) => {
          return cell.hasMine ? rowMines + 1 : rowMines;
        }, 0)
      );
    }, 0);
  }

  plantMines(clickedCell: Cell) {
    const maxMines = this.mines;
    let currentMines = this.getCurrentNumberOfMines();

    if (currentMines === maxMines) {
      return;
    }

    const adjacentCells = this.getAdjacentCells(clickedCell);

    while (currentMines !== maxMines) {
      const row = Math.floor(Math.random() * this.height);
      const col = Math.floor(Math.random() * this.width);
      const cell = this.grid[row][col];
      if (cell !== clickedCell && !adjacentCells.includes(cell) && !cell.hasMine) {
        cell.hasMine = true;
        currentMines += 1;
      }
    }

    // calculate the number of mines in adjacent cells
    for (const cell of this.getGridCells()) {
      cell.numberOfMines = this.getAdjacentCells(cell)
        .reduce((totalMines, adjacentCell) => {
          return adjacentCell.hasMine ? totalMines + 1 : totalMines;
        }, 0);
    }
  }

  ngOnInit(): void {}

  ngOnChanges() {
    this.restartGame();
  }

  onMouseDown(event: MouseEvent, cell: Cell) {
    if (this.gameOver) {
      return;
    }

    const isRightClick = event.button === 2;
    if (isRightClick) {
      cell.flagged = !cell.flagged;

      if (cell.flagged) {
        this.hiddenMines -= 1;
      } else {
        this.hiddenMines += 1;
      }

      this.checkIfGameIsWon();
      return;
    }

    this.mousedown = true;
  }

  onMouseUp() {
    if (this.gameOver) {
      return;
    }

    this.mousedown = false;
  }

  onClickCell(cell: Cell) {
    if (this.gameOver) {
      return;
    }

    this.plantMines(cell);

    if (this.startTime === null) {
      this.startTime = new Date();
    }

    if (cell.flagged) {
      return;
    }

    if (cell.hasMine) {
      cell.exploded = true;
      this.gameLost = true;
      return;
    }

    this.uncoverCell(cell);
  }

  timeLoop() {
    if (this.startTime instanceof Date && !this.gameOver) {
      const now = new Date();
      this.elapsedTime = Math.floor(
        (now.valueOf() - this.startTime.valueOf()) / 1000
      );
    }

    window.requestAnimationFrame(() => this.timeLoop());
  }

  getAdjacentCells(cell: Cell): Cell[] {
    // we need a set due to clamping
    const adjacentCells: Set<Cell> = new Set();

    for (let i = -1; i <= 1; ++i) {
      for (let j = -1; j <= 1; ++j) {
        if (i === 0 && j === 0) {
          // skip self
          continue;
        }

        const adjacentCellRow = MathHelper.clamp(cell.row + i, 0, this.height - 1);
        const adjacentCellCol = MathHelper.clamp(cell.col + j, 0, this.width - 1);
        const adjacentCell = this.grid[adjacentCellRow][adjacentCellCol];
        adjacentCells.add(adjacentCell);
      }
    }

    return Array.from(adjacentCells);
  }

  getAdjacentCellsWithNoMines(cell: Cell): Cell[] {
    const allSafeCells: Set<Cell> = new Set();

    const recursedCells: Set<Cell> = new Set();
    const recurser = (cellToRecurse: Cell) => {
      if (recursedCells.has(cellToRecurse)) {
        return;
      }

      recursedCells.add(cellToRecurse);

      this.getAdjacentCells(cellToRecurse)
        .forEach((adjacentCell) => {
          if (!adjacentCell.uncovered) {
            allSafeCells.add(adjacentCell);

            if (adjacentCell.numberOfMines === 0) {
              recurser(adjacentCell);
            }
          }
        });
    };

    recurser(cell);
    return Array.from(allSafeCells);
  }

  uncoverCell(cell: Cell, autoUncoverNeighbors = true) {
    if (cell.numberOfMines === 0 && autoUncoverNeighbors) {
      const neighboringCellsToUncover = this.getAdjacentCellsWithNoMines(cell);
      neighboringCellsToUncover.forEach((neighboringCell) => this.uncoverCell(neighboringCell, false));
    }

    cell.uncovered = true;

    if (autoUncoverNeighbors) {
      this.checkIfGameIsWon();
    }
  }

  checkIfGameIsWon() {
    const allCells = Array.from(this.getGridCells());

    // all cells must be either flagged or uncovered
    const allUncovered = allCells.every((cell) => cell.flagged || cell.uncovered);

    // all flagged cells must have mines
    const correctFlags = allCells.filter((cell) => cell.flagged)
      .every((cell) => cell.hasMine);

    if (allUncovered && correctFlags) {
      this.gameWon = true;
    }
  }
}
