import Phaser from 'phaser';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '../config/GameConfig';
import { WorldId } from './SaveSystem';
import { logger } from './GameLogger';

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
  private grassTufts: Map<string, Phaser.GameObjects.Image> = new Map();
  private ambientParticles: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, worldId: WorldId = 'witch_forest', missionNumber: number = 1) {
    this.scene = scene;
    this.worldId = worldId;
    this.grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.grid[r] = new Array(GRID_COLS).fill(0);
    }

    // ==========================================
    // WELT-SPEZIFISCHE PFADE (Einheitlicher Stil, hohe Varianz)
    // ==========================================

    // 1. Die Hexenwelt: Gewundene Wald- und Sumpfpfade mit Flussbiegungen
    const witchForestVariants: GridPoint[][] = [
      // Variante 1: Die Große Doppelschleife
      [
        { col: 0, row: 3 }, { col: 8, row: 3 }, { col: 8, row: 8 },
        { col: 3, row: 8 }, { col: 3, row: 13 }, { col: 17, row: 13 },
        { col: 17, row: 4 }, { col: 26, row: 4 }, { col: 26, row: 10 },
        { col: 31, row: 10 }
      ],
      // Variante 2: Schlangen-S-Kurve durch den Sumpf
      [
        { col: 0, row: 4 }, { col: 12, row: 4 }, { col: 12, row: 9 },
        { col: 6, row: 9 }, { col: 6, row: 14 }, { col: 22, row: 14 },
        { col: 22, row: 7 }, { col: 28, row: 7 }, { col: 28, row: 11 },
        { col: 31, row: 11 }
      ],
      // Variante 3: Hexenkessel-Spirale
      [
        { col: 0, row: 2 }, { col: 20, row: 2 }, { col: 20, row: 12 },
        { col: 8, row: 12 }, { col: 8, row: 6 }, { col: 15, row: 6 },
        { col: 15, row: 9 }, { col: 26, row: 9 }, { col: 26, row: 14 },
        { col: 31, row: 14 }
      ],
      // Variante 4: Zickzack-Moor
      [
        { col: 0, row: 2 }, { col: 14, row: 2 }, { col: 14, row: 7 },
        { col: 4, row: 7 }, { col: 4, row: 12 }, { col: 20, row: 12 },
        { col: 20, row: 5 }, { col: 27, row: 5 }, { col: 27, row: 13 },
        { col: 31, row: 13 }
      ],
      // Variante 5: Der Schicksals-Weiher
      [
        { col: 0, row: 8 }, { col: 7, row: 8 }, { col: 7, row: 3 },
        { col: 18, row: 3 }, { col: 18, row: 8 }, { col: 12, row: 8 },
        { col: 12, row: 13 }, { col: 24, row: 13 }, { col: 24, row: 7 },
        { col: 31, row: 7 }
      ],
      // Variante 6: Boss-Arena (Garten der Hexe mit zentraler Schleife)
      [
        { col: 0, row: 4 }, { col: 10, row: 4 }, { col: 10, row: 13 },
        { col: 16, row: 13 }, { col: 16, row: 4 }, { col: 23, row: 4 },
        { col: 23, row: 11 }, { col: 31, row: 11 }
      ]
    ];

    // 2. Die Goblinhöhlen: Unterirdische Schächte, Abbaustellen & Minengleise
    const goblinCavesVariants: GridPoint[][] = [
      // Variante 1: Der Förderschacht
      [
        { col: 0, row: 5 }, { col: 9, row: 5 }, { col: 9, row: 2 },
        { col: 20, row: 2 }, { col: 20, row: 8 }, { col: 5, row: 8 },
        { col: 5, row: 13 }, { col: 25, row: 13 }, { col: 25, row: 7 },
        { col: 31, row: 7 }
      ],
      // Variante 2: Die Erzgrotte
      [
        { col: 0, row: 7 }, { col: 7, row: 7 }, { col: 7, row: 12 },
        { col: 15, row: 12 }, { col: 15, row: 3 }, { col: 22, row: 3 },
        { col: 22, row: 10 }, { col: 28, row: 10 }, { col: 28, row: 5 },
        { col: 31, row: 5 }
      ],
      // Variante 3: Das Höhlenlabyrinth
      [
        { col: 0, row: 3 }, { col: 11, row: 3 }, { col: 11, row: 11 },
        { col: 6, row: 11 }, { col: 6, row: 14 }, { col: 19, row: 14 },
        { col: 19, row: 6 }, { col: 26, row: 6 }, { col: 26, row: 12 },
        { col: 31, row: 12 }
      ],
      // Variante 4: Die unterirdische Schlucht
      [
        { col: 0, row: 4 }, { col: 16, row: 4 }, { col: 16, row: 9 },
        { col: 8, row: 9 }, { col: 8, row: 13 }, { col: 24, row: 13 },
        { col: 24, row: 8 }, { col: 31, row: 8 }
      ],
      // Variante 5: Der Zwergenschacht
      [
        { col: 0, row: 9 }, { col: 8, row: 9 }, { col: 8, row: 4 },
        { col: 17, row: 4 }, { col: 17, row: 12 }, { col: 12, row: 12 },
        { col: 12, row: 14 }, { col: 27, row: 14 }, { col: 27, row: 6 },
        { col: 31, row: 6 }
      ],
      // Variante 6: Boss-Mine (Tiefe Höhlenkammer des Königs)
      [
        { col: 0, row: 3 }, { col: 14, row: 3 }, { col: 14, row: 8 },
        { col: 4, row: 8 }, { col: 4, row: 13 }, { col: 22, row: 13 },
        { col: 22, row: 5 }, { col: 31, row: 5 }
      ]
    ];

    // 3. Der tote Berg: Vulkankämme, Obsidianbrücken & Magmaflüsse
    const deadMountainVariants: GridPoint[][] = [
      // Variante 1: Der Obsidian-Grat
      [
        { col: 0, row: 2 }, { col: 10, row: 2 }, { col: 10, row: 7 },
        { col: 5, row: 7 }, { col: 5, row: 12 }, { col: 18, row: 12 },
        { col: 18, row: 5 }, { col: 26, row: 5 }, { col: 26, row: 11 },
        { col: 31, row: 11 }
      ],
      // Variante 2: Lavastrom-Passage
      [
        { col: 0, row: 6 }, { col: 8, row: 6 }, { col: 8, row: 2 },
        { col: 19, row: 2 }, { col: 19, row: 9 }, { col: 13, row: 9 },
        { col: 13, row: 14 }, { col: 25, row: 14 }, { col: 25, row: 7 },
        { col: 31, row: 7 }
      ],
      // Variante 3: Kaldera-Spirale
      [
        { col: 0, row: 4 }, { col: 22, row: 4 }, { col: 22, row: 13 },
        { col: 9, row: 13 }, { col: 9, row: 7 }, { col: 16, row: 7 },
        { col: 16, row: 10 }, { col: 27, row: 10 }, { col: 27, row: 14 },
        { col: 31, row: 14 }
      ],
      // Variante 4: Drachenzahn-Grat
      [
        { col: 0, row: 3 }, { col: 12, row: 3 }, { col: 12, row: 8 },
        { col: 7, row: 8 }, { col: 7, row: 13 }, { col: 21, row: 13 },
        { col: 21, row: 6 }, { col: 28, row: 6 }, { col: 28, row: 12 },
        { col: 31, row: 12 }
      ],
      // Variante 5: Aschetal-Serpentine
      [
        { col: 0, row: 7 }, { col: 11, row: 7 }, { col: 11, row: 3 },
        { col: 18, row: 3 }, { col: 18, row: 12 }, { col: 6, row: 12 },
        { col: 6, row: 14 }, { col: 26, row: 14 }, { col: 26, row: 8 },
        { col: 31, row: 8 }
      ],
      // Variante 6: Boss-Krater (Der flüssige Vulkankern)
      [
        { col: 0, row: 5 }, { col: 9, row: 5 }, { col: 9, row: 12 },
        { col: 17, row: 12 }, { col: 17, row: 3 }, { col: 24, row: 3 },
        { col: 24, row: 11 }, { col: 31, row: 11 }
      ]
    ];

    let currentVariants = witchForestVariants;
    if (this.worldId === 'goblin_caves') {
      currentVariants = goblinCavesVariants;
    } else if (this.worldId === 'dead_mountain') {
      currentVariants = deadMountainVariants;
    }

    const variantIndex = (missionNumber - 1) % currentVariants.length;
    this.pathPoints = currentVariants[variantIndex];

    logger.info('MapManager', `Karte geladen: Welt=${this.worldId}, Mission=${missionNumber}, Pfad-Variante=${variantIndex + 1}`);

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

    // Feste thematische Dekorationen abseits des Pfades
    const decorPositions = [
      { col: 2, row: 1 }, { col: 11, row: 1 }, { col: 14, row: 14 },
      { col: 20, row: 1 }, { col: 27, row: 2 }, { col: 25, row: 14 }
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

    // 1. Hintergrund-Kacheln mit optimierter Kachelschärfe
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const { x, y } = this.gridToPixel(c, r);
        this.scene.add.image(x, y, groundKey).setOrigin(0.5).setDepth(0);
      }
    }

    // 2. Pfad-Kacheln mit hohem Kontrast
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] === 1 || this.grid[r][c] === 4) {
          const { x, y } = this.gridToPixel(c, r);
          this.scene.add.image(x, y, pathKey).setOrigin(0.5).setDepth(1);
        }
      }
    }

    // 3. WEHENDES GRAS (Lebendiges Schlachtfeld)
    if (this.worldId === 'witch_forest') {
      const grassTuftKeys = ['decor_grass_tuft_1', 'decor_grass_tuft_2', 'decor_grass_tuft_3'];

      for (let r = 1; r < 16; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (this.grid[r][c] === 0) {
            // ~45% der Wiesen-Kacheln erhalten animiertes wehendes Gras
            const hash = (c * 37 + r * 19) % 100;
            if (hash < 45) {
              const { x, y } = this.gridToPixel(c, r);
              const tuftType = grassTuftKeys[(c + r) % grassTuftKeys.length];

              // Leicht versetzte Position innerhalb der Kachel
              const offsetX = ((hash % 11) - 5) * 1.5;
              const grassImg = this.scene.add.image(x + offsetX, y + TILE_SIZE / 2 - 2, tuftType);

              // Unten verankert (Origin x=0.5, y=1.0) für natürlichen Halm-Schwung
              grassImg.setOrigin(0.5, 1.0);
              grassImg.setDepth(2);

              // Sanfter Wind-Schwung in Wellenform
              const windDelay = (c * 75 + r * 45) % 1100;
              const windDuration = 1500 + ((c * 17) % 400);

              this.scene.tweens.add({
                targets: grassImg,
                angle: { from: -7, to: 7 },
                skewX: { from: -0.1, to: 0.1 },
                duration: windDuration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: windDelay
              });

              this.grassTufts.set(`${c},${r}`, grassImg);
            }
          }
        }
      }
    }

    // 4. Magische Runen-Bauplätze (+20% Range Bonus)
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

    // 5. Thematische Dekorationen (Pilze, Kristalle, Vulkane)
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] === 2 && r > 0 && r < 16) {
          const { x, y } = this.gridToPixel(c, r);
          this.scene.add.image(x, y, decorKey).setOrigin(0.5).setDepth(2);
        }
      }
    }

    // 6. Startportal & Schloss
    const startPos = this.gridToPixel(this.pathPoints[0].col, this.pathPoints[0].row);
    const endPos = this.gridToPixel(this.pathPoints[this.pathPoints.length - 1].col, this.pathPoints[this.pathPoints.length - 1].row);

    this.scene.add.image(startPos.x, startPos.y, 'tile_portal').setOrigin(0.5).setDepth(4);
    this.scene.add.image(endPos.x, endPos.y, 'tile_castle').setOrigin(0.5).setDepth(4);

    // 7. Aktive Umwelt-Partikel (Glühwürmchen / Funken / Sporen)
    this.spawnAmbientAtmosphere();
  }

  private spawnAmbientAtmosphere(): void {
    const particleCount = this.worldId === 'dead_mountain' ? 24 : 18;
    const isMountain = this.worldId === 'dead_mountain';
    const isWitch = this.worldId === 'witch_forest';

    for (let i = 0; i < particleCount; i++) {
      const px = Phaser.Math.Between(20, GRID_COLS * TILE_SIZE - 20);
      const py = Phaser.Math.Between(50, 16 * TILE_SIZE);

      let color = 0x55efc4;
      let alpha = 0.6;
      let size = 2;

      if (isMountain) {
        color = Math.random() > 0.4 ? 0xff4757 : 0xffa502;
        alpha = 0.75;
        size = 2.5;
      } else if (isWitch) {
        color = Math.random() > 0.5 ? 0x2ecc71 : 0xbe2edd;
      } else {
        color = 0xf1c40f; // Höhlen-Goldstaub
      }

      const p = this.scene.add.circle(px, py, size, color, alpha);
      p.setDepth(20);
      this.ambientParticles.push(p);

      this.scene.tweens.add({
        targets: p,
        y: py - (isMountain ? Phaser.Math.Between(50, 120) : Phaser.Math.Between(20, 60)),
        x: px + Phaser.Math.Between(-25, 25),
        alpha: { from: alpha, to: 0.1 },
        duration: Phaser.Math.Between(2000, 4500),
        repeat: -1,
        yoyo: !isMountain,
        delay: Phaser.Math.Between(0, 2500)
      });
    }
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
      // Grasbüschel unter Turm sanft ausblenden
      const tuft = this.grassTufts.get(`${col},${row}`);
      if (tuft) {
        tuft.setAlpha(0.2);
      }
    }
  }

  public removeTowerAt(col: number, row: number): void {
    if (this.isWithinBounds(col, row)) {
      this.grid[row][col] = this.isRuneTile(col, row) ? 5 : 0;
      // Grasbüschel wiederherstellen
      const tuft = this.grassTufts.get(`${col},${row}`);
      if (tuft) {
        tuft.setAlpha(1.0);
      }
    }
  }
}
