import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../config/GameConfig';
import { TOWER_CONFIGS, TowerType } from '../config/TowerConfig';
import { WORLDS_CONFIG } from '../config/WorldConfig';
import { MapManager } from '../systems/MapManager';
import { EconomySystem } from '../systems/EconomySystem';
import { WaveManager } from '../systems/WaveManager';
import { SaveSystem, WorldId } from '../systems/SaveSystem';
import { SoundManager } from '../systems/SoundManager';
import { Tower } from '../entities/Tower';
import { Projectile } from '../entities/Projectile';
import { HUD } from '../ui/HUD';
import { TowerSelectionBar } from '../ui/TowerSelectionBar';
import { TowerInfoModal } from '../ui/TowerInfoModal';
import { PauseModal } from '../ui/PauseModal';

export class GameScene extends Phaser.Scene {
  private worldId: WorldId = 'witch_forest';
  private missionNumber: number = 1;

  private mapManager!: MapManager;
  private economy!: EconomySystem;
  private waveManager!: WaveManager;
  private hud!: HUD;
  private towerBar!: TowerSelectionBar;
  private infoModal!: TowerInfoModal;
  private pauseModal!: PauseModal;

  private towers: Tower[] = [];
  private selectedTowerType: TowerType | null = null;
  private selectedPlacedTower: Tower | null = null;

  // Placement Preview
  private placementPreviewContainer!: Phaser.GameObjects.Container;
  private previewSprite!: Phaser.GameObjects.Sprite;
  private previewRange!: Phaser.GameObjects.Graphics;
  private previewTileBox!: Phaser.GameObjects.Graphics;

  private isGameOver: boolean = false;
  private isGamePaused: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  public init(data: { worldId?: WorldId; missionNumber?: number }): void {
    if (data.worldId) this.worldId = data.worldId;
    if (data.missionNumber) this.missionNumber = data.missionNumber;
  }

  public create(): void {
    this.isGameOver = false;
    this.isGamePaused = false;
    this.towers = [];
    this.selectedTowerType = null;
    this.selectedPlacedTower = null;
    this.time.timeScale = 1.0;

    // Soundtrack starten
    SoundManager.startMusic();

    // 1. Ökonomie
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

    // 2. Map
    this.mapManager = new MapManager(this, this.worldId, this.missionNumber);
    this.mapManager.renderMap();
    this.spawnWorldAtmosphere();

    // 3. WaveManager
    this.waveManager = new WaveManager(this, this.mapManager, this.economy, this.worldId, this.missionNumber, {
      onWaveChange: (waveNum, total) => {
        this.hud.updateWave(waveNum, total);
        this.hud.setNextWaveButtonEnabled(false, `WELLE ${waveNum} LÄUFT`);
      },
      onWaveCompleted: (waveNum) => {
        SoundManager.playCoin();
        if (waveNum < this.waveManager.getTotalWaves()) {
          this.hud.setNextWaveButtonEnabled(true, `WELLE ${waveNum + 1} STARTEN`);
          this.hud.showAnnouncement(`Welle ${waveNum} überstanden! +${30 + waveNum * 12} Bonusgold`);
        }
      },
      onAllWavesCompleted: () => {
        this.triggerVictory();
      },
      onWaveAnnouncement: (text) => {
        this.hud.showAnnouncement(text);
      }
    });

    // 4. HUD mit 1x, 2x, 3x und Pause
    this.hud = new HUD(this, this.economy.getLives(), this.economy.getGold(), {
      onSpeedChange: (speed) => {
        this.time.timeScale = speed;
      },
      onNextWaveClicked: () => {
        this.waveManager.startNextWave();
      },
      onPauseClicked: () => {
        this.togglePause();
      }
    });

    const worldDef = WORLDS_CONFIG[this.worldId];
    this.hud.showAnnouncement(`${worldDef.name.toUpperCase()} - MISSION ${this.missionNumber}`);

    // 5. Tower Bar mit Stats-Hover-Panel
    this.towerBar = new TowerSelectionBar(this, this.economy, (type) => {
      this.selectedTowerType = type;
      if (type && this.selectedPlacedTower) {
        this.deselectPlacedTower();
      }
      this.updatePlacementPreviewVisibility();
    });

    // 6. Tower Info Modal
    this.infoModal = new TowerInfoModal(this, this.economy, {
      onClose: () => {
        this.deselectPlacedTower();
      },
      onUpgrade: (tower) => {
        SoundManager.playUpgrade();
        tower.upgrade();
        this.towerBar.updateAffordability();
      },
      onSell: (tower) => {
        SoundManager.playCoin();
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

    // 7. Pause-Modal
    this.pauseModal = new PauseModal(this, {
      onResume: () => {
        this.togglePause();
      },
      onQuit: () => {
        SoundManager.stopMusic();
        this.scene.start('MissionSelectScene', { worldId: this.worldId });
      }
    });

    // ESC oder P Taste für Pause
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard?.on('keydown-P', () => this.togglePause());

    // 8. Ghost Preview
    this.createPlacementPreview();

    // 9. Input Pointer
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isGamePaused) return;
      this.handlePointerMove(pointer);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isGamePaused) return;
      if (pointer.button === 0) {
        this.handlePointerDown(pointer);
      } else if (pointer.button === 2) {
        this.towerBar.clearSelection();
        this.deselectPlacedTower();
      }
    });

