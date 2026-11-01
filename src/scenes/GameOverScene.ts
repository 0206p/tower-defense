import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';

export interface GameOverData {
  wave: number;
  score: number;
  gold: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  public create(data: GameOverData): void {
    // Dunkelroter / dramatischer Hintergrund
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0d13, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Rahmen
    const panel = this.add.graphics();
    panel.fillStyle(0x2d121c, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 320, 100, 640, 500, 10);
    panel.lineStyle(3, 0x8a2334, 1);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 320, 100, 640, 500, 10);

    panel.lineStyle(1, 0xe84a5f, 0.7);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 310, 110, 620, 480, 6);

    // Titel
    this.add.text(GAME_WIDTH / 2, 170, 'NIEDERLAGE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '38px',
      color: '#e84a5f'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 220, 'Die Schlossmauern sind gefallen!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#d4afb6'
    }).setOrigin(0.5);

    // Statistik-Box
    const statBox = this.add.graphics();
    statBox.fillStyle(0x19080e, 0.8);
    statBox.fillRoundedRect(GAME_WIDTH / 2 - 200, 260, 400, 160, 6);
    statBox.lineStyle(2, 0x4d1922, 1);
    statBox.strokeRoundedRect(GAME_WIDTH / 2 - 200, 260, 400, 160, 6);

    this.add.text(GAME_WIDTH / 2 - 160, 290, `Erreichte Welle:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 160, 290, `${data.wave ?? 1} / 10`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffd13b'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 160, 330, `Punktestand:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 160, 330, `${data.score ?? 0}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#4fc3f7'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 160, 370, `Verbliebenes Gold:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 160, 370, `${data.gold ?? 0} G`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffd13b'
    }).setOrigin(1, 0);

    // Neustart-Button
    const restartBtn = this.createButton(GAME_WIDTH / 2, 490, 'ERNEUT VERSUCHEN', 300, 50, 0x6e1b27, 0xa82a3d, () => {
      this.scene.start('GameScene');
    });

    // Zurück zum Hauptmenü
    const menuBtn = this.add.text(GAME_WIDTH / 2, 555, '< ZURÜCK ZUM MENÜ', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#8a78a5'
    }).setOrigin(0.5).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
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
    bg.lineStyle(3, borderColor, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    container.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', onClick);

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x8a2334, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
      bg.lineStyle(3, 0xd43b52, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
      container.setScale(1.04);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
      bg.lineStyle(3, borderColor, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
      container.setScale(1.0);
    });

    return container;
  }
}

