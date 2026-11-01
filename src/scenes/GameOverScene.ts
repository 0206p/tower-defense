import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { WorldId } from '../systems/SaveSystem';

export interface GameOverData {
  worldId?: WorldId;
  missionNumber?: number;
  wave: number;
  score: number;
  gold: number;
  isEndless?: boolean;
  isDungeon?: boolean;
  isNewWaveRecord?: boolean;
  isNewScoreRecord?: boolean;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  public create(data: GameOverData): void {
    const isEndless = !!data.isEndless;
    const isDungeon = !!data.isDungeon;

    const bg = this.add.graphics();
    bg.fillStyle(isDungeon ? 0x0c0617 : 0x1a0d13, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const panel = this.add.graphics();
    panel.fillStyle(isDungeon ? 0x1b0e2b : 0x2d121c, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 320, 80, 640, 550, 10);
    panel.lineStyle(3, isDungeon ? 0xa855f7 : 0x8a2334, 1);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 320, 80, 640, 550, 10);

    const titleText = isDungeon
      ? 'IM DUNGEON GEFALLEN'
      : (isEndless ? 'ENDLOS-LAUF BEENDET' : 'NIEDERLAGE');
    const subText = isDungeon
      ? `Dungeon-Gewölbe - Überrannt in Kammer ${data.wave || 1} von 30!`
      : (isEndless
          ? `Standhaft verteidigt bis Welle ${data.wave || 1}!`
          : `Mission ${data.missionNumber || 1} - Überrannt in Welle ${data.wave || 1}`);

    this.add.text(GAME_WIDTH / 2, 140, titleText, {
      fontFamily: GAME_FONT,
      fontSize: isDungeon ? '34px' : (isEndless ? '34px' : '40px'),
      fontStyle: 'bold',
      color: isDungeon ? '#c084fc' : (isEndless ? '#ffd13b' : '#e84a5f'),
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    if (data.isNewWaveRecord) {
      this.add.text(GAME_WIDTH / 2, 172, '🏆 NEUER WELLEN-REKORD! 🏆', {
        fontFamily: GAME_FONT,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#2ecc71',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
    }

    this.add.text(GAME_WIDTH / 2, data.isNewWaveRecord ? 198 : 185, subText, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: isDungeon ? '#d8b4fe' : '#d4afb6'
    }).setOrigin(0.5);

    // Statistik-Box
    const statBox = this.add.graphics();
    statBox.fillStyle(isDungeon ? 0x11071e : 0x19080e, 0.8);
    statBox.fillRoundedRect(GAME_WIDTH / 2 - 200, 220, 400, 140, 6);
    statBox.lineStyle(2, isDungeon ? 0x4c1d95 : 0x4d1922, 1);
    statBox.strokeRoundedRect(GAME_WIDTH / 2 - 200, 220, 400, 140, 6);

    this.add.text(GAME_WIDTH / 2 - 160, 245, isDungeon ? `Erreichte Kammer:` : `Erreichte Welle:`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 160, 245, isDungeon ? `${data.wave ?? 1} / 30` : (isEndless ? `${data.wave ?? 1} (Endlos)` : `${data.wave ?? 1} / 10`), {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#ffd13b'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 160, 280, `Punkte:`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 160, 280, `${data.score ?? 0}`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#4fc3f7'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 160, 315, `Gold:`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 160, 315, `${data.gold ?? 0} G`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#ffd13b'
    }).setOrigin(1, 0);

    // Tipp
    this.add.text(GAME_WIDTH / 2, 385, 'Tipp: Rüste in der Turm-Schmiede Schaden & Kadenz auf!', {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      color: '#ffd13b',
      align: 'center'
    }).setOrigin(0.5);

    // Buttons
    this.input.setPollAlways();

    this.createButton(GAME_WIDTH / 2, 435, isDungeon ? '🏰 DUNGEON NEU STARTEN' : 'ERNEUT VERSUCHEN', 300, 46, isDungeon ? 0x4a148c : 0x6e1b27, isDungeon ? 0x8e24aa : 0xa82a3d, () => {
      this.scene.start('GameScene', {
        worldId: isDungeon ? 'dungeon' : (data.worldId || 'witch_forest'),
        missionNumber: data.missionNumber || 1,
        isEndless: isEndless,
        isDungeon: isDungeon
      });
    });

    this.createButton(GAME_WIDTH / 2, 490, 'TURM-SCHMIEDE', 300, 44, 0x512b7a, 0x8e44ad, () => {
      this.scene.start('UpgradeMenuScene');
    });

    if (isDungeon) {
      this.createButton(GAME_WIDTH / 2, 545, 'HAUPTMENÜ', 300, 42, 0x2d3436, 0x636e72, () => {
        this.scene.start('MenuScene');
      });
    } else {
      this.createButton(GAME_WIDTH / 2, 545, 'MISSIONSAUSWAHL', 300, 42, 0x2d3436, 0x636e72, () => {
        this.scene.start('MissionSelectScene', { worldId: data.worldId || 'witch_forest' });
      });

      const worldBtn = this.add.text(GAME_WIDTH / 2, 600, 'ZURÜCK ZUR WELTENAUSWAHL', {
        fontFamily: GAME_FONT,
        fontSize: '13px',
        color: '#8a78a5'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      worldBtn.on('pointerdown', () => this.scene.start('WorldSelectScene'));
      worldBtn.on('pointerover', () => worldBtn.setColor('#ffffff'));
      worldBtn.on('pointerout', () => worldBtn.setColor('#8a78a5'));
    }
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
    const renderBg = (hovered: boolean) => {
      bg.clear();
      bg.fillStyle(hovered ? borderColor : color, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
      bg.lineStyle(2, hovered ? 0xffffff : borderColor, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    };
    renderBg(false);
    container.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });

    container.on('pointerdown', onClick);
    container.on('pointerover', () => {
      renderBg(true);
      container.setScale(1.03);
    });
    container.on('pointerout', () => {
      renderBg(false);
      container.setScale(1.0);
    });

    return container;
  }
}
