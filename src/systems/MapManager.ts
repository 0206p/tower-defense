import Phaser from 'phaser';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '../config/GameConfig';
import { WorldId } from './SaveSystem';

export interface GridPoint {
  col: number;
  row: number;
}

export class MapManager {
  private scene: Phaser.Scene;
  private grid: number[][]; // 0: baubar, 1: Weg, 2: Deko, 3: Turm, 4: Start/Ziel, 5: Runenstein
  public pathPoints: GridPoint[];
  public runeTiles: GridPoint[] = [];
  public curvePath!: Phaser.Curves.Path;
  private worldId: WorldId;

  constructor(scene: Phaser.Scene, worldId: WorldId = 'witch_forest', missionNumber: number = 1) {
    this.scene = scene;
    this.worldId = worldId;
    this.grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.grid[r] = new Array(GRID_COLS).fill(0);
    }

    // 6 abwechslungsreiche Pfadvarianten je nach Mission
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
      ],
      // Variante 4: Zickzack-Schlucht
      [
        { col: 0, row: 2 },
        { col: 14, row: 2 },
        { col: 14, row: 7 },
        { col: 4, row: 7 },
        { col: 4, row: 12 },
        { col: 20, row: 12 },
        { col: 20, row: 5 },
        { col: 27, row: 5 },
        { col: 27, row: 13 },
        { col: 31, row: 13 }
      ],
      // Variante 5: Der Schicksals-Gipfel
      [
        { col: 0, row: 8 },
        { col: 7, row: 8 },
        { col: 7, row: 3 },
        { col: 18, row: 3 },
        { col: 18, row: 8 },
        { col: 12, row: 8 },
        { col: 12, row: 13 },
        { col: 24, row: 13 },
        { col: 24, row: 7 },
        { col: 31, row: 7 }
      ],
      // Variante 6: Das Schlangen-Labyrinth
      [
        { col: 0, row: 3 },
        { col: 10, row: 3 },
        { col: 10, row: 13 },
        { col: 16, row: 13 },
        { col: 16, row: 4 },
        { col: 23, row: 4 },
        { col: 23, row: 11 },
        { col: 31, row: 11 }
      ]
    ];

    const variantIndex = (missionNumber - 1) % pathVariants.length;
    this.pathPoints = pathVariants[variantIndex];

    this.markPathOnGrid();
    this.spawnRuneTiles(variantIndex);
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
  }

  private spawnRuneTiles(variant: number): void {
    const runeOptions: GridPoint[][] = [
      [{ col: 5, row: 5 }, { col: 14, row: 7 }, { col: 23, row: 7 }],
      [{ col: 8, row: 6 }, { col: 19, row: 10 }, { col: 25, row: 9 }],
      [{ col: 11, row: 9 }, { col: 23, row: 5 }, { col: 18, row: 11 }],
      [{ col: 9, row: 4 }, { col: 17, row: 9 }, { col: 24, row: 8 }],
      [{ col: 10, row: 5 }, { col: 15, row: 10 }, { col: 21, row: 10 }],
      [{ col: 13, row: 7 }, { col: 19, row: 7 }, { col: 27, row: 7 }]
    ];

    const currentRunes = runeOptions[variant % runeOptions.length];
    currentRunes.forEach((pt) => {
      if (this.grid[pt.row] && this.grid[pt.row][pt.col] === 0) {
        this.grid[pt.row][pt.col] = 5;
        this.runeTiles.push(pt);
      }
    });
  }

  public isRuneTile(col: number, row: number): boolean {
    return this.runeTiles.some((r) => r.col === col && r.row === row);
  }

  private buildCurvePath(): void {
    const firstPoint = this.gridToPixel(this.pathPoints[0].col, this.pathPoints[0].row);
    this.curvePath = this.scene.add.path(firstPoint.x, firstPoint.y);

    for (let i = 1; i < this.pathPoints.length; i++) {
      const nextPoint = this.gridToPixel(this.pathPoints[i].col, this.pathPoints[i].row);
      this.curvePath.lineTo(nextPoint.x, nextPoint.y);
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

    // 1. Hintergrund-Kacheln (Gras, Höhlenboden oder Lavafels)
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const { x, y } = this.gridToPixel(c, r);
        this.scene.add.image(x, y, groundKey).setOrigin(0.5).setDepth(0);
      }
    }

    // 2. Pfad-Kacheln
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] === 1 || this.grid[r][c] === 4) {
          const { x, y } = this.gridToPixel(c, r);
          this.scene.add.image(x, y, pathKey).setOrigin(0.5).setDepth(1);
        }
      }
    }

    // 3. Magische Runen-Bauplätze (+20% Range Bonus)
    this.runeTiles.forEach((pt) => {
      const { x, y } = this.gridToPixel(pt.col, pt.row);
      const runeImg = this.scene.add.image(x, y, 'tile_runestone').setOrigin(0.5).setDepth(2);
      this.scene.tweens.add({
        targets: runeImg,
        alpha: 0.75,
        duration: 1200,
        yoyo: true,
        repeat: -1
      });
    });

    // 4. Dekorationen
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] === 2 && r > 0 && r < 16) {
          const { x, y } = this.gridToPixel(c, r);
          this.scene.add.image(x, y, decorKey).setOrigin(0.5).setDepth(2);
        }
      }
    }

    // 5. Start & Schloss
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
    return this.grid[row][col] === 0 || this.grid[row][col] === 5;
  }

  public setTowerAt(col: number, row: number): void {
    if (this.isWithinBounds(col, row)) {
      this.grid[row][col] = 3;
    }
  }

  public removeTowerAt(col: number, row: number): void {
    if (this.isWithinBounds(col, row)) {
      this.grid[row][col] = this.isRuneTile(col, row) ? 5 : 0;
    }
  }
}
