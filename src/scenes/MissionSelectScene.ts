import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { WORLDS_CONFIG } from '../config/WorldConfig';
import { SaveSystem, WorldId } from '../systems/SaveSystem';
import { SoundManager } from '../systems/SoundManager';

export class MissionSelectScene extends Phaser.Scene {
  private worldId: WorldId = 'witch_forest';
  private currentPage: number = 0; // 0: 1-25, 1: 26-50

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

    // Header mit gut lesbarer Schrift
    this.add.text(GAME_WIDTH / 2, 40, `${worldDef.name.toUpperCase()} - MISSIONEN`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: worldDef.textColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const progress = SaveSystem.getData().worlds[this.worldId] || { completedMissions: 0, stars: {} };
    this.add.text(GAME_WIDTH / 2, 75, `Abgeschlossen: ${progress.completedMissions} / 50 Missionen. Jede Mission dauert 10 Wellen.`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#dcdde1',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Grid rendern
    this.renderMissionGrid();

    // Seiten-Tabs
    const pageBtn1 = this.createPageTab(GAME_WIDTH / 2 - 90, 560, '1 - 25', this.currentPage === 0, () => {
      SoundManager.playClick();
      this.currentPage = 0;
      this.scene.restart({ worldId: this.worldId });
    });

    const pageBtn2 = this.createPageTab(GAME_WIDTH / 2 + 90, 560, '26 - 50', this.currentPage === 1, () => {
      SoundManager.playClick();
      this.currentPage = 1;
      this.scene.restart({ worldId: this.worldId });
    });

    // Zurück-Button
    const backBtn = this.add.text(GAME_WIDTH / 2, 630, '< ZURÜCK ZUR WELTENAUSWAHL', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      SoundManager.playClick();
      this.scene.start('WorldSelectScene');
    });
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#ffd13b'));
  }

  private renderMissionGrid(): void {
    const progress = SaveSystem.getData().worlds[this.worldId] || { completedMissions: 0, stars: {} };
    const startMission = this.currentPage * 25 + 1;

    const cols = 5;
    const tileW = 170;
    const tileH = 76;
    const spacingX = 35;
    const spacingY = 14;
    const startX = (GAME_WIDTH - (cols * tileW + (cols - 1) * spacingX)) / 2;
    const startY = 105;

    for (let i = 0; i < 25; i++) {
      const missionNum = startMission + i;
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = startX + c * (tileW + spacingX);
      const y = startY + r * (tileH + spacingY);

      // Verifizierte Freischaltung: Mission 1 ist immer frei, Mission N frei wenn N-1 geschafft
      const isUnlocked = SaveSystem.isMissionUnlocked(this.worldId, missionNum);
      const stars = (progress.stars && progress.stars[missionNum]) ? progress.stars[missionNum] : 0;

      this.createMissionTile(x, y, tileW, tileH, missionNum, isUnlocked, stars);
    }
  }

  private createMissionTile(x: number, y: number, w: number, h: number, missionNum: number, isUnlocked: boolean, stars: number): void {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    if (isUnlocked) {
      bg.fillStyle(0x232033, 0.96);
      bg.fillRoundedRect(0, 0, w, h, 6);
      bg.lineStyle(2, stars > 0 ? 0x2ecc71 : 0x8a78a5, 1);
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
        fontSize: '11px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      container.add(numText);

      let starStr = '';
      for (let s = 1; s <= 3; s++) {
        starStr += s <= stars ? '★ ' : '☆ ';
      }
      const starText = this.add.text(w / 2, 50, starStr.trim(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '13px',
        color: stars > 0 ? '#ffd13b' : '#686075'
      }).setOrigin(0.5);
      container.add(starText);

      container.setSize(w, h);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerdown', () => {
        SoundManager.playClick();
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
        bg.fillStyle(0x232033, 0.96);
        bg.fillRoundedRect(0, 0, w, h, 6);
        bg.lineStyle(2, stars > 0 ? 0x2ecc71 : 0x8a78a5, 1);
        bg.strokeRoundedRect(0, 0, w, h, 6);
      });
    } else {
      const lockText = this.add.text(w / 2, h / 2, `🔒 MISSION ${missionNum}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#57606f'
      }).setOrigin(0.5);
      container.add(lockText);
    }
  }

  private createPageTab(x: number, y: number, label: string, isActive: boolean, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(isActive ? 0x27ae60 : 0x221f2d, 1);
    bg.fillRoundedRect(-55, -18, 110, 36, 4);
    bg.lineStyle(2, isActive ? 0x2ecc71 : 0x3d354a, 1);
    bg.strokeRoundedRect(-55, -18, 110, 36, 4);
    container.add(bg);

    const txt = this.add.text(0, 0, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: isActive ? '#ffffff' : '#8c829e'
    }).setOrigin(0.5);
    container.add(txt);

    container.setSize(110, 36);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', onClick);

    return container;
  }
}
