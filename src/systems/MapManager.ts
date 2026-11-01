import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GRID_COLS, GRID_ROWS, TILE_SIZE } from '../config/GameConfig';
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
  private treeTiles: { col: number; row: number; type: 'oak' | 'pine' | 'dead' | 'stalagmite' | 'dungeon_pillar' }[] = [];
  private rockTiles: { col: number; row: number; type: 'granite' | 'ore' | 'volcanic' | 'dungeon_torch' }[] = [];
  private critters: Phaser.GameObjects.GameObject[] = [];
  private critterTimers: Phaser.Time.TimerEvent[] = [];
  private mapBgImage?: Phaser.GameObjects.Image;
  private buildGridContainer?: Phaser.GameObjects.Container;

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

    // 4. Das Dungeon-Gewölbe: Finsteres Labyrinth mit rituellen Kammern
    const dungeonVariants: GridPoint[][] = [
      // Variante 1: Katakomben des Schreckens (Doppelt gewundene Halle)
      [
        { col: 0, row: 3 }, { col: 11, row: 3 }, { col: 11, row: 13 },
        { col: 5, row: 13 }, { col: 5, row: 8 }, { col: 19, row: 8 },
        { col: 19, row: 14 }, { col: 26, row: 14 }, { col: 26, row: 5 },
        { col: 31, row: 5 }
      ],
      // Variante 2: Die Kerkerschleife
      [
        { col: 0, row: 6 }, { col: 8, row: 6 }, { col: 8, row: 2 },
        { col: 22, row: 2 }, { col: 22, row: 10 }, { col: 14, row: 10 },
        { col: 14, row: 14 }, { col: 27, row: 14 }, { col: 27, row: 7 },
        { col: 31, row: 7 }
      ],
      // Variante 3: Thronsaal des Dungeon-Lords
      [
        { col: 0, row: 4 }, { col: 12, row: 4 }, { col: 12, row: 12 },
        { col: 18, row: 12 }, { col: 18, row: 4 }, { col: 25, row: 4 },
        { col: 25, row: 11 }, { col: 31, row: 11 }
      ]
    ];

    let currentVariants = witchForestVariants;
    if (this.worldId === 'goblin_caves') {
      currentVariants = goblinCavesVariants;
    } else if (this.worldId === 'dead_mountain') {
      currentVariants = deadMountainVariants;
    } else if (this.worldId === 'dungeon') {
      currentVariants = dungeonVariants;
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
        let treeType: 'oak' | 'pine' | 'dead' | 'stalagmite' | 'dungeon_pillar' = 'oak';
        if (this.worldId === 'witch_forest') {
          treeType = (idx % 2 === 0) ? 'oak' : 'pine';
        } else if (this.worldId === 'goblin_caves') {
          treeType = 'stalagmite';
        } else if (this.worldId === 'dead_mountain') {
          treeType = 'dead';
        } else {
          treeType = 'dungeon_pillar';
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
        let rockType: 'granite' | 'ore' | 'volcanic' | 'dungeon_torch' = 'granite';
        if (this.worldId === 'goblin_caves') rockType = 'ore';
        else if (this.worldId === 'dead_mountain') rockType = 'volcanic';
        else if (this.worldId === 'dungeon') rockType = 'dungeon_torch';
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
    const points = this.pathPoints.map((pt) => this.gridToPixel(pt.col, pt.row));
    if (points.length === 0) return;

    this.curvePath = this.scene.add.path(points[0].x, points[0].y);
    const cornerRadius = 14;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const next = i < points.length - 1 ? points[i + 1] : null;

      if (!next) {
        this.curvePath.lineTo(cur.x, cur.y);
      } else {
        const dx1 = Math.sign(cur.x - prev.x);
        const dy1 = Math.sign(cur.y - prev.y);
        const dx2 = Math.sign(next.x - cur.x);
        const dy2 = Math.sign(next.y - cur.y);

        if (dx1 !== dx2 || dy1 !== dy2) {
          const startX = cur.x - dx1 * cornerRadius;
          const startY = cur.y - dy1 * cornerRadius;
          const endX = cur.x + dx2 * cornerRadius;
          const endY = cur.y + dy2 * cornerRadius;

          this.curvePath.lineTo(startX, startY);
          this.curvePath.quadraticBezierTo(endX, endY, cur.x, cur.y);
        } else {
          this.curvePath.lineTo(cur.x, cur.y);
        }
      }
    }
  }

  private createModernBattlefieldTexture(key: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Deterministischer Seed pro Mission für individuelle Map-Details
    let seed = (this.missionNumber * 9301 + 49297) % 233280;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // 1. TERRAIN BASIS-GRADIENT
    let topColor = '#1d361a';
    let midColor = '#254821';
    let botColor = '#1a3318';
    let vergeColor = '#3f2815';
    let roadColor = '#6d4c2b';

    if (this.worldId === 'goblin_caves') {
      topColor = '#161320';
      midColor = '#211a30';
      botColor = '#14111d';
      vergeColor = '#1e1a2b';
      roadColor = '#2c273a';
    } else if (this.worldId === 'dead_mountain') {
      topColor = '#170f13';
      midColor = '#251319';
      botColor = '#150d11';
      vergeColor = '#2c1418';
      roadColor = '#28161a';
    } else if (this.worldId === 'dungeon') {
      topColor = '#130f1c';
      midColor = '#1d152a';
      botColor = '#110e19';
      vergeColor = '#2a1f38';
      roadColor = '#272036';
    }

    const bgGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    bgGrad.addColorStop(0, topColor);
    bgGrad.addColorStop(0.5, midColor);
    bgGrad.addColorStop(1, botColor);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 2. WELTSPEZIFISCHE TEXTUREN & DETAILS
    if (this.worldId === 'witch_forest') {
      // Weiche Moos- & Waldboden-Schattierungen
      for (let i = 0; i < 45; i++) {
        const cx = rnd() * GAME_WIDTH;
        const cy = 44 + rnd() * (GAME_HEIGHT - 110);
        const cr = 40 + rnd() * 80;
        const pGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, cr);
        pGrad.addColorStop(0, rnd() > 0.5 ? 'rgba(48, 92, 42, 0.28)' : 'rgba(20, 40, 18, 0.35)');
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wiesen-Punkte (Grasfäden & zarte Waldblumen)
      for (let i = 0; i < 90; i++) {
        const fx = rnd() * GAME_WIDTH;
        const fy = 44 + rnd() * (GAME_HEIGHT - 110);
        const col = Math.floor(fx / TILE_SIZE);
        const row = Math.floor(fy / TILE_SIZE);
        if (this.grid[row] && this.grid[row][col] === 0) {
          ctx.fillStyle = rnd() > 0.6 ? 'rgba(245, 230, 211, 0.6)' : 'rgba(126, 214, 223, 0.45)';
          ctx.beginPath();
          ctx.arc(fx, fy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (this.worldId === 'goblin_caves') {
      // Unterirdische Gesteinsschichten
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = 'rgba(38, 30, 52, 0.45)';
        ctx.lineWidth = 14 + rnd() * 12;
        ctx.beginPath();
        const startY = 80 + i * 110 + rnd() * 30;
        ctx.moveTo(0, startY);
        ctx.bezierCurveTo(400, startY - 25, 800, startY + 25, GAME_WIDTH, startY - 10);
        ctx.stroke();
      }

      // Fluoreszierendes Höhlenmoos
      for (let i = 0; i < 18; i++) {
        const mx = rnd() * GAME_WIDTH;
        const my = 44 + rnd() * (GAME_HEIGHT - 110);
        const mr = 25 + rnd() * 45;
        const mGrad = ctx.createRadialGradient(mx, my, 1, mx, my, mr);
        mGrad.addColorStop(0, 'rgba(18, 137, 142, 0.22)');
        mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Gold- und Erzglimmer
      for (let i = 0; i < 65; i++) {
        const ex = rnd() * GAME_WIDTH;
        const ey = 44 + rnd() * (GAME_HEIGHT - 110);
        ctx.fillStyle = rnd() > 0.4 ? 'rgba(241, 196, 15, 0.45)' : 'rgba(230, 126, 34, 0.35)';
        ctx.fillRect(ex, ey, 2, 2);
      }
    } else if (this.worldId === 'dead_mountain') {
      // Magma-Adern & Vulkanglut im Boden
      for (let i = 0; i < 22; i++) {
        const lx = rnd() * GAME_WIDTH;
        const ly = 44 + rnd() * (GAME_HEIGHT - 110);
        const lr = 35 + rnd() * 65;
        const lGrad = ctx.createRadialGradient(lx, ly, 1, lx, ly, lr);
        lGrad.addColorStop(0, 'rgba(235, 77, 45, 0.28)');
        lGrad.addColorStop(0.6, 'rgba(211, 84, 0, 0.12)');
        lGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dunkle Aschespuren
      for (let i = 0; i < 30; i++) {
        const ax = rnd() * GAME_WIDTH;
        const ay = 44 + rnd() * (GAME_HEIGHT - 110);
        ctx.fillStyle = 'rgba(10, 7, 10, 0.45)';
        ctx.beginPath();
        ctx.ellipse(ax, ay, 20 + rnd() * 30, 8 + rnd() * 12, rnd() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.worldId === 'dungeon') {
      // Gotische Fliesen-Fugen
      ctx.strokeStyle = 'rgba(65, 52, 85, 0.25)';
      ctx.lineWidth = 1;
      for (let c = 0; c <= GRID_COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * TILE_SIZE, 44);
        ctx.lineTo(c * TILE_SIZE, GAME_HEIGHT - 66);
        ctx.stroke();
      }
      for (let r = 1; r <= 16; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * TILE_SIZE);
        ctx.lineTo(GAME_WIDTH, r * TILE_SIZE);
        ctx.stroke();
      }

      // Edle Boden-Lichtreflexe
      for (let i = 0; i < 14; i++) {
        const dx = rnd() * GAME_WIDTH;
        const dy = 44 + rnd() * (GAME_HEIGHT - 110);
        ctx.fillStyle = 'rgba(168, 140, 215, 0.08)';
        ctx.beginPath();
        ctx.ellipse(dx, dy, 35, 12, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. ORGANISCHER FLIESSENDER PFAD (Multi-Pass Rendering mit runden Kurven)
    const pts = this.pathPoints.map((p) => this.gridToPixel(p.col, p.row));
    if (pts.length > 1) {
      const tracePath = (c: CanvasRenderingContext2D, r: number = 16) => {
        c.beginPath();
        c.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1];
          const cur = pts[i];
          const next = i < pts.length - 1 ? pts[i + 1] : null;

          if (!next) {
            c.lineTo(cur.x, cur.y);
          } else {
            const dx1 = Math.sign(cur.x - prev.x);
            const dy1 = Math.sign(cur.y - prev.y);
            const dx2 = Math.sign(next.x - cur.x);
            const dy2 = Math.sign(next.y - cur.y);

            if (dx1 !== dx2 || dy1 !== dy2) {
              const sX = cur.x - dx1 * r;
              const sY = cur.y - dy1 * r;
              const eX = cur.x + dx2 * r;
              const eY = cur.y + dy2 * r;
              c.lineTo(sX, sY);
              c.quadraticCurveTo(cur.x, cur.y, eX, eY);
            } else {
              c.lineTo(cur.x, cur.y);
            }
          }
        }
      };

      // Pass 1: Tiefenschatten-Graben
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.lineWidth = 44;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      tracePath(ctx, 16);
      ctx.stroke();
      ctx.restore();

      // Pass 2: Weicher Wegrand / Böschung
      ctx.save();
      ctx.strokeStyle = vergeColor;
      ctx.lineWidth = 38;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      tracePath(ctx, 15);
      ctx.stroke();
      ctx.restore();

      // Pass 3: Haupt-Fahrbahn
      ctx.save();
      ctx.strokeStyle = roadColor;
      ctx.lineWidth = 32;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      tracePath(ctx, 14);
      ctx.stroke();
      ctx.restore();

      // Pass 4: Welt-spezifische Gleise & Weg-Details
      for (let i = 1; i < pts.length; i++) {
        const p1 = pts[i - 1];
        const p2 = pts[i];
        const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (segDist <= 0) continue;

        const ux = (p2.x - p1.x) / segDist;
        const uy = (p2.y - p1.y) / segDist;
        const nx = -uy;
        const ny = ux;

        if (this.worldId === 'witch_forest') {
          // Doppelte Kutschen-Wagenspuren
          ctx.strokeStyle = '#54371e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(p1.x + nx * 7, p1.y + ny * 7);
          ctx.lineTo(p2.x + nx * 7, p2.y + ny * 7);
          ctx.moveTo(p1.x - nx * 7, p1.y - ny * 7);
          ctx.lineTo(p2.x - nx * 7, p2.y - ny * 7);
          ctx.stroke();
        } else if (this.worldId === 'goblin_caves') {
          // Authentische Minen-Gleise: 1. Holz-Schwellen
          for (let d = 10; d < segDist - 6; d += 20) {
            const sx = p1.x + ux * d;
            const sy = p1.y + uy * d;
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 6;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(sx - nx * 14, sy - ny * 14);
            ctx.lineTo(sx + nx * 14, sy + ny * 14);
            ctx.stroke();

            // Hellerer Holz-Mittelstrich
            ctx.strokeStyle = '#5d4037';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sx - nx * 12, sy - ny * 12);
            ctx.lineTo(sx + nx * 12, sy + ny * 12);
            ctx.stroke();
          }

          // 2. Parallele Stahl-Schienen
          ctx.strokeStyle = '#7f8c8d';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x + nx * 8, p1.y + ny * 8);
          ctx.lineTo(p2.x + nx * 8, p2.y + ny * 8);
          ctx.moveTo(p1.x - nx * 8, p1.y - ny * 8);
          ctx.lineTo(p2.x - nx * 8, p2.y - ny * 8);
          ctx.stroke();

          // Metallischer Glanz
          ctx.strokeStyle = '#ecf0f1';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p1.x + nx * 8, p1.y + ny * 8);
          ctx.lineTo(p2.x + nx * 8, p2.y + ny * 8);
          ctx.moveTo(p1.x - nx * 8, p1.y - ny * 8);
          ctx.lineTo(p2.x - nx * 8, p2.y - ny * 8);
          ctx.stroke();
        } else if (this.worldId === 'dead_mountain') {
          // Lodernder Magma-Riss im Pfad
          ctx.strokeStyle = '#ff4757';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          ctx.strokeStyle = '#ffa502';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        } else if (this.worldId === 'dungeon') {
          // Goldverzierte Palast-Bordüren
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x + nx * 12, p1.y + ny * 12);
          ctx.lineTo(p2.x + nx * 12, p2.y + ny * 12);
          ctx.moveTo(p1.x - nx * 12, p1.y - ny * 12);
          ctx.lineTo(p2.x - nx * 12, p2.y - ny * 12);
          ctx.stroke();

          // Steinplatten-Rillen alle 36 Pixel
          for (let d = 16; d < segDist - 8; d += 36) {
            const rx = p1.x + ux * d;
            const ry = p1.y + uy * d;
            ctx.strokeStyle = '#1b1528';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rx - nx * 11, ry - ny * 11);
            ctx.lineTo(rx + nx * 11, ry + ny * 11);
            ctx.stroke();
          }
        }
      }
    }

    const tex = this.scene.textures.addCanvas(key, canvas);
    if (tex) {
      tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }

  private createBuildGridOverlay(): void {
    if (this.buildGridContainer) {
      this.buildGridContainer.destroy();
    }

    this.buildGridContainer = this.scene.add.container(0, 0);
    this.buildGridContainer.setDepth(25);
    this.buildGridContainer.setVisible(false);

    const gfx = this.scene.add.graphics();
    this.buildGridContainer.add(gfx);

    const bLen = 6;

    for (let r = 1; r < 16; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cellType = this.grid[r][c];
        const { x, y } = this.gridToPixel(c, r);
        const half = TILE_SIZE / 2 - 2;

        if (cellType === 0) {
          // Subtile moderne Eck-Klammern (Cyan)
          gfx.lineStyle(1.5, 0x5eead4, 0.45);
          gfx.strokeLineShape(new Phaser.Geom.Line(x - half, y - half, x - half + bLen, y - half));
          gfx.strokeLineShape(new Phaser.Geom.Line(x - half, y - half, x - half, y - half + bLen));

          gfx.strokeLineShape(new Phaser.Geom.Line(x + half, y - half, x + half - bLen, y - half));
          gfx.strokeLineShape(new Phaser.Geom.Line(x + half, y - half, x + half, y - half + bLen));

          gfx.strokeLineShape(new Phaser.Geom.Line(x - half, y + half, x - half + bLen, y + half));
          gfx.strokeLineShape(new Phaser.Geom.Line(x - half, y + half, x - half, y + half - bLen));

          gfx.strokeLineShape(new Phaser.Geom.Line(x + half, y + half, x + half - bLen, y + half));
          gfx.strokeLineShape(new Phaser.Geom.Line(x + half, y + half, x + half, y + half - bLen));
        } else if (cellType === 5) {
          // Runenstein-Bauplatz: Glühender Magiekreis
          gfx.fillStyle(0x8e44ad, 0.25);
          gfx.fillCircle(x, y, 16);
          gfx.lineStyle(2, 0xe056fd, 0.85);
          gfx.strokeCircle(x, y, 16);
          gfx.lineStyle(1.5, 0xffd13b, 0.9);
          gfx.strokeCircle(x, y, 11);
        }
      }
    }
  }

  public showBuildGrid(visible: boolean): void {
    if (this.buildGridContainer) {
      this.buildGridContainer.setVisible(visible);
    }
  }

  public renderMap(): void {
    const bgKey = `modern_map_${this.worldId}_m${this.missionNumber}`;
    if (!this.scene.textures.exists(bgKey)) {
      this.createModernBattlefieldTexture(bgKey);
    }

    if (this.mapBgImage) {
      this.mapBgImage.destroy();
    }
    this.mapBgImage = this.scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgKey).setOrigin(0.5).setDepth(0);

    // Modernes, taktisches Bau-Gitter initialisieren (nur beim Bauen/Verschieben sichtbar)
    this.createBuildGridOverlay();

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

    // 6. ENERGIE-PYLONEN, KRISTALLE & INDUSTRIE-GEBILDE
    this.treeTiles.forEach((tree) => {
      const { x, y } = this.gridToPixel(tree.col, tree.row);
      let texKey = 'decor_tree_oak';
      if (tree.type === 'pine') texKey = 'decor_tree_pine';
      else if (tree.type === 'dead') texKey = 'decor_tree_dead';
      else if (tree.type === 'stalagmite') texKey = 'decor_stalagmite_huge';
      else if (tree.type === 'dungeon_pillar') texKey = 'decor_dungeon_pillar';

      const treeImg = this.scene.add.image(x, y + TILE_SIZE / 2 - 2, texKey).setOrigin(0.5, 1.0).setDepth(3);

      // Sanfter Energie-Puls statt Baum-Biegen
      this.scene.tweens.add({
        targets: treeImg,
        alpha: { from: 0.88, to: 1.0 },
        duration: 1800 + ((tree.col * 31) % 800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // 7. FELSEN & KRISTALLE
    this.rockTiles.forEach((rock) => {
      const { x, y } = this.gridToPixel(rock.col, rock.row);
      let texKey = 'decor_rock_granite';
      if (rock.type === 'ore') texKey = 'decor_rock_ore';
      else if (rock.type === 'volcanic') texKey = 'decor_rock_volcanic';
      else if (rock.type === 'dungeon_torch') texKey = 'decor_dungeon_torch';

      const rockImg = this.scene.add.image(x, y, texKey).setOrigin(0.5).setDepth(2);
      if (rock.type === 'dungeon_torch') {
        this.scene.tweens.add({
          targets: rockImg,
          alpha: { from: 0.85, to: 1.0 },
          scaleY: { from: 0.96, to: 1.04 },
          duration: 400 + Math.random() * 300,
          yoyo: true,
          repeat: -1
        });
      }
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
      // 1. TAKTISCHE AUFKLÄRUNGS-DROHNEN (Hovern geschmeidig & scannen den Sektor)
      const droneCount = Math.min(3, freeTiles.length);
      for (let i = 0; i < droneCount; i++) {
        const tileIdx = (i * 7 + 3) % freeTiles.length;
        const pt = freeTiles[tileIdx];
        const { x, y } = this.gridToPixel(pt.col, pt.row);

        const drone = this.scene.add.image(x, y - 6, 'critter_rabbit').setOrigin(0.5).setDepth(4);
        this.critters.push(drone);

        // Sanftes Antigravitations-Schweben
        this.scene.tweens.add({
          targets: drone,
          y: drone.y - 4,
          duration: 900 + i * 200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        const patrolTimer = this.scene.time.addEvent({
          delay: Phaser.Math.Between(4000, 7000),
          loop: true,
          callback: () => {
            if (!drone.active || !this.scene || !this.scene.sys.isActive()) return;
            const dx = Phaser.Math.Between(-45, 45);
            const dy = Phaser.Math.Between(-25, 25);
            const targetX = Phaser.Math.Clamp(drone.x + dx, 50, GRID_COLS * TILE_SIZE - 50);
            const targetY = Phaser.Math.Clamp(drone.y + dy, 60, 15 * TILE_SIZE);

            drone.setFlipX(dx < 0);

            // Taktischer Ionen-Gleitflug zum Zielpunkt
            this.scene.tweens.add({
              targets: drone,
              x: targetX,
              y: targetY - 6,
              duration: 850,
              ease: 'Cubic.easeInOut'
            });
          }
        });
        this.critterTimers.push(patrolTimer);
      }

      // 2. ORBITALE MIKRO-SONDEN (Rotieren und gleiten in Ionenbahnen)
      const probeCount = 4;
      for (let i = 0; i < probeCount; i++) {
        const pt = freeTiles[(i * 9 + 5) % freeTiles.length];
        const { x, y } = this.gridToPixel(pt.col, pt.row);

        const probe = this.scene.add.image(x, y - 8, 'critter_butterfly').setOrigin(0.5).setDepth(5);
        this.critters.push(probe);

        this.scene.tweens.add({
          targets: probe,
          angle: 360,
          duration: 4000 + i * 500,
          repeat: -1,
          ease: 'Linear'
        });

        const driftX = Phaser.Math.Between(30, 50) * (i % 2 === 0 ? 1 : -1);
        const driftY = Phaser.Math.Between(15, 30);
        this.scene.tweens.add({
          targets: probe,
          x: probe.x + driftX,
          y: probe.y - driftY,
          duration: 3500 + i * 400,
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
    } else if (this.worldId === 'dungeon') {
      // 4. Dungeon-Gewölbe: Krabbelnde Höhlenspinnen
      const spiderCount = 5;
      for (let i = 0; i < spiderCount; i++) {
        const sx = Phaser.Math.Between(80, GRID_COLS * TILE_SIZE - 80);
        const sy = Phaser.Math.Between(90, 15 * TILE_SIZE);
        const spider = this.scene.add.image(sx, sy, 'critter_spider').setOrigin(0.5).setDepth(2);
        this.critters.push(spider);

        const spiderTimer = this.scene.time.addEvent({
          delay: Phaser.Math.Between(2500, 5000),
          loop: true,
          callback: () => {
            if (!spider.active || !this.scene || !this.scene.sys.isActive()) return;
            const dx = Phaser.Math.Between(-35, 35);
            const dy = Phaser.Math.Between(-15, 15);
            const targetX = Phaser.Math.Clamp(spider.x + dx, 50, GRID_COLS * TILE_SIZE - 50);
            const targetY = Phaser.Math.Clamp(spider.y + dy, 60, 15 * TILE_SIZE);
            spider.setFlipX(dx < 0);

            this.scene.tweens.add({
              targets: spider,
              x: targetX,
              y: targetY,
              duration: 450,
              ease: 'Power1'
            });
          }
        });
        this.critterTimers.push(spiderTimer);
      }
    }
  }

  public destroy(): void {
    if (this.mapBgImage) {
      this.mapBgImage.destroy();
      this.mapBgImage = undefined;
    }
    if (this.buildGridContainer) {
      this.buildGridContainer.destroy();
      this.buildGridContainer = undefined;
    }
    this.critters.forEach((c) => c.destroy());
    this.critters = [];
    this.critterTimers.forEach((t) => t.destroy());
    this.critterTimers = [];
    this.ambientParticles.forEach((p) => p.destroy());
    this.ambientParticles = [];
  }

  private spawnAmbientAtmosphere(): void {
    const particleCount = this.worldId === 'dead_mountain' ? 24 : (this.worldId === 'dungeon' ? 22 : 18);
    const isMountain = this.worldId === 'dead_mountain';
    const isWitch = this.worldId === 'witch_forest';
    const isDungeon = this.worldId === 'dungeon';

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
      } else if (isDungeon) {
        color = Math.random() > 0.4 ? 0xa855f7 : 0x7c3aed;
        alpha = 0.75;
        size = 2.2;
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
        y: py - (isMountain || isDungeon ? Phaser.Math.Between(50, 120) : Phaser.Math.Between(20, 60)),
        x: px + Phaser.Math.Between(-25, 25),
        alpha: { from: alpha, to: 0.1 },
        duration: Phaser.Math.Between(2000, 4500),
        repeat: -1,
        yoyo: !isMountain && !isDungeon,
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
