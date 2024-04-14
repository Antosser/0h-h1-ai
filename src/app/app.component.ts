import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

enum ButtonState {
  Gray,
  Yellow,
  Blue,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  grid: ButtonState[][] = [];
  width: any;
  solveOutput = '';

  ngOnInit(): void {
    this.initArray(4);
  }

  initArray(l: number): void {
    this.grid = Array(l)
      .fill(0)
      .map(() => Array(l).fill(ButtonState.Gray));
  }

  click(i: number, j: number): void {
    let currentState = this.grid[i][j];
    this.grid[i][j] =
      currentState === ButtonState.Gray
        ? ButtonState.Yellow
        : currentState === ButtonState.Yellow
        ? ButtonState.Blue
        : ButtonState.Gray;
  }

  getColor(i: number, j: number): string {
    switch (this.grid[i][j]) {
      case ButtonState.Gray:
        return '#2A2A2A';
      case ButtonState.Yellow:
        return '#FED501';
      case ButtonState.Blue:
        return '#005ABC';
    }
  }

  isSolved(): string {
    const transpose = this.grid[0].map((_, colIndex) =>
      this.grid.map((row) => row[colIndex])
    );

    // Return error if board has 3 continuous yellow blocks
    for (let i = 0; i < this.grid.length - 2; i++) {
      for (let j = 0; j < this.grid.length - 2; j++) {
        if (
          this.grid[i][j] === ButtonState.Yellow &&
          this.grid[i][j + 1] === ButtonState.Yellow &&
          this.grid[i][j + 2] === ButtonState.Yellow
        ) {
          return 'Three horizontal yellow blocks';
        }
        if (
          this.grid[i][j] === ButtonState.Yellow &&
          this.grid[i + 1][j] === ButtonState.Yellow &&
          this.grid[i + 2][j] === ButtonState.Yellow
        ) {
          return 'Three vertical yellow blocks';
        }
      }
    }

    // Return error if board has 3 continuous blue blocks
    for (let i = 0; i < this.grid.length - 2; i++) {
      for (let j = 0; j < this.grid.length - 2; j++) {
        if (
          this.grid[i][j] === ButtonState.Blue &&
          this.grid[i][j + 1] === ButtonState.Blue &&
          this.grid[i][j + 2] === ButtonState.Blue
        ) {
          return 'Three horizontal blue blocks';
        }
        if (
          this.grid[i][j] === ButtonState.Blue &&
          this.grid[i + 1][j] === ButtonState.Blue &&
          this.grid[i + 2][j] === ButtonState.Blue
        ) {
          return 'Three vertical blue blocks';
        }
      }
    }

    // Return error if the number of yellow and blue blocks in any row is not equal to width/2
    for (let i = 0; i < this.grid.length; i++) {
      if (
        this.grid[i].filter((x) => x === ButtonState.Yellow).length !==
        this.grid.length / 2
      ) {
        return 'There is a row with an unequal number of yellow and blue blocks';
      }
      if (
        this.grid[i].filter((x) => x === ButtonState.Blue).length !==
        this.grid.length / 2
      ) {
        return 'There is a row with an unequal number of yellow and blue blocks';
      }
    }

    // Return error if the number of yellow and blue blocks in any column is not equal to width/2
    for (let i = 0; i < this.grid.length; i++) {
      if (
        transpose[i].filter((x) => x === ButtonState.Yellow).length !==
        this.grid.length / 2
      ) {
        return 'There is a column with an unequal number of yellow and blue blocks';
      }
      if (
        transpose[i].filter((x) => x === ButtonState.Blue).length !==
        this.grid.length / 2
      ) {
        return 'There is a column with an unequal number of yellow and blue blocks';
      }
    }

    // Return error if any the rows are the same by transforming each row into a string and putting them into a set
    const rowStrings = new Set(this.grid.map((row) => row.join('')));
    if (rowStrings.size !== this.grid.length) {
      return 'Some rows are the same';
    }

    // Return error if any the columns are the same by transforming each column into a string and putting them into a set
    const columnStrings = new Set(transpose.map((column) => column.join('')));
    if (columnStrings.size !== this.grid.length) {
      return 'Some columns are the same';
    }

    return 'Solved';
  }

