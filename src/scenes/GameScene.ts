import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../config/GameConfig';
import { TOWER_CONFIGS, TowerType } from '../config/TowerConfig';
import { MapManager } from '../systems/MapManager';
import { EconomySystem } from '../systems/EconomySystem';
import { WaveManager } from '../systems/WaveManager';
import { Tower } from '../entities/Tower';
import { Projectile } from '../entities/Projectile';
import { HUD } from '../ui/HUD';
import { TowerSelectionBar } from '../ui/TowerSelectionBar';
import { TowerInfoModal } from '../ui/TowerInfoModal';

export class GameScene extends Phaser.Scene {
  private mapManager!: MapManager;
  private economy!: EconomySystem;
  private waveManager!: WaveManager;
  private hud!: HUD;
  private towerBar!: TowerSelectionBar;
  private infoModal!: TowerInfoModal;

  private towers: Tower[] = [];
  private selectedTowerType: TowerType | null = null;
  private selectedPlacedTower: Tower | null = null;

  // Placement Preview
  private placementPreviewContainer!: Phaser.GameObjects.Container;
  private previewSprite!: Phaser.GameObjects.Sprite;
  private previewRange!: Phaser.GameObjects.Graphics;
  private previewTileBox!: Phaser.GameObjects.Graphics;

