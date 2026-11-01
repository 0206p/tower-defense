import Phaser from 'phaser';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '../config/GameConfig';

export interface GridPoint {
  col: number;
  row: number;
}

export class MapManager {
  private scene: Phaser.Scene;
  private grid: number[][]; // 0: Gras (baubar), 1: Weg, 2: Deko/Hindernis, 3: Turm, 4: Start/Ziel
  public pathPoints: GridPoint[];
  public curvePath!: Phaser.Curves.Path;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.grid[r] = new Array(GRID_COLS).fill(0);
    }

    // Geschwungener Pfad mit strategischen Schleifen
    this.pathPoints = [
      { col: 0, row: 3 },
      { col: 8, row: 3 },
      { col: 8, row: 8 },
      { col: 3, row: 8 },
      { col: 3, row: 13 },
      { col: 17, row: 13 },
      { col: 17, row: 4 },
      { col: 26, row: 4 },
      { col: 26, row: 10 },
      { col: 31, row: 10 }
    ];

    this.markPathOnGrid();
    this.buildCurvePath();
  }

  private markPathOnGrid(): void {
    // Weg-Tiles im Grid markieren
    for (let i = 0; i < this.pathPoints.length - 1; i++) {
      const p1 = this.pathPoints[i];
      const p2 = this.pathPoints[i + 1];

      const startCol = Math.min(p1.col, p2.col);
      const endCol = Math.max(p1.col, p2.col);
      const startRow = Math.min(p1.row, p2.row);
      const endRow = Math.max(p1.row, p2.row);

      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
            this.grid[r][c] = 1; // Weg
          }
        }
      }
    }

    // Start- und Zielpunkt markieren
    const start = this.pathPoints[0];
    const end = this.pathPoints[this.pathPoints.length - 1];
    this.grid[start.row][start.col] = 4;
    this.grid[end.row][end.col] = 4;

    // Feste Deko-Hindernisse (Bäume und Felsen) strategisch platzieren
    const decorPositions: { col: number; row: number; type: 'tree' | 'rock' }[] = [
      { col: 1, row: 1, type: 'tree' },
      { col: 2, row: 1, type: 'tree' },
      { col: 10, row: 1, type: 'tree' },
      { col: 12, row: 2, type: 'rock' },
      { col: 6, row: 6, type: 'rock' },
      { col: 1, row: 10, type: 'tree' },
      { col: 6, row: 11, type: 'tree' },
      { col: 12, row: 10, type: 'rock' },
      { col: 13, row: 15, type: 'tree' },
      { col: 14, row: 15, type: 'tree' },
      { col: 20, row: 2, type: 'tree' },
      { col: 22, row: 2, type: 'rock' },
      { col: 22, row: 7, type: 'tree' },
      { col: 28, row: 2, type: 'tree' },
      { col: 29, row: 13, type: 'rock' },
      { col: 24, row: 14, type: 'tree' },
      { col: 19, row: 11, type: 'rock' }
    ];

    decorPositions.forEach((d) => {
      if (this.grid[d.row][d.col] === 0) {
        this.grid[d.row][d.col] = 2; // Hindernis
      }
    });

    // Die oberste Zeile (Row 0) und unterste Zeile (Row 17) für HUD reservieren
    for (let c = 0; c < GRID_COLS; c++) {
      if (this.grid[0][c] === 0) this.grid[0][c] = 2;
      if (this.grid[16][c] === 0) this.grid[16][c] = 2;
      if (this.grid[17][c] === 0) this.grid[17][c] = 2;
    }
  }

  private buildCurvePath(): void {
    const start = this.gridToPixel(this.pathPoints[0].col, this.pathPoints[0].row);
    this.curvePath = new Phaser.Curves.Path(start.x, start.y);

    for (let i = 1; i < this.pathPoints.length; i++) {
      const pt = this.gridToPixel(this.pathPoints[i].col, this.pathPoints[i].row);
      this.curvePath.lineTo(pt.x, pt.y);
    }
  }

  public renderMap(): void {
    // 1. Hintergrund Gras überall zeichnen
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const { x, y } = this.gridToPixel(c, r);
        this.scene.add.image(x, y, 'tile_grass').setOrigin(0.5).setDepth(0);
      }
    }

    // 2. Weg zeichnen
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const { x, y } = this.gridToPixel(c, r);
        if (this.grid[r][c] === 1) {
          this.scene.add.image(x, y, 'tile_dirt').setOrigin(0.5).setDepth(1);
        }
      }
    }

    // 3. Dekorationen (Bäume & Felsen)
    const decorPositions: { col: number; row: number; type: 'tree' | 'rock' }[] = [
      { col: 1, row: 1, type: 'tree' },
      { col: 2, row: 1, type: 'tree' },
      { col: 10, row: 1, type: 'tree' },
      { col: 12, row: 2, type: 'rock' },
      { col: 6, row: 6, type: 'rock' },
      { col: 1, row: 10, type: 'tree' },
      { col: 6, row: 11, type: 'tree' },
      { col: 12, row: 10, type: 'rock' },
      { col: 13, row: 15, type: 'tree' },
      { col: 14, row: 15, type: 'tree' },
      { col: 20, row: 2, type: 'tree' },
      { col: 22, row: 2, type: 'rock' },
      { col: 22, row: 7, type: 'tree' },
      { col: 28, row: 2, type: 'tree' },
      { col: 29, row: 13, type: 'rock' },
      { col: 24, row: 14, type: 'tree' },
      { col: 19, row: 11, type: 'rock' }
    ];

    decorPositions.forEach((d) => {
      const { x, y } = this.gridToPixel(d.col, d.row);
      const key = d.type === 'tree' ? 'tile_tree' : 'tile_rock';
      this.scene.add.image(x, y, key).setOrigin(0.5).setDepth(2);
    });

    // 4. Start-Portal und Burgtor
    const startPos = this.gridToPixel(this.pathPoints[0].col, this.pathPoints[0].row);
    const endPos = this.gridToPixel(this.pathPoints[this.pathPoints.length - 1].col, this.pathPoints[this.pathPoints.length - 1].row);

    this.scene.add.image(startPos.x, startPos.y, 'tile_portal').setOrigin(0.5).setDepth(2);
    this.scene.add.image(endPos.x, endPos.y, 'tile_castle').setOrigin(0.5).setDepth(2);
  }

  public gridToPixel(col: number, row: number): { x: number; y: number } {
    return {
      x: col * TILE_SIZE + TILE_SIZE / 2,
      y: row * TILE_SIZE + TILE_SIZE / 2
    };
  }

  public pixelToGrid(x: number, y: number): GridPoint {
    return {
      col: Math.floor(x / TILE_SIZE),
      row: Math.floor(y / TILE_SIZE)
    };
  }

  public isWithinBounds(col: number, row: number): boolean {
    return col >= 0 && col < GRID_COLS && row >= 1 && row < 16;
  }

  public canBuildAt(col: number, row: number): boolean {
    if (!this.isWithinBounds(col, row)) return false;
    return this.grid[row][col] === 0;
  }

  public setTowerAt(col: number, row: number): void {
    if (this.isWithinBounds(col, row)) {
      this.grid[row][col] = 3;
    }
  }

  public removeTowerAt(col: number, row: number): void {
    if (this.isWithinBounds(col, row)) {
      this.grid[row][col] = 0;
    }
  }
}