  stepBoard(): string {
    const transpose = this.grid[0].map((_, colIndex) =>
      this.grid.map((row) => row[colIndex])
    );

    {
      // Find every horizontal pair of yellow or blue blocks
      let pairs: [number, number][] = [];
      for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid.length - 1; j++) {
          if (
            this.grid[i][j] === ButtonState.Yellow &&
            this.grid[i][j + 1] === ButtonState.Yellow
          ) {
            pairs.push([i, j]);
          }
          if (
            this.grid[i][j] === ButtonState.Blue &&
            this.grid[i][j + 1] === ButtonState.Blue
          ) {
            pairs.push([i, j]);
          }
        }
      }
      // If the block before the pair is gray, change it to the opposite color of the pair
      for (const [i, j] of pairs) {
        if (j >= 1 && this.grid[i][j - 1] === ButtonState.Gray) {
          this.grid[i][j - 1] =
            this.grid[i][j] === ButtonState.Yellow
              ? ButtonState.Blue
              : ButtonState.Yellow;
          continue;
        }
        // Throw error if the block before the pair is the same color as the pair
        if (j >= 1 && this.grid[i][j - 1] === this.grid[i][j]) {
          return 'Found triple block';
        }
      }
      // If the block after the pair is gray, change it to the opposite color of the pair
      for (const [i, j] of pairs) {
        if (
          j <= this.grid.length - 3 &&
          this.grid[i][j + 2] === ButtonState.Gray
        ) {
          this.grid[i][j + 2] =
            this.grid[i][j] === ButtonState.Yellow
              ? ButtonState.Blue
              : ButtonState.Yellow;
          return 'Moved';
        }
        // Throw error if the block after the pair is the same color as the pair
        if (
          j <= this.grid.length - 3 &&
          this.grid[i][j + 2] === this.grid[i][j]
        ) {
          return 'Found triple block';
        }
      }
    }

    {
      // Find every vertical pair of yellow or blue blocks
      let pairs: [number, number][] = [];
      for (let i = 0; i < this.grid.length - 1; i++) {
        for (let j = 0; j < this.grid.length; j++) {
          if (
            this.grid[i][j] === ButtonState.Yellow &&
            this.grid[i + 1][j] === ButtonState.Yellow
          ) {
            pairs.push([i, j]);
          }
          if (
            this.grid[i][j] === ButtonState.Blue &&
            this.grid[i + 1][j] === ButtonState.Blue
          ) {
            pairs.push([i, j]);
          }
        }
      }
      // If the block above the pair is gray, change it to the opposite color of the pair
      for (const [i, j] of pairs) {
        if (i >= 1 && this.grid[i - 1][j] === ButtonState.Gray) {
          this.grid[i - 1][j] =
            this.grid[i][j] === ButtonState.Yellow
              ? ButtonState.Blue
              : ButtonState.Yellow;
          return 'Moved';
        }
        // Throw error if the block above the pair is the same color as the pair
        if (i >= 1 && this.grid[i - 1][j] === this.grid[i][j]) {
          return 'Found triple block';
        }
      }
      // If the block below the pair is gray, change it to the opposite color of the pair
      for (const [i, j] of pairs) {
        if (
          i <= this.grid.length - 3 &&
          this.grid[i + 2][j] === ButtonState.Gray
        ) {
          this.grid[i + 2][j] =
            this.grid[i][j] === ButtonState.Yellow
              ? ButtonState.Blue
              : ButtonState.Yellow;
          return 'Moved';
        }
        // Throw error if the block below the pair is the same color as the pair
        if (
          i <= this.grid.length - 3 &&
          this.grid[i + 2][j] === this.grid[i][j]
        ) {
          return 'Found triple block';
        }
      }
    }

    {
      // Find horizontal pairs of yellow or blue block that 2 cells away from each other
      let pairs: [number, number][] = [];
      for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid.length - 2; j++) {
          if (
            this.grid[i][j] === ButtonState.Yellow &&
            this.grid[i][j + 2] === ButtonState.Yellow
          ) {
            pairs.push([i, j]);
          }
          if (
            this.grid[i][j] === ButtonState.Blue &&
            this.grid[i][j + 2] === ButtonState.Blue
          ) {
            pairs.push([i, j]);
          }
        }
      }

      // If the block between the pair is gray, change it to the opposite color of the pair
      for (const [i, j] of pairs) {
        if (this.grid[i][j + 1] === ButtonState.Gray) {
          this.grid[i][j + 1] =
            this.grid[i][j] === ButtonState.Yellow
              ? ButtonState.Blue
              : ButtonState.Yellow;
          return 'Moved';
        }
        // Throw error if the block between the pair is the same color as the pair
        if (this.grid[i][j + 1] === this.grid[i][j]) {
          return 'Found triple block';
        }
      }
    }

    {
      // Find vertical pairs of yellow or blue block that 2 cells away from each other
      let pairs: [number, number][] = [];
      for (let i = 0; i < this.grid.length - 2; i++) {
        for (let j = 0; j < this.grid.length; j++) {
          if (
            this.grid[i][j] === ButtonState.Yellow &&
            this.grid[i + 2][j] === ButtonState.Yellow
          ) {
            pairs.push([i, j]);
          }
          if (
            this.grid[i][j] === ButtonState.Blue &&
            this.grid[i + 2][j] === ButtonState.Blue
          ) {
            pairs.push([i, j]);
          }
        }
      }

      // If the block between the pair is gray, change it to the opposite color of the pair
      for (const [i, j] of pairs) {
        if (this.grid[i + 1][j] === ButtonState.Gray) {
          this.grid[i + 1][j] =
            this.grid[i][j] === ButtonState.Yellow
              ? ButtonState.Blue
              : ButtonState.Yellow;
          return 'Moved';
        }
        // Throw error if the block between the pair is the same color as the pair
        if (this.grid[i + 1][j] === this.grid[i][j]) {
          return 'Found triple block';
        }
      }
    }

    {
      // Find horizontal row where one color fills half the row and the row isn't full. Fill all other cells with the opposite color
      for (let i = 0; i < this.grid.length; i++) {
        let yellowCount = 0;
        let blueCount = 0;
        let grayCount = 0;
        for (let j = 0; j < this.grid.length; j++) {
          if (this.grid[i][j] === ButtonState.Yellow) {
            yellowCount++;
          }
          if (this.grid[i][j] === ButtonState.Blue) {
            blueCount++;
          }
          if (this.grid[i][j] === ButtonState.Gray) {
            grayCount++;
          }
        }
        if (yellowCount === this.grid.length / 2 && grayCount > 0) {
          for (let j = 0; j < this.grid.length; j++) {
            if (this.grid[i][j] === ButtonState.Gray) {
              this.grid[i][j] = ButtonState.Blue;
            }
          }
          return 'Moved';
        }
        if (blueCount === this.grid.length / 2 && grayCount > 0) {
          for (let j = 0; j < this.grid.length; j++) {
            if (this.grid[i][j] === ButtonState.Gray) {
              this.grid[i][j] = ButtonState.Yellow;
            }
          }
          return 'Moved';
        }
        if (blueCount > this.grid.length) {
          this.solveOutput += 'Too many blue blocks';
          return 'Moved';
        }
        if (yellowCount > this.grid.length) {
          this.solveOutput += 'Too many yellow blocks';
          return 'Moved';
        }
      }
    }

    {
      // Find vertical column where one color fills half the row and the row isn't full. Fill all other cells with the opposite color
      for (let j = 0; j < this.grid.length; j++) {
        let yellowCount = 0;
        let blueCount = 0;

        let grayCount = 0;
        for (let i = 0; i < this.grid.length; i++) {
          if (this.grid[i][j] === ButtonState.Yellow) {
            yellowCount++;
          }
          if (this.grid[i][j] === ButtonState.Blue) {
            blueCount++;
          }
          if (this.grid[i][j] === ButtonState.Gray) {
            grayCount++;
          }
        }
        if (yellowCount === this.grid.length / 2 && grayCount > 0) {
          for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i][j] === ButtonState.Gray) {
              this.grid[i][j] = ButtonState.Blue;
            }
          }
          return 'Moved';
        }
        if (blueCount === this.grid.length / 2 && grayCount > 0) {
          for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i][j] === ButtonState.Gray) {
              this.grid[i][j] = ButtonState.Yellow;
            }
          }
          return 'Moved';
        }
      }
    }

    {
      // Loop through all full rows
      for (let i = 0; i < this.grid.length; i++) {
        const isFull = this.grid[i].every((cell) => cell !== ButtonState.Gray);

        if (isFull) {
          // Loop through all rows that have all except 2 filled blocks
          // AND where all full blocks match
          for (let k = 0; k < this.grid.length; k++) {
            const except2 =
              this.grid[k].filter((cell) => cell !== ButtonState.Gray)
                .length ===
              this.grid.length - 2;
            let isMatch = true;

            for (let j = 0; j < this.grid.length; j++) {
              if (
                this.grid[k][j] !== this.grid[i][j] &&
                this.grid[k][j] !== ButtonState.Gray
              ) {
                isMatch = false;
                break;
              }
            }

            if (except2 && isMatch) {
              // Make the 2 unfilled blocks the opposite of the first
              for (let j = 0; j < this.grid.length; j++) {
                if (this.grid[k][j] === ButtonState.Gray) {
                  this.grid[k][j] =
                    this.grid[i][j] === ButtonState.Blue
                      ? ButtonState.Yellow
                      : ButtonState.Blue;
                  return 'Moved';
                }
              }
            }
          }
        }
      }
    }

    {
      // Loop through all full columns
      for (let j = 0; j < this.grid.length; j++) {
        const isFull = transpose[j].every((cell) => cell !== ButtonState.Gray);
        if (isFull) {
          // Loop through all columns that have all except 2 filled blocks
          // AND where all full blocks match
          for (let l = 0; l < this.grid.length; l++) {
            const except2 =
              transpose[l].filter((cell) => cell !== ButtonState.Gray)
                .length ===
              this.grid.length - 2;
            let isMatch = true;

            for (let i = 0; i < this.grid.length; i++) {
              if (
                this.grid[i][j] !== this.grid[i][l] &&
                this.grid[i][l] !== ButtonState.Gray
              ) {
                isMatch = false;
                break;
              }
            }

            if (except2 && isMatch) {
              // Make the 2 unfilled blocks the opposite of the first
              for (let i = 0; i < this.grid.length; i++) {
                if (this.grid[i][l] === ButtonState.Gray) {
                  this.grid[i][l] =
                    this.grid[i][j] === ButtonState.Blue
                      ? ButtonState.Yellow
                      : ButtonState.Blue;
                  return 'Moved';
                }
              }
            }
          }
        }
      }
    }

    return 'Done';
  }

  solveBoard(): void {
    this.solveOutput = '[' + new Date().toString() + '] ';
    const result = this.stepBoard();
    if (result !== 'Moved') {
      this.solveOutput += result;
      return;
    }

    setTimeout(() => {
      this.solveBoard();
    }, 100);
  }
}
