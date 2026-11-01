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
  private missionNumber: number;
  private grassTufts: Map<string, Phaser.GameObjects.Image> = new Map();
  private ambientParticles: Phaser.GameObjects.GameObject[] = [];
  private streamTiles: GridPoint[] = [];
  private treeTiles: { col: number; row: number; type: 'oak' | 'pine' | 'dead' | 'stalagmite' }[] = [];
  private rockTiles: { col: number; row: number; type: 'granite' | 'ore' | 'volcanic' }[] = [];
  private critters: Phaser.GameObjects.GameObject[] = [];
  private critterTimers: Phaser.Time.TimerEvent[] = [];

  constructor(scene: Phaser.Scene, worldId: WorldId = 'witch_forest', missionNumber: number = 1) {
    this.scene = scene;
    this.worldId = worldId;
    this.missionNumber = missionNumber;
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
    this.generateNaturalLandscape(variantIndex);
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
  }

  private generateNaturalLandscape(variantIndex: number): void {
    this.streamTiles = [];
    this.treeTiles = [];
    this.rockTiles = [];

    // 1. Natürlicher Bach / Flussabschnitt (Hexenwald)
    if (this.worldId === 'witch_forest') {
      const candidateRows = (variantIndex % 2 === 0) ? [14, 15, 1] : [1, 14, 15];
      for (const r of candidateRows) {
        let runStart = -1;
        let runLength = 0;
        let bestRunStart = -1;
        let bestRunLen = 0;

        for (let c = 1; c < GRID_COLS - 1; c++) {
          const rowAboveFree = !this.grid[r - 1] || this.grid[r - 1][c] !== 1;
          const rowBelowFree = !this.grid[r + 1] || this.grid[r + 1][c] !== 1;
          if (this.grid[r][c] === 0 && rowAboveFree && rowBelowFree) {
            if (runStart === -1) runStart = c;
            runLength++;
            if (runLength > bestRunLen) {
              bestRunLen = runLength;
              bestRunStart = runStart;
            }
          } else {
            runStart = -1;
            runLength = 0;
          }
        }

        if (bestRunLen >= 5) {
          const streamLen = Math.min(8, bestRunLen);
          for (let c = bestRunStart; c < bestRunStart + streamLen; c++) {
            this.grid[r][c] = 2; // Hindernis Wasser
            this.streamTiles.push({ col: c, row: r });
          }
          break;
        }
      }
    }

    // 2. Bäume & Baumgruppen platzieren (abseits des Pfades)
    const treeCandidates: GridPoint[] = [
      { col: 1, row: 1 }, { col: 2, row: 2 }, { col: 6, row: 1 },
      { col: 13, row: 1 }, { col: 20, row: 1 }, { col: 29, row: 1 },
      { col: 30, row: 2 }, { col: 1, row: 14 }, { col: 2, row: 15 },
      { col: 15, row: 15 }, { col: 28, row: 14 }, { col: 30, row: 15 },
      { col: 10, row: 6 }, { col: 24, row: 5 }, { col: 16, row: 11 },
      { col: 4, row: 10 }, { col: 21, row: 10 }
    ];

    let treesPlaced = 0;
    const maxTrees = 9;
    treeCandidates.forEach((cand, idx) => {
      if (treesPlaced < maxTrees && this.grid[cand.row] && this.grid[cand.row][cand.col] === 0) {
        this.grid[cand.row][cand.col] = 2;
        let treeType: 'oak' | 'pine' | 'dead' | 'stalagmite' = 'oak';
        if (this.worldId === 'witch_forest') {
          treeType = (idx % 2 === 0) ? 'oak' : 'pine';
        } else if (this.worldId === 'goblin_caves') {
          treeType = 'stalagmite';
        } else {
          treeType = 'dead';
        }
        this.treeTiles.push({ col: cand.col, row: cand.row, type: treeType });
        treesPlaced++;
      }
    });

    // 3. Felsen & Felsformationen
    const rockCandidates: GridPoint[] = [
      { col: 3, row: 1 }, { col: 11, row: 2 }, { col: 18, row: 15 },
      { col: 25, row: 2 }, { col: 7, row: 15 }, { col: 27, row: 13 },
      { col: 12, row: 10 }, { col: 19, row: 5 }
    ];

    let rocksPlaced = 0;
    const maxRocks = 6;
    rockCandidates.forEach((cand) => {
      if (rocksPlaced < maxRocks && this.grid[cand.row] && this.grid[cand.row][cand.col] === 0) {
        this.grid[cand.row][cand.col] = 2;
        let rockType: 'granite' | 'ore' | 'volcanic' = 'granite';
        if (this.worldId === 'goblin_caves') rockType = 'ore';
        else if (this.worldId === 'dead_mountain') rockType = 'volcanic';
        this.rockTiles.push({ col: cand.col, row: cand.row, type: rockType });
        rocksPlaced++;
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

    if (this.worldId === 'goblin_caves') {
      groundKey = 'tile_ground_cave';
      pathKey = 'tile_path_cave';
    } else if (this.worldId === 'dead_mountain') {
      groundKey = 'tile_ground_mountain';
      pathKey = 'tile_path_mountain';
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

    // 5. BÄCHE & WASSERLÄUFE (Hexenwald)
    this.streamTiles.forEach((pt, i) => {
      const { x, y } = this.gridToPixel(pt.col, pt.row);
      this.scene.add.image(x, y, 'decor_water_stream_h').setOrigin(0.5).setDepth(1);

      // Auf jedem 3. Bachabschnitt schwimmt eine zarte Seerose
      if (i % 3 === 1) {
        const lily = this.scene.add.image(x + 2, y, 'decor_water_lily').setOrigin(0.5).setDepth(2);
        this.scene.tweens.add({
          targets: lily,
          y: y - 2,
          x: x - 1,
          angle: { from: -4, to: 4 },
          duration: 1600 + (i * 200),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // 6. BÄUME MIT WIND-SCHWUNG & WURZELSCHATTEN
    this.treeTiles.forEach((tree) => {
      const { x, y } = this.gridToPixel(tree.col, tree.row);
      let texKey = 'decor_tree_oak';
      if (tree.type === 'pine') texKey = 'decor_tree_pine';
      else if (tree.type === 'dead') texKey = 'decor_tree_dead';
      else if (tree.type === 'stalagmite') texKey = 'decor_stalagmite_huge';

      const treeImg = this.scene.add.image(x, y + TILE_SIZE / 2 - 2, texKey).setOrigin(0.5, 1.0).setDepth(3);

      if (tree.type === 'oak' || tree.type === 'pine') {
        this.scene.tweens.add({
          targets: treeImg,
          angle: { from: -2.5, to: 2.5 },
          duration: 2200 + ((tree.col * 31) % 800),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // 7. FELSEN & KRISTALLE
    this.rockTiles.forEach((rock) => {
      const { x, y } = this.gridToPixel(rock.col, rock.row);
      let texKey = 'decor_rock_granite';
      if (rock.type === 'ore') texKey = 'decor_rock_ore';
      else if (rock.type === 'volcanic') texKey = 'decor_rock_volcanic';

      this.scene.add.image(x, y, texKey).setOrigin(0.5).setDepth(2);
    });

    // 8. Startportal & Schloss
    const startPos = this.gridToPixel(this.pathPoints[0].col, this.pathPoints[0].row);
    const endPos = this.gridToPixel(this.pathPoints[this.pathPoints.length - 1].col, this.pathPoints[this.pathPoints.length - 1].row);

    this.scene.add.image(startPos.x, startPos.y, 'tile_portal').setOrigin(0.5).setDepth(4);
    this.scene.add.image(endPos.x, endPos.y, 'tile_castle').setOrigin(0.5).setDepth(4);

    // 9. Aktive Umwelt-Partikel (Glühwürmchen / Funken / Sporen)
    this.spawnAmbientAtmosphere();

    // 10. LEBENDIGE VIECHER (ANIMIERTES WILDLIFE)
    this.spawnWildlifeCritters();
  }

  private spawnWildlifeCritters(): void {
    this.critters.forEach((c) => c.destroy());
    this.critters = [];
    this.critterTimers.forEach((t) => t.destroy());
    this.critterTimers = [];

    const freeTiles: GridPoint[] = [];
    for (let r = 2; r < 15; r++) {
      for (let c = 2; c < GRID_COLS - 2; c++) {
        if (this.grid[r][c] === 0) {
          freeTiles.push({ col: c, row: r });
        }
      }
    }
    if (freeTiles.length === 0) return;

    if (this.worldId === 'witch_forest') {
      // 1. SÜSSE WALD-KANINCHEN (Hüpfen herum & pausieren)
      const rabbitCount = Math.min(3, freeTiles.length);
      for (let i = 0; i < rabbitCount; i++) {
        const tileIdx = (i * 7 + 3) % freeTiles.length;
        const pt = freeTiles[tileIdx];
        const { x, y } = this.gridToPixel(pt.col, pt.row);

        const rabbit = this.scene.add.image(x, y, 'critter_rabbit').setOrigin(0.5).setDepth(4);
        this.critters.push(rabbit);

        this.scene.tweens.add({
          targets: rabbit,
          scaleY: { from: 1.0, to: 1.08 },
          duration: 700 + i * 150,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        const hopTimer = this.scene.time.addEvent({
          delay: Phaser.Math.Between(3500, 6500),
          loop: true,
          callback: () => {
            if (!rabbit.active || !this.scene || !this.scene.sys.isActive()) return;
            const dx = Phaser.Math.Between(-35, 35);
            const dy = Phaser.Math.Between(-20, 20);
            const targetX = Phaser.Math.Clamp(rabbit.x + dx, 50, GRID_COLS * TILE_SIZE - 50);
            const targetY = Phaser.Math.Clamp(rabbit.y + dy, 60, 15 * TILE_SIZE);

            rabbit.setFlipX(dx < 0);

            this.scene.tweens.add({
              targets: rabbit,
              x: targetX,
              duration: 400,
              ease: 'Quad.easeInOut'
            });

            this.scene.tweens.add({
              targets: rabbit,
              y: rabbit.y - 14,
              duration: 200,
              yoyo: true,
              ease: 'Sine.easeOut',
              onComplete: () => {
                if (rabbit.active) rabbit.setY(targetY);
              }
            });
          }
        });
        this.critterTimers.push(hopTimer);
      }

      // 2. SCHILLERNDE SCHMETTERLINGE (Flattern in weichen Kurven)
      const butterflyCount = 4;
      for (let i = 0; i < butterflyCount; i++) {
        const pt = freeTiles[(i * 9 + 5) % freeTiles.length];
        const { x, y } = this.gridToPixel(pt.col, pt.row);

        const butterfly = this.scene.add.image(x, y - 8, 'critter_butterfly').setOrigin(0.5).setDepth(5);
        this.critters.push(butterfly);

        this.scene.tweens.add({
          targets: butterfly,
          scaleX: { from: 1.0, to: 0.15 },
          duration: 90 + i * 15,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        const driftX = Phaser.Math.Between(25, 45) * (i % 2 === 0 ? 1 : -1);
        const driftY = Phaser.Math.Between(15, 30);
        this.scene.tweens.add({
          targets: butterfly,
          x: butterfly.x + driftX,
          y: butterfly.y - driftY,
          duration: 3200 + i * 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else if (this.worldId === 'goblin_caves') {
      // HÖHLEN-FLEDERMÄUSE (Flattern durch die Gewölbe)
      const batCount = 3;
      for (let i = 0; i < batCount; i++) {
        const pt = freeTiles[(i * 8 + 2) % freeTiles.length];
        const { x, y } = this.gridToPixel(pt.col, pt.row);

        const bat = this.scene.add.image(x, y - 10, 'critter_bat').setOrigin(0.5).setDepth(5);
        this.critters.push(bat);

        this.scene.tweens.add({
          targets: bat,
          scaleY: { from: 1.0, to: 0.3 },
          duration: 100 + i * 20,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        this.scene.tweens.add({
          targets: bat,
          x: bat.x + (i % 2 === 0 ? 60 : -60),
          y: bat.y + (i % 2 === 0 ? -25 : 25),
          duration: 2800 + i * 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else if (this.worldId === 'dead_mountain') {
      // FEUER-SALAMANDER (Kriechen auf warmen Felsen)
      const salamanderCount = 3;
      for (let i = 0; i < salamanderCount; i++) {
        const pt = freeTiles[(i * 7 + 4) % freeTiles.length];
        const { x, y } = this.gridToPixel(pt.col, pt.row);

        const sal = this.scene.add.image(x, y, 'critter_salamander').setOrigin(0.5).setDepth(4);
        this.critters.push(sal);

        this.scene.tweens.add({
          targets: sal,
          angle: { from: -4, to: 4 },
          duration: 1100 + i * 250,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        const crawlTimer = this.scene.time.addEvent({
          delay: Phaser.Math.Between(4000, 7000),
          loop: true,
          callback: () => {
            if (!sal.active || !this.scene || !this.scene.sys.isActive()) return;
            const dx = Phaser.Math.Between(-25, 25);
            const targetX = Phaser.Math.Clamp(sal.x + dx, 50, GRID_COLS * TILE_SIZE - 50);
            sal.setFlipX(dx < 0);

            this.scene.tweens.add({
              targets: sal,
              x: targetX,
              duration: 600,
              ease: 'Linear'
            });
          }
        });
        this.critterTimers.push(crawlTimer);
      }
    }
  }

  public destroy(): void {
    this.critters.forEach((c) => c.destroy());
    this.critters = [];
    this.critterTimers.forEach((t) => t.destroy());
    this.critterTimers = [];
    this.ambientParticles.forEach((p) => p.destroy());
    this.ambientParticles = [];
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
