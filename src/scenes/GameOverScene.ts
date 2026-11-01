import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { WorldId } from '../systems/SaveSystem';

export interface GameOverData {
  worldId?: WorldId;
  missionNumber?: number;
  wave: number;
  score: number;
  gold: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  public create(data: GameOverData): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0d13, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const panel = this.add.graphics();
    panel.fillStyle(0x2d121c, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 320, 80, 640, 550, 10);
    panel.lineStyle(3, 0x8a2334, 1);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 320, 80, 640, 550, 10);

    this.add.text(GAME_WIDTH / 2, 140, 'NIEDERLAGE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '36px',
      color: '#e84a5f'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 185, `Mission ${data.missionNumber || 1} - Überrannt in Welle ${data.wave || 1}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#d4afb6'
    }).setOrigin(0.5);

    // Statistik-Box
    const statBox = this.add.graphics();
    statBox.fillStyle(0x19080e, 0.8);
    statBox.fillRoundedRect(GAME_WIDTH / 2 - 200, 220, 400, 140, 6);
    statBox.lineStyle(2, 0x4d1922, 1);
    statBox.strokeRoundedRect(GAME_WIDTH / 2 - 200, 220, 400, 140, 6);

    this.add.text(GAME_WIDTH / 2 - 160, 245, `Erreichte Welle:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 160, 245, `${data.wave ?? 1} / 10`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffd13b'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 160, 280, `Punkte:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 160, 280, `${data.score ?? 0}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#4fc3f7'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 160, 315, `Gold:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 160, 315, `${data.gold ?? 0} G`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffd13b'
    }).setOrigin(1, 0);

    // Tipp
    this.add.text(GAME_WIDTH / 2, 385, 'Tipp: Rüste in der Turm-Schmiede Schaden & Kadenz auf!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffd13b',
      align: 'center'
    }).setOrigin(0.5);

    // Buttons
    this.createButton(GAME_WIDTH / 2, 435, 'ERNEUT VERSUCHEN', 300, 46, 0x6e1b27, 0xa82a3d, () => {
      this.scene.start('GameScene', {
        worldId: data.worldId || 'witch_forest',
        missionNumber: data.missionNumber || 1
      });
    });

    this.createButton(GAME_WIDTH / 2, 490, 'TURM-SCHMIEDE (UPGRADES)', 300, 44, 0x512b7a, 0x8e44ad, () => {
      this.scene.start('UpgradeMenuScene');
    });

    this.createButton(GAME_WIDTH / 2, 545, 'MISSIONSAUSWAHL', 300, 42, 0x2d3436, 0x636e72, () => {
      this.scene.start('MissionSelectScene', { worldId: data.worldId || 'witch_forest' });
    });

    const worldBtn = this.add.text(GAME_WIDTH / 2, 600, '< ZURÜCK ZUR WELTENAUSWAHL', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#8a78a5'
    }).setOrigin(0.5).setInteractive();

    worldBtn.on('pointerdown', () => this.scene.start('WorldSelectScene'));
    worldBtn.on('pointerover', () => worldBtn.setColor('#ffffff'));
    worldBtn.on('pointerout', () => worldBtn.setColor('#8a78a5'));
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
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
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
