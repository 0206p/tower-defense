import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { WORLDS_CONFIG } from '../config/WorldConfig';
import { SaveSystem, WorldId } from '../systems/SaveSystem';

export class MissionSelectScene extends Phaser.Scene {
  private worldId: WorldId = 'witch_forest';
  private currentPage: number = 0; // Seite 0: Missionen 1-25, Seite 1: Missionen 26-50

  constructor() {
    super({ key: 'MissionSelectScene' });
  }

  public init(data: { worldId?: WorldId }): void {
    if (data.worldId) {
      this.worldId = data.worldId;
    }
  }

  public create(): void {
    const worldDef = WORLDS_CONFIG[this.worldId];
    const bg = this.add.graphics();
    bg.fillStyle(0x110f17, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Header
    this.add.text(GAME_WIDTH / 2, 40, `${worldDef.name.toUpperCase()} - MISSIONEN`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: worldDef.textColor
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 70, 'Wähle eine Mission (10 Wellen pro Mission). Verdiene bis zu 3 Sterne & Kristalle!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#9e97b0'
    }).setOrigin(0.5);

    // Grid zeichnen
    this.renderMissionGrid();

    // Seiten-Umschalter (1-25 oder 26-50)
    const pageBtn1 = this.createPageTab(GAME_WIDTH / 2 - 80, 560, '1 - 25', this.currentPage === 0, () => {
      this.currentPage = 0;
      this.scene.restart({ worldId: this.worldId });
    });

    const pageBtn2 = this.createPageTab(GAME_WIDTH / 2 + 80, 560, '26 - 50', this.currentPage === 1, () => {
      this.currentPage = 1;
      this.scene.restart({ worldId: this.worldId });
    });

    // Zurück-Button
    const backBtn = this.add.text(GAME_WIDTH / 2, 630, '< ZURÜCK ZUR WELTENAUSWAHL', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffd13b'
    }).setOrigin(0.5).setInteractive();

    backBtn.on('pointerdown', () => this.scene.start('WorldSelectScene'));
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#ffd13b'));
  }

  private renderMissionGrid(): void {
    const progress = SaveSystem.getData().worlds[this.worldId] || { completedMissions: 0, stars: {} };
    const maxUnlocked = progress.completedMissions + 1;

    const startMission = this.currentPage * 25 + 1;
    const endMission = startMission + 24;

    const cols = 5;
    const rows = 5;
    const tileW = 160;
    const tileH = 75;
    const spacingX = 40;
    const spacingY = 16;
    const startX = (GAME_WIDTH - (cols * tileW + (cols - 1) * spacingX)) / 2;
    const startY = 100;

    for (let i = 0; i < 25; i++) {
      const missionNum = startMission + i;
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = startX + c * (tileW + spacingX);
      const y = startY + r * (tileH + spacingY);

      const isUnlocked = missionNum <= maxUnlocked;
      const stars = progress.stars[missionNum] || 0;

      this.createMissionTile(x, y, tileW, tileH, missionNum, isUnlocked, stars);
    }
  }

  private createMissionTile(x: number, y: number, w: number, h: number, missionNum: number, isUnlocked: boolean, stars: number): void {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    if (isUnlocked) {
      bg.fillStyle(0x232033, 0.95);
      bg.fillRoundedRect(0, 0, w, h, 6);
      bg.lineStyle(2, stars > 0 ? 0x27ae60 : 0x8a78a5, 1);
      bg.strokeRoundedRect(0, 0, w, h, 6);
    } else {
      bg.fillStyle(0x16141f, 0.7);
      bg.fillRoundedRect(0, 0, w, h, 6);
      bg.lineStyle(1, 0x332e42, 1);
      bg.strokeRoundedRect(0, 0, w, h, 6);
    }
    container.add(bg);

    if (isUnlocked) {
      const numText = this.add.text(w / 2, 22, `MISSION ${missionNum}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#ffffff'
      }).setOrigin(0.5);
      container.add(numText);

      // Sterne-Anzeige
      let starStr = '';
      for (let s = 1; s <= 3; s++) {
        starStr += s <= stars ? '★ ' : '☆ ';
      }
      const starText = this.add.text(w / 2, 48, starStr.trim(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: stars > 0 ? '#ffd13b' : '#57606f'
      }).setOrigin(0.5);
      container.add(starText);

      container.setSize(w, h);
      container.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

      container.on('pointerdown', () => {
        SaveSystem.getData().selectedMission = missionNum;
        SaveSystem.save();
        this.scene.start('GameScene', {
          worldId: this.worldId,
          missionNumber: missionNum
        });
      });

      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x38334e, 1);
        bg.fillRoundedRect(0, 0, w, h, 6);
        bg.lineStyle(2, 0xd4af37, 1);
        bg.strokeRoundedRect(0, 0, w, h, 6);
      });

      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x232033, 0.95);
        bg.fillRoundedRect(0, 0, w, h, 6);
        bg.lineStyle(2, stars > 0 ? 0x27ae60 : 0x8a78a5, 1);
        bg.strokeRoundedRect(0, 0, w, h, 6);
      });
    } else {
      const lockText = this.add.text(w / 2, h / 2, `🔒 #${missionNum}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#57606f'
      }).setOrigin(0.5);
      container.add(lockText);
    }
  }

  private createPageTab(x: number, y: number, label: string, isActive: boolean, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(isActive ? 0x483d5a : 0x221f2d, 1);
    bg.fillRoundedRect(-50, -16, 100, 32, 4);
    bg.lineStyle(2, isActive ? 0x8a78a5 : 0x3d354a, 1);
    bg.strokeRoundedRect(-50, -16, 100, 32, 4);
    container.add(bg);

    const txt = this.add.text(0, 0, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: isActive ? '#ffffff' : '#8c829e'
    }).setOrigin(0.5);
    container.add(txt);

    container.setSize(100, 32);
    container.setInteractive(new Phaser.Geom.Rectangle(-50, -16, 100, 32), Phaser.Geom.Rectangle.Contains);
    container.on('pointerdown', onClick);

    return container;
  }
}