    this.input.mouse?.disableContextMenu();
  }

  private togglePause(): void {
    if (this.isGameOver) return;
    this.isGamePaused = !this.isGamePaused;

    if (this.isGamePaused) {
      this.time.timeScale = 0;
      this.pauseModal.show();
    } else {
      this.time.timeScale = 1.0;
      this.pauseModal.hide();
    }
  }

  private spawnWorldAtmosphere(): void {
    let particleColor = 0x2ecc71;
    if (this.worldId === 'goblin_caves') particleColor = 0xf39c12;
    else if (this.worldId === 'dead_mountain') particleColor = 0xff4757;

    for (let i = 0; i < 24; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(40, GAME_HEIGHT - 60),
        Phaser.Math.Between(1, 3),
        particleColor,
        0.4
      ).setDepth(3);

      this.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(40, 80),
        x: p.x + Phaser.Math.Between(-30, 30),
        alpha: 0.1,
        duration: Phaser.Math.Between(2500, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createPlacementPreview(): void {
    this.placementPreviewContainer = this.add.container(0, 0);
    this.placementPreviewContainer.setDepth(60);
    this.placementPreviewContainer.setVisible(false);

    this.previewTileBox = this.add.graphics();
    this.placementPreviewContainer.add(this.previewTileBox);

    this.previewSprite = this.add.sprite(0, 0, 'tower_archer_1');
    this.previewSprite.setAlpha(0.75);
    this.placementPreviewContainer.add(this.previewSprite);

    this.previewRange = this.add.graphics();
    this.placementPreviewContainer.add(this.previewRange);
  }

  private updatePlacementPreviewVisibility(): void {
    const visible = this.selectedTowerType !== null;
    this.placementPreviewContainer.setVisible(visible);

    if (visible && this.selectedTowerType) {
      const def = TOWER_CONFIGS[this.selectedTowerType];
      this.previewSprite.setTexture(`tower_${this.selectedTowerType}_1`);

      const mults = SaveSystem.getStatMultipliers(this.selectedTowerType);
      const effectiveRange = Math.round(def.levels[0].range * mults.rangeMult);

      this.previewRange.clear();
      this.previewRange.fillStyle(0x4fc3f7, 0.2);
      this.previewRange.fillCircle(0, 0, effectiveRange);
      this.previewRange.lineStyle(2, 0x4fc3f7, 0.85);
      this.previewRange.strokeCircle(0, 0, effectiveRange);
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
    if (pointer.y <= 44 || pointer.y >= GAME_HEIGHT - 66) {
      return;
    }

    const gridPos = this.mapManager.pixelToGrid(pointer.x, pointer.y);

    if (this.selectedTowerType) {
      const def = TOWER_CONFIGS[this.selectedTowerType];
      if (this.mapManager.canBuildAt(gridPos.col, gridPos.row)) {
        if (this.economy.spendGold(def.baseCost)) {
          SoundManager.playShoot(this.selectedTowerType);
          this.placeTower(gridPos.col, gridPos.row, this.selectedTowerType);

          if (!this.economy.canAfford(def.baseCost)) {
            this.towerBar.clearSelection();
          }
        } else {
          this.hud.showAnnouncement('Nicht genügend Gold!');
        }
      }
      return;
    }

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

    SoundManager.stopMusic();
    this.time.timeScale = 1.0;
    this.cameras.main.fade(600, 40, 10, 15, false, (cam: any, progress: number) => {
      if (progress === 1) {
        this.scene.start('GameOverScene', {
          worldId: this.worldId,
          missionNumber: this.missionNumber,
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

    SoundManager.stopMusic();
    this.time.timeScale = 1.0;
    const livesLeft = this.economy.getLives();
    const starsEarned = livesLeft >= 18 ? 3 : livesLeft >= 8 ? 2 : 1;
    const scoreEarned = this.economy.getScore();

    SaveSystem.completeMission(this.worldId, this.missionNumber, starsEarned, scoreEarned);

    this.cameras.main.fade(700, 15, 40, 25, false, (cam: any, progress: number) => {
      if (progress === 1) {
        this.scene.start('VictoryScene', {
          worldId: this.worldId,
          missionNumber: this.missionNumber,
          score: scoreEarned,
          gold: this.economy.getGold(),
          lives: livesLeft,
          stars: starsEarned
        });
      }
    });
  }

  public update(time: number, delta: number): void {
    if (this.isGameOver || this.isGamePaused) return;

    this.waveManager.update(time, delta);

    for (let i = 0; i < this.towers.length; i++) {
      this.towers[i].update(time, delta);
    }

    const children = this.children.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child instanceof Projectile) {
        child.update(time, delta);
      }
    }
  }
}
