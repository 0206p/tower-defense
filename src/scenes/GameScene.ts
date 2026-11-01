import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE, GAME_FONT } from '../config/GameConfig';
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
import { logger } from '../systems/GameLogger';

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
  private projectiles: Projectile[] = [];
  private selectedTowerType: TowerType | null = null;
  private selectedPlacedTower: Tower | null = null;

  // Placement Preview
  private placementPreviewContainer!: Phaser.GameObjects.Container;
  private previewSprite!: Phaser.GameObjects.Sprite;
  private previewRange!: Phaser.GameObjects.Graphics;
  private previewTileBox!: Phaser.GameObjects.Graphics;

  // Quick Delete 'X' Button über dem Turm
  private deleteButtonContainer!: Phaser.GameObjects.Container;

  // Drag & Drop Status
  private draggedNewTowerType: TowerType | null = null;
  private repositionTower: Tower | null = null;
  private isRepositionDragging: boolean = false;
  private pointerDownStartPos: { x: number; y: number } | null = null;

  private isGameOver: boolean = false;
  private isGamePaused: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  public init(data: { worldId?: WorldId; missionNumber?: number }): void {
    if (data.worldId) this.worldId = data.worldId;
    if (data.missionNumber) this.missionNumber = data.missionNumber;
    logger.info('GameScene', `Mission initialisiert: Welt=${this.worldId}, Mission=${this.missionNumber}`);
  }

  public create(): void {
    logger.info('GameScene', `Spielfeld geladen: Welt=${this.worldId}, Mission=${this.missionNumber}`);
    this.isGameOver = false;
    this.isGamePaused = false;
    this.towers = [];
    this.projectiles = [];
    this.selectedTowerType = null;
    this.selectedPlacedTower = null;
    this.draggedNewTowerType = null;
    this.repositionTower = null;
    this.isRepositionDragging = false;
    this.pointerDownStartPos = null;
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
        logger.wave(`Welle ${waveNum} / ${total} gestartet`);
        this.hud.updateWave(waveNum, total);
        this.hud.setNextWaveButtonEnabled(false, `WELLE ${waveNum} LÄUFT`);
        this.towerBar.setBuildEnabled(false);
        this.draggedNewTowerType = null;
        this.placementPreviewContainer.setVisible(false);
      },
      onWaveCompleted: (waveNum) => {
        logger.wave(`Welle ${waveNum} überstanden`);
        SoundManager.playCoin();
        this.towerBar.setBuildEnabled(true);
        if (waveNum < this.waveManager.getTotalWaves()) {
          this.hud.setNextWaveButtonEnabled(true, `WELLE ${waveNum + 1} STARTEN`);
          this.hud.showAnnouncement(`Welle ${waveNum} überstanden! +${20 + waveNum * 6} Bonusgold`);
        }
      },
      onAllWavesCompleted: () => {
        logger.wave('Alle Wellen der Mission geschlagen!');
        this.triggerVictory();
      },
      onWaveAnnouncement: (text) => {
        this.hud.showAnnouncement(text);
      }
    });

    // 4. HUD mit 1x, 2x, 3x, Vollbild und Pause
    this.hud = new HUD(this, this.economy.getLives(), this.economy.getGold(), {
      onSpeedChange: (speed) => {
        logger.info('GameSpeed', `Tempo auf ${speed}x gesetzt`);
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

    // 5. Tower Bar mit Drag & Drop und Wellen-Sperre
    this.towerBar = new TowerSelectionBar(this, this.economy, {
      onSelect: (type) => {
        this.selectedTowerType = type;
        if (type && this.selectedPlacedTower) {
          this.deselectPlacedTower();
        }
        this.updatePlacementPreviewVisibility();
      },
      onStartDrag: (type, pointer) => {
        if (this.waveManager.isWaveActive()) {
          this.hud.showAnnouncement('Während einer Welle können keine neuen Türme gebaut werden!');
          return;
        }
        if (this.selectedPlacedTower) {
          this.deselectPlacedTower();
        }
        this.draggedNewTowerType = type;
        this.selectedTowerType = type;
        this.updatePlacementPreviewVisibility();
        this.handlePointerMove(pointer);
      },
      onLockedAttempt: () => {
        this.hud.showAnnouncement('Während einer Welle können keine neuen Türme gebaut werden! Nur Upgrades möglich.');
      },
      onNotEnoughGold: () => {
        this.hud.showAnnouncement('Nicht genügend Gold!');
      }
    });

    // 6. Tower Info Modal
    this.infoModal = new TowerInfoModal(this, this.economy, {
      onClose: () => {
        this.deselectPlacedTower();
      },
      onUpgrade: (tower) => {
        const success = tower.upgrade();
        if (success) {
          logger.tower(`Turm hochgestuft: ${tower.towerType} auf Stufe ${tower.currentLevel}`, {
            type: tower.towerType,
            level: tower.currentLevel,
            col: tower.gridCol,
            row: tower.gridRow
          });
          SoundManager.playUpgrade();
          this.towerBar.updateAffordability();
          this.infoModal.refresh();
          this.showDeleteButton(tower);
        } else {
          this.hud.showAnnouncement('Nicht genügend Gold für Upgrade!');
        }
      },
      onSell: (tower) => {
        this.quickDeleteTower(tower);
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

    // 8. Ghost Preview & Quick Delete 'X' Button
    this.createPlacementPreview();
    this.createDeleteButton();

    // 9. Input Pointer (Drag & Drop + Klick-Handling)
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

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isGamePaused) return;
      this.handlePointerUp(pointer);
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

  private createDeleteButton(): void {
    this.deleteButtonContainer = this.add.container(0, 0);
    this.deleteButtonContainer.setDepth(85);
    this.deleteButtonContainer.setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0xc0392b, 1);
    bg.fillCircle(0, 0, 11);
    bg.lineStyle(2, 0xffffff, 1);
    bg.strokeCircle(0, 0, 11);
    this.deleteButtonContainer.add(bg);

    const xText = this.add.text(0, -1, '✕', {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.deleteButtonContainer.add(xText);

    this.deleteButtonContainer.setSize(24, 24);
    this.deleteButtonContainer.setInteractive(new Phaser.Geom.Circle(0, 0, 13), Phaser.Geom.Circle.Contains);

    this.deleteButtonContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      if (this.selectedPlacedTower) {
        this.quickDeleteTower(this.selectedPlacedTower);
      }
    });

    this.deleteButtonContainer.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0xe74c3c, 1);
      bg.fillCircle(0, 0, 12);
      bg.lineStyle(2, 0xffd13b, 1);
      bg.strokeCircle(0, 0, 12);
    });

    this.deleteButtonContainer.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0xc0392b, 1);
      bg.fillCircle(0, 0, 11);
      bg.lineStyle(2, 0xffffff, 1);
      bg.strokeCircle(0, 0, 11);
    });
  }

  private showDeleteButton(tower: Tower): void {
    this.deleteButtonContainer.setPosition(tower.x + 18, tower.y - 18);
    this.deleteButtonContainer.setVisible(true);
  }

  private hideDeleteButton(): void {
    this.deleteButtonContainer.setVisible(false);
  }

  private quickDeleteTower(tower: Tower): void {
    SoundManager.playCoin();
    this.mapManager.removeTowerAt(tower.gridCol, tower.gridRow);
    const idx = this.towers.indexOf(tower);
    if (idx !== -1) {
      this.towers.splice(idx, 1);
    }
    const refund = tower.sell();
    logger.tower(`Turm gelöscht/verkauft: ${tower.towerType} bei (${tower.gridCol}, ${tower.gridRow})`, {
      type: tower.towerType,
      refund
    });
    this.selectedPlacedTower = null;
    this.hideDeleteButton();
    this.infoModal.hide();
    this.towerBar.updateAffordability();
    this.hud.showAnnouncement(`Turm gelöscht! +${refund}G zurückerhalten.`);
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
    // 1. Neuer Turm Drag Preview
    if (this.draggedNewTowerType || this.selectedTowerType) {
      const currentType = this.draggedNewTowerType || this.selectedTowerType;
      if (!currentType) return;

      const gridPos = this.mapManager.pixelToGrid(pointer.x, pointer.y);
      const pixelPos = this.mapManager.gridToPixel(gridPos.col, gridPos.row);

      this.placementPreviewContainer.setPosition(pixelPos.x, pixelPos.y);

      const inGameField = pointer.y > 44 && pointer.y < GAME_HEIGHT - 66;
      const canBuild = inGameField && this.mapManager.canBuildAt(gridPos.col, gridPos.row);
      const def = TOWER_CONFIGS[currentType];
      const canAfford = this.economy.canAfford(def.baseCost);
      const isValid = canBuild && canAfford && !this.waveManager.isWaveActive();

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
      return;
    }

    // 2. Existierenden Turm repositionieren (Drag)
    if (this.repositionTower && pointer.isDown) {
      if (this.waveManager.isWaveActive()) {
        this.repositionTower = null;
        this.isRepositionDragging = false;
        return;
      }

      if (this.pointerDownStartPos && Math.hypot(pointer.x - this.pointerDownStartPos.x, pointer.y - this.pointerDownStartPos.y) > 8) {
        this.isRepositionDragging = true;
        this.hideDeleteButton();

        const gridPos = this.mapManager.pixelToGrid(pointer.x, pointer.y);
        const pixelPos = this.mapManager.gridToPixel(gridPos.col, gridPos.row);

        this.placementPreviewContainer.setPosition(pixelPos.x, pixelPos.y);
        this.placementPreviewContainer.setVisible(true);
        this.previewSprite.setTexture(`tower_${this.repositionTower.towerType}_${this.repositionTower.currentLevel}`);

        const inGameField = pointer.y > 44 && pointer.y < GAME_HEIGHT - 66;
        const isSameTile = gridPos.col === this.repositionTower.gridCol && gridPos.row === this.repositionTower.gridRow;
        const canBuild = inGameField && (isSameTile || this.mapManager.canBuildAt(gridPos.col, gridPos.row));

        this.previewTileBox.clear();
        if (canBuild) {
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

        const range = this.repositionTower.getEffectiveRange();
        this.previewRange.clear();
        this.previewRange.fillStyle(0x4fc3f7, 0.2);
        this.previewRange.fillCircle(0, 0, range);
        this.previewRange.lineStyle(2, 0x4fc3f7, 0.85);
        this.previewRange.strokeCircle(0, 0, range);
      }
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (pointer.y <= 44 || pointer.y >= GAME_HEIGHT - 66) {
      return;
    }

    // Wenn das TowerInfoModal geöffnet ist und der Klick im Modal liegt: Modal-Klick nicht stören
    if (this.infoModal.visible && pointer.x >= 925 && pointer.y >= 45 && pointer.y <= 380) {
      return;
    }

    const gridPos = this.mapManager.pixelToGrid(pointer.x, pointer.y);

    // Prüfen, ob direkt auf einen platzierten Turm geklickt wurde
    const clickedTower = this.towers.find((t) => t.gridCol === gridPos.col && t.gridRow === gridPos.row);
    if (clickedTower) {
      SoundManager.playClick();
      this.selectPlacedTower(clickedTower, pointer);
      return;
    }

    // Wenn ein Bauturm manuell ausgewählt war und man ins Feld klickt
    if (this.selectedTowerType && !this.draggedNewTowerType) {
      if (this.waveManager.isWaveActive()) {
        this.hud.showAnnouncement('Während einer Welle können keine neuen Türme gebaut werden!');
        this.towerBar.clearSelection();
        return;
      }

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

    // Klick ins leere Feld schließt Auswahl
    if (this.selectedPlacedTower) {
      this.deselectPlacedTower();
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    // 1. Neuer Turm per Drag & Drop
    if (this.draggedNewTowerType) {
      const type = this.draggedNewTowerType;
      this.draggedNewTowerType = null;
      this.selectedTowerType = null;
      this.placementPreviewContainer.setVisible(false);

      const inGameField = pointer.y > 44 && pointer.y < GAME_HEIGHT - 66;
      if (inGameField) {
        const gridPos = this.mapManager.pixelToGrid(pointer.x, pointer.y);
        const def = TOWER_CONFIGS[type];
        if (this.mapManager.canBuildAt(gridPos.col, gridPos.row)) {
          if (!this.waveManager.isWaveActive()) {
            if (this.economy.spendGold(def.baseCost)) {
              SoundManager.playShoot(type);
              this.placeTower(gridPos.col, gridPos.row, type);
            } else {
              this.hud.showAnnouncement('Nicht genügend Gold!');
            }
          } else {
            this.hud.showAnnouncement('Während einer Welle können keine neuen Türme gebaut werden!');
          }
        }
      }
      this.towerBar.clearSelection();
      return;
    }

    // 2. Existierenden Turm repositionieren (Drop)
    if (this.isRepositionDragging && this.repositionTower) {
      const tower = this.repositionTower;
      this.isRepositionDragging = false;
      this.repositionTower = null;
      this.pointerDownStartPos = null;
      this.placementPreviewContainer.setVisible(false);

      const inGameField = pointer.y > 44 && pointer.y < GAME_HEIGHT - 66;
      if (inGameField) {
        const gridPos = this.mapManager.pixelToGrid(pointer.x, pointer.y);
        const isSameTile = gridPos.col === tower.gridCol && gridPos.row === tower.gridRow;

        if (!isSameTile) {
          if (this.mapManager.canBuildAt(gridPos.col, gridPos.row)) {
            // Gültiger neuer Platz!
            this.mapManager.removeTowerAt(tower.gridCol, tower.gridRow);
            this.mapManager.setTowerAt(gridPos.col, gridPos.row);
            tower.gridCol = gridPos.col;
            tower.gridRow = gridPos.row;

            const { x, y } = this.mapManager.gridToPixel(gridPos.col, gridPos.row);
            tower.isRuneEmpowered = this.mapManager.isRuneTile(gridPos.col, gridPos.row);
            tower.updatePosition(x, y);
            this.spawnBuildDust(x, y);
            SoundManager.playClick();
            if (tower.isRuneEmpowered) {
              this.hud.showAnnouncement('Runenstein besetzt! +20% Reichweite!');
            } else {
              this.hud.showAnnouncement('Turm erfolgreich verschoben!');
            }
          } else {
            SoundManager.playDeny();
            this.hud.showAnnouncement('Ungültiges Feld zum Repositionieren!');
          }
        }
      }
      this.showDeleteButton(tower);
      return;
    }

    this.repositionTower = null;
    this.pointerDownStartPos = null;
    this.isRepositionDragging = false;
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
      (selectedTower, pointer) => this.selectPlacedTower(selectedTower, pointer)
    );

    if (this.mapManager.isRuneTile(col, row)) {
      tower.isRuneEmpowered = true;
      tower.updateRangeCircle();
      this.hud.showAnnouncement('Runenstein aktiviert! +20% Reichweiten-Bonus.');
    }

    this.towers.push(tower);
    logger.tower(`Turm platziert: ${type} bei (${col}, ${row})`, {
      type,
      col,
      row,
      isRune: this.mapManager.isRuneTile(col, row)
    });
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

  private selectPlacedTower(tower: Tower, pointer?: Phaser.Input.Pointer): void {
    if (this.selectedPlacedTower && this.selectedPlacedTower !== tower) {
      this.selectedPlacedTower.setSelected(false);
    }
    this.towerBar.clearSelection();
    this.selectedPlacedTower = tower;
    tower.setSelected(true);
    this.infoModal.show(tower);
    this.showDeleteButton(tower);

    if (pointer && !this.waveManager.isWaveActive()) {
      this.repositionTower = tower;
      this.pointerDownStartPos = { x: pointer.x, y: pointer.y };
      this.isRepositionDragging = false;
    }
  }

  private deselectPlacedTower(): void {
    if (this.selectedPlacedTower) {
      this.selectedPlacedTower.setSelected(false);
      this.selectedPlacedTower = null;
    }
    this.hideDeleteButton();
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

    const lives = this.economy.getLives();
    const stars = lives >= 18 ? 3 : lives >= 10 ? 2 : 1;
    const score = this.economy.getScore();
    const gold = this.economy.getGold();

    // Fortschritt speichern
    SaveSystem.completeMission(this.worldId, this.missionNumber, stars, score);

    this.cameras.main.fade(600, 20, 50, 30, false, (cam: any, progress: number) => {
      if (progress === 1) {
        this.scene.start('VictoryScene', {
          worldId: this.worldId,
          missionNumber: this.missionNumber,
          score: score,
          gold: gold,
          lives: lives,
          stars: stars
        });
      }
    });
  }

  public addProjectile(projectile: Projectile): void {
    this.projectiles.push(projectile);
  }

  public removeProjectile(projectile: Projectile): void {
    const idx = this.projectiles.indexOf(projectile);
    if (idx !== -1) {
      this.projectiles.splice(idx, 1);
    }
  }

  public update(time: number, delta: number): void {
    if (this.isGameOver || this.isGamePaused) return;

    // 1. Wellen-Gegner
    this.waveManager.update(time, delta);

    // 2. Türme zielerfassen & schiessen
    for (let i = 0; i < this.towers.length; i++) {
      this.towers[i].update(time, delta);
    }

    // 3. Projektile bewegen & Kollision ausführen
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p && p.active) {
        p.update(time, delta);
      } else {
        this.projectiles.splice(i, 1);
      }
    }
  }
}
