import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { WorldId } from '../systems/SaveSystem';

export interface VictoryData {
  worldId: WorldId;
  missionNumber: number;
  score: number;
  gold: number;
  lives: number;
  stars: number;
}

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  public create(data: VictoryData): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x0e1c12, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const panel = this.add.graphics();
    panel.fillStyle(0x152b1b, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 340, 70, 680, 560, 10);
    panel.lineStyle(3, 0xd4af37, 1);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 340, 70, 680, 560, 10);

    this.add.text(GAME_WIDTH / 2, 130, 'MISSION ERFOLGREICH!', {
      fontFamily: GAME_FONT,
      fontSize: '34px',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 170, `Mission ${data.missionNumber} - Alle 10 Wellen bezwungen!`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#a3e8b0'
    }).setOrigin(0.5);

    // Sterne (1 bis 3)
    let starStr = '';
    for (let s = 1; s <= 3; s++) {
      starStr += s <= (data.stars || 1) ? '★ ' : '☆ ';
    }
    this.add.text(GAME_WIDTH / 2, 215, starStr.trim(), {
      fontFamily: GAME_FONT,
      fontSize: '34px',
      color: '#ffd13b'
    }).setOrigin(0.5);

    // Kristall-Belohnung
    const crystalsEarned = (data.stars || 1) * 25 + 50;
    this.add.image(GAME_WIDTH / 2 - 120, 265, 'icon_crystal').setScale(1.2);
    this.add.text(GAME_WIDTH / 2 - 100, 265, `+${crystalsEarned} Kristalle für die Turm-Schmiede!`, {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#be2edd'
    }).setOrigin(0, 0.5);

    // Statistik-Box
    const statBox = this.add.graphics();
    statBox.fillStyle(0x0a160d, 0.85);
    statBox.fillRoundedRect(GAME_WIDTH / 2 - 220, 300, 440, 150, 6);
    statBox.lineStyle(2, 0x2e5e39, 1);
    statBox.strokeRoundedRect(GAME_WIDTH / 2 - 220, 300, 440, 150, 6);

    this.add.text(GAME_WIDTH / 2 - 180, 325, `Verbliebene Leben:`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 180, 325, `${data.lives ?? 20} / 20`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#e84a5f'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 180, 360, `Verbliebenes Gold:`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 180, 360, `${data.gold ?? 0} G`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#ffd13b'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 180, 395, `Punkte:`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 180, 395, `${data.score ?? 0}`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#4fc3f7'
    }).setOrigin(1, 0);

    // Buttons: Nächste Mission & Zurück
    if (data.missionNumber < 50) {
      this.createButton(GAME_WIDTH / 2, 490, `NÄCHSTE MISSION (${data.missionNumber + 1})`, 320, 46, 0x215428, 0x3d8c47, () => {
        this.scene.start('GameScene', {
          worldId: data.worldId,
          missionNumber: data.missionNumber + 1
        });
      });
    }

    this.createButton(GAME_WIDTH / 2, 545, 'MISSIONSAUSWAHL', 320, 42, 0x2c3e50, 0x483d5a, () => {
      this.scene.start('MissionSelectScene', { worldId: data.worldId });
    });

    const menuBtn = this.add.text(GAME_WIDTH / 2, 605, '< ZURÜCK ZUR WELTENAUSWAHL', {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      color: '#8a78a5'
    }).setOrigin(0.5).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('WorldSelectScene'));
    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#8a78a5'));
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
    color: number,
    borderColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    container.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', onClick);
    container.on('pointerover', () => container.setScale(1.03));
    container.on('pointerout', () => container.setScale(1.0));

    return container;
  }
}