  private isGameOver: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  public create(): void {
    this.isGameOver = false;
    this.towers = [];
    this.selectedTowerType = null;
    this.selectedPlacedTower = null;

    // Normale Spielgeschwindigkeit wiederherstellen
    this.time.timeScale = 1.0;

    // 1. Ökonomie initialisieren
    this.economy = new EconomySystem({
      onGoldChanged: (gold) => {
        this.hud.updateGold(gold);
        this.towerBar.updateAffordability();
        this.infoModal.refresh();
      },
      onLivesChanged: (lives) => {
        this.hud.updateLives(lives);
      },
      onScoreChanged: (score) => {
        this.hud.updateScore(score);
      },
      onGameOver: () => {
        this.triggerGameOver();
      }
    });

    // 2. Map rendern
    this.mapManager = new MapManager(this);
    this.mapManager.renderMap();

    // 3. Wellen-Manager initialisieren
    this.waveManager = new WaveManager(this, this.mapManager, this.economy, {
      onWaveChange: (waveNum, total) => {
        this.hud.updateWave(waveNum, total);
        this.hud.setNextWaveButtonEnabled(false, `WELLE ${waveNum} LÄUFT`);
      },
      onWaveCompleted: (waveNum) => {
        if (waveNum < this.waveManager.getTotalWaves()) {
          this.hud.setNextWaveButtonEnabled(true, `WELLE ${waveNum + 1} STARTEN`);
          this.hud.showAnnouncement(`Welle ${waveNum} gemeistert! +${25 + waveNum * 10} Bonusgold`);
        }
      },
      onAllWavesCompleted: () => {
        this.triggerVictory();
      },
      onWaveAnnouncement: (text) => {
        this.hud.showAnnouncement(text);
      }
    });

    // 4. UI: HUD, TowerBar, Modal
    this.hud = new HUD(this, this.economy.getLives(), this.economy.getGold(), {
      onSpeedChange: (speed) => {
        this.time.timeScale = speed;
      },
      onNextWaveClicked: () => {
        this.waveManager.startNextWave();
      }
    });

    this.towerBar = new TowerSelectionBar(this, this.economy, (type) => {
      this.selectedTowerType = type;
      if (type && this.selectedPlacedTower) {
        this.deselectPlacedTower();
      }
      this.updatePlacementPreviewVisibility();
    });

    this.infoModal = new TowerInfoModal(this, this.economy, {
      onClose: () => {
        this.deselectPlacedTower();
      },
      onUpgrade: (tower) => {
        tower.upgrade();
        this.towerBar.updateAffordability();
      },
      onSell: (tower) => {
        this.mapManager.removeTowerAt(tower.gridCol, tower.gridRow);
        const idx = this.towers.indexOf(tower);
        if (idx !== -1) {
          this.towers.splice(idx, 1);
        }
        tower.sell();
        this.selectedPlacedTower = null;
        this.towerBar.updateAffordability();
      }
    });

    // 5. Platzierungs-Vorschau (Ghost)
    this.createPlacementPreview();

    // 6. Input Listener für Maus
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerMove(pointer);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Nur linke Maustaste
      if (pointer.button === 0) {
        this.handlePointerDown(pointer);
      }
    });

    // Rechtsklick bricht Bauen ab
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 2) {
        this.towerBar.clearSelection();
        this.deselectPlacedTower();
      }
    });

    // Willkommens-Ankündigung
    this.time.delayedCall(500, () => {
      this.hud.showAnnouncement('Platziere deine Türme und drücke WELLE STARTEN!');
    });
  }

  private createPlacementPreview(): void {
    this.placementPreviewContainer = this.add.container(0, 0);
    this.placementPreviewContainer.setDepth(60);
    this.placementPreviewContainer.setVisible(false);

    // Kachel-Rahmen (Grün oder Rot)
    this.previewTileBox = this.add.graphics();
    this.placementPreviewContainer.add(this.previewTileBox);

    // Sprite-Vorschau
    this.previewSprite = this.add.sprite(0, 0, 'tower_archer_1');
    this.previewSprite.setAlpha(0.75);
    this.placementPreviewContainer.add(this.previewSprite);

    // Reichweiten-Kreis
    this.previewRange = this.add.graphics();
    this.placementPreviewContainer.add(this.previewRange);
  }

  private updatePlacementPreviewVisibility(): void {
    const visible = this.selectedTowerType !== null;
    this.placementPreviewContainer.setVisible(visible);

    if (visible && this.selectedTowerType) {
      const def = TOWER_CONFIGS[this.selectedTowerType];
      this.previewSprite.setTexture(`tower_${this.selectedTowerType}_1`);

      // Reichweiten-Vorschau neu zeichnen
      this.previewRange.clear();
      this.previewRange.fillStyle(0x4fc3f7, 0.2);
      this.previewRange.fillCircle(0, 0, def.levels[0].range);
      this.previewRange.lineStyle(2, 0x4fc3f7, 0.85);
      this.previewRange.strokeCircle(0, 0, def.levels[0].range);
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.selectedTowerType) return;

    const gridPos = this.mapManager.pixelToGrid(pointer.x, pointer.y);
    const pixelPos = this.mapManager.gridToPixel(gridPos.col, gridPos.row);

    this.placementPreviewContainer.setPosition(pixelPos.x, pixelPos.y);

    const canBuild = this.mapManager.canBuildAt(gridPos.col, gridPos.row);
    const def = TOWER_CONFIGS[this.selectedTowerType];
    const canAfford = this.economy.canAfford(def.baseCost);
    const isValid = canBuild && canAfford;

    this.previewTileBox.clear();
    if (isValid) {
      this.previewTileBox.fillStyle(0x4cd964, 0.35);
      this.previewTileBox.fillRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
      this.previewTileBox.lineStyle(2, 0x4cd964, 0.9);
      this.previewTileBox.strokeRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
      this.previewSprite.setTint(0xffffff);
    } else {
      this.previewTileBox.fillStyle(0xe84a5f, 0.45);
      this.previewTileBox.fillRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
      this.previewTileBox.lineStyle(2, 0xe84a5f, 0.9);
      this.previewTileBox.strokeRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
      this.previewSprite.setTint(0xff5252);
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    // Wenn wir in der HUD-Bar oder Tower-Bar sind, Klick ignorieren
    if (pointer.y <= 44 || pointer.y >= GAME_HEIGHT - 66) {
      return;
    }

    const gridPos = this.mapManager.pixelToGrid(pointer.x, pointer.y);

    // Fall A: Turm bauen
    if (this.selectedTowerType) {
      const def = TOWER_CONFIGS[this.selectedTowerType];
      if (this.mapManager.canBuildAt(gridPos.col, gridPos.row)) {
        if (this.economy.spendGold(def.baseCost)) {
          this.placeTower(gridPos.col, gridPos.row, this.selectedTowerType);

          // Bleibe im Baumodus, wenn der Spieler sich noch einen weiteren Turm leisten kann
          if (!this.economy.canAfford(def.baseCost)) {
            this.towerBar.clearSelection();
          }
        } else {
          this.hud.showAnnouncement('Nicht genügend Gold!');
        }
      }
      return;
    }

    // Fall B: Klick ins Leere schließt das Turm-Info-Fenster
    if (this.selectedPlacedTower) {
      this.deselectPlacedTower();
    }
  }

  private placeTower(col: number, row: number, type: TowerType): void {
    const { x, y } = this.mapManager.gridToPixel(col, row);
    this.mapManager.setTowerAt(col, row);

    const tower = new Tower(
      this,
      col,
      row,
      x,
      y,
      type,
      this.economy,
      () => this.waveManager.getActiveEnemies(),
      (selectedTower) => this.selectPlacedTower(selectedTower)
    );

    this.towers.push(tower);

    // Visueller Aufbaueffekt (Partikelstaub)
    this.spawnBuildDust(x, y);

    this.towerBar.updateAffordability();
  }

  private spawnBuildDust(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const p = this.add.circle(x, y + 10, 3, 0xd4b886, 0.9).setDepth(20);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(10, 24);

      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + 10 + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  private selectPlacedTower(tower: Tower): void {
    if (this.selectedPlacedTower) {
      this.selectedPlacedTower.setSelected(false);
    }
    this.towerBar.clearSelection();
    this.selectedPlacedTower = tower;
    tower.setSelected(true);
    this.infoModal.show(tower);
  }

  private deselectPlacedTower(): void {
    if (this.selectedPlacedTower) {
      this.selectedPlacedTower.setSelected(false);
      this.selectedPlacedTower = null;
    }
    this.infoModal.hide();
  }

  private triggerGameOver(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.time.timeScale = 1.0;
    this.cameras.main.fade(600, 40, 10, 15, false, (cam: any, progress: number) => {
      if (progress === 1) {
        this.scene.start('GameOverScene', {
          wave: this.waveManager.getCurrentWaveNumber(),
          score: this.economy.getScore(),
          gold: this.economy.getGold()
        });
      }
    });
  }

  private triggerVictory(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.time.timeScale = 1.0;
    this.cameras.main.fade(700, 15, 40, 25, false, (cam: any, progress: number) => {
      if (progress === 1) {
        this.scene.start('VictoryScene', {
          score: this.economy.getScore(),
          gold: this.economy.getGold(),
          lives: this.economy.getLives()
        });
      }
    });
  }

  public update(time: number, delta: number): void {
    if (this.isGameOver) return;

    // Wellen-Update
    this.waveManager.update(time, delta);

    // Türme updaten
    for (let i = 0; i < this.towers.length; i++) {
      this.towers[i].update(time, delta);
    }

    // Projektile updaten
    const children = this.children.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child instanceof Projectile) {
        child.update(time, delta);
      }
    }
  }
}

