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
        const cell = new Cell(i, j);
        row.push(cell);
      }

      this.grid.push(row);
    }
  }

  getNumberOfPlantedMines(): number {
    return Array.from(this.getGridCells()).reduce((totalMines, gridCell) => {
      return gridCell.hasMine ? totalMines + 1 : totalMines;
    }, 0);
  }

  plantMines(clickedCell: Cell) {
    const maxMines = this.mines;
    let currentMines = this.getNumberOfPlantedMines();

    if (currentMines === maxMines) {
      return;
    }

    const adjacentCells = this.getAdjacentCells(clickedCell);

    while (currentMines !== maxMines) {
      const row = Math.floor(Math.random() * this.height);
      const col = Math.floor(Math.random() * this.width);
      const cell = this.grid[row][col];

      // the first click of the game is free, we don't plant the clicked cell or
      // the cells that are adjacent to it
      if (
        cell !== clickedCell &&
        !adjacentCells.includes(cell) &&
        !cell.hasMine
      ) {
        cell.hasMine = true;
        currentMines += 1;
      }
    }

    // calculate the number of mines in adjacent cells
    for (const cell of this.getGridCells()) {
      cell.numberOfMines = this.getAdjacentCells(cell).reduce(
        (totalMines, adjacentCell) => {
          return adjacentCell.hasMine ? totalMines + 1 : totalMines;
        },
        0
      );
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

  /**
   * Keep track of the time (and present it in the LED panel)
   */
  timeLoop() {
    if (this.startTime instanceof Date && !this.gameOver) {
      const now = new Date();
      this.elapsedTime = Math.floor(
        (now.valueOf() - this.startTime.valueOf()) / 1000
      );
    }

    window.requestAnimationFrame(() => this.timeLoop());
  }

  /**
   * Returns the cells around of this cell.
   * Think of a 9x9 square made up of cells. This cell parameter would be the
   * center cell of that square and this method would return all the other
   * cells at the borders.
   *
   * If the imaginary 9x9 square overflows the game boundaries then the cells
   * which are in the boundaries would be returned. For instance, if `cell` is
   * the top-left corner cell (x0, y0) then 3 cells would be returned: (x1, y0),
   * (x0, y1) and (x1, y1)
   * @param cell The cell in the center of an imaginary 9x9 square.
   */
  getAdjacentCells(cell: Cell): Cell[] {
    // we need a set due to clamping
    const adjacentCells: Set<Cell> = new Set();

    for (let i = -1; i <= 1; ++i) {
      for (let j = -1; j <= 1; ++j) {
        if (i === 0 && j === 0) {
          // skip self
          continue;
        }

        const adjacentCellRow = MathHelper.clamp(
          cell.row + i,
          0,
          this.height - 1
        );
        const adjacentCellCol = MathHelper.clamp(
          cell.col + j,
          0,
          this.width - 1
        );
        const adjacentCell = this.grid[adjacentCellRow][adjacentCellCol];
        adjacentCells.add(adjacentCell);
      }
    }

    return Array.from(adjacentCells);
  }

  getAdjacentCellsToUncover(cell: Cell): Cell[] {
    // if the current cell has 0 mines around then the game simulates a click
    // for all the adjacent cells (since it is obvious that they aren't mined).
    const cellsToUncover: Set<Cell> = new Set();

    // the same cell can be the neighbor of multiple cells. in order to prevent
    // an infinite loop, we keep track which cells we've checked.
    const recursedCells: Set<Cell> = new Set();
    const recurser = (cellToRecurse: Cell) => {
      // this cell has been checked before, no need to do it again
      if (recursedCells.has(cellToRecurse)) {
        return;
      }

      recursedCells.add(cellToRecurse);

      this.getAdjacentCells(cellToRecurse).forEach((adjacentCell) => {
        if (!adjacentCell.uncovered) {
          cellsToUncover.add(adjacentCell);

          // if the adjacent cell also has 0 mines, then we'll have to perform
          // the same operation for that cell too!
          if (adjacentCell.numberOfMines === 0) {
            recurser(adjacentCell);
          }
        }
      });
    };

    // begin the process by looking up the originally clicked cell (patient 0)
    recurser(cell);
    return Array.from(cellsToUncover);
  }

  uncoverCell(cell: Cell, autoUncoverNeighbors = true) {
    if (cell.numberOfMines === 0 && autoUncoverNeighbors) {
      const neighboringCellsToUncover = this.getAdjacentCellsToUncover(cell);
      neighboringCellsToUncover.forEach((neighboringCell) =>
        this.uncoverCell(neighboringCell, false)
      );
    }

    cell.uncovered = true;

    // uncoverCell calls itself recursively. autoUncoverNeighbors is always set to
    // false for sub-calls. Although there is no harm (other than wasting resources)
    // of calling checkIfGameIsWon() multiple times, calling it once is enough.
    const isRootCall = autoUncoverNeighbors;
    if (isRootCall) {
      this.checkIfGameIsWon();
    }
  }

  checkIfGameIsWon() {
    const allCells = Array.from(this.getGridCells());

    // all cells must be either flagged or uncovered
    const allUncovered = allCells.every(
      (cell) => cell.flagged || cell.uncovered
    );

    // all flagged cells must have mines
    const correctFlags = allCells
      .filter((cell) => cell.flagged)
      .every((cell) => cell.hasMine);

    if (allUncovered && correctFlags) {
      this.gameWon = true;
    }
  }
}
