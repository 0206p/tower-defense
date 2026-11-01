import Phaser from 'phaser';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '../config/GameConfig';
import { WorldId } from './SaveSystem';

export interface GridPoint {
  col: number;
  row: number;
}

export class MapManager {
  private scene: Phaser.Scene;
  private grid: number[][]; // 0: baubar, 1: Weg, 2: Deko/Hindernis, 3: Turm, 4: Start/Ziel
  public pathPoints: GridPoint[];
  public curvePath!: Phaser.Curves.Path;
  private worldId: WorldId;

  constructor(scene: Phaser.Scene, worldId: WorldId = 'witch_forest', missionNumber: number = 1) {
    this.scene = scene;
    this.worldId = worldId;
    this.grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.grid[r] = new Array(GRID_COLS).fill(0);
    }

    // Variierende Pfade je nach Mission & Welt
    const pathVariants: GridPoint[][] = [
      // Variante 1: Große Doppelschleife
      [
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
      ],
      // Variante 2: S-Kurven-Schlange
      [
        { col: 0, row: 4 },
        { col: 12, row: 4 },
        { col: 12, row: 9 },
        { col: 6, row: 9 },
        { col: 6, row: 14 },
        { col: 22, row: 14 },
        { col: 22, row: 7 },
        { col: 28, row: 7 },
        { col: 28, row: 11 },
        { col: 31, row: 11 }
      ],
      // Variante 3: Spirale
      [
        { col: 0, row: 2 },
        { col: 20, row: 2 },
        { col: 20, row: 12 },
        { col: 8, row: 12 },
        { col: 8, row: 6 },
        { col: 15, row: 6 },
        { col: 15, row: 9 },
        { col: 26, row: 9 },
        { col: 26, row: 14 },
        { col: 31, row: 14 }
      ]
    ];

    const variantIndex = (missionNumber - 1) % pathVariants.length;
    this.pathPoints = pathVariants[variantIndex];

    this.markPathOnGrid();
    this.buildCurvePath();
  }

  private markPathOnGrid(): void {
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
            this.grid[r][c] = 1;
          }
        }
      }
    }

    const start = this.pathPoints[0];
    const end = this.pathPoints[this.pathPoints.length - 1];
    this.grid[start.row][start.col] = 4;
    this.grid[end.row][end.col] = 4;

    // Feste Deko-Positionen
    const decorPositions = [
      { col: 1, row: 1 }, { col: 10, row: 1 }, { col: 13, row: 14 },
      { col: 21, row: 1 }, { col: 28, row: 3 }, { col: 24, row: 13 }
    ];

    decorPositions.forEach((d) => {
      if (this.grid[d.row] && this.grid[d.row][d.col] === 0) {
        this.grid[d.row][d.col] = 2;
      }
    });

    // Top- & Bottom-Bar für UI sperren
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
    let groundKey = 'tile_ground_witch';
    let pathKey = 'tile_path_witch';
    let decorKey = 'tile_decor_witch';

    if (this.worldId === 'goblin_caves') {
      groundKey = 'tile_ground_cave';
      pathKey = 'tile_path_cave';
      decorKey = 'tile_decor_cave';
    } else if (this.worldId === 'dead_mountain') {
      groundKey = 'tile_ground_mountain';
      pathKey = 'tile_path_mountain';
      decorKey = 'tile_decor_mountain';
    }

    // 1. Hintergrundboden
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const { x, y } = this.gridToPixel(c, r);
        this.scene.add.image(x, y, groundKey).setOrigin(0.5).setDepth(0);
      }
    }

    // 2. Weg
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const { x, y } = this.gridToPixel(c, r);
        if (this.grid[r][c] === 1) {
          this.scene.add.image(x, y, pathKey).setOrigin(0.5).setDepth(1);
        }
      }
    }

    // 3. Dekorationen
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] === 2 && r > 0 && r < 16) {
          const { x, y } = this.gridToPixel(c, r);
          this.scene.add.image(x, y, decorKey).setOrigin(0.5).setDepth(2);
        }
      }
    }

    // 4. Start & Schloss
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
