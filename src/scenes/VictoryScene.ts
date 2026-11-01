import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';

export interface VictoryData {
  score: number;
  gold: number;
  lives: number;
}

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  public create(data: VictoryData): void {
    // Dunkelgrün-goldener triumphaler Hintergrund
    const bg = this.add.graphics();
    bg.fillStyle(0x0e1c12, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Rahmen
    const panel = this.add.graphics();
    panel.fillStyle(0x152b1b, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 340, 80, 680, 530, 10);
    panel.lineStyle(3, 0xd4af37, 1);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 340, 80, 680, 530, 10);

    panel.lineStyle(1, 0x5cd670, 0.7);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 330, 90, 660, 510, 6);

    // Titel
    this.add.text(GAME_WIDTH / 2, 150, 'GLORREICHER SIEG!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ffd13b'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 195, 'Alle 10 Monsterwellen wurden vernichtet!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#a3e8b0'
    }).setOrigin(0.5);

    // Deko: Goldkronen-Icon / Sterne
    const crown = this.add.text(GAME_WIDTH / 2, 230, '★ ★ ★', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#ffd13b'
    }).setOrigin(0.5);

    // Statistik-Box
    const statBox = this.add.graphics();
    statBox.fillStyle(0x0a160d, 0.85);
    statBox.fillRoundedRect(GAME_WIDTH / 2 - 220, 265, 440, 180, 6);
    statBox.lineStyle(2, 0x2e5e39, 1);
    statBox.strokeRoundedRect(GAME_WIDTH / 2 - 220, 265, 440, 180, 6);

    this.add.text(GAME_WIDTH / 2 - 180, 295, `Verbliebene Leben:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 180, 295, `${data.lives ?? 20} / 20`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#e84a5f'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 180, 335, `Verbliebenes Gold:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 180, 335, `${data.gold ?? 0} G`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffd13b'
    }).setOrigin(1, 0);

    // Gesamtscore berechnen
    const finalScore = (data.score ?? 0) + (data.lives ?? 0) * 100 + (data.gold ?? 0);
    this.add.text(GAME_WIDTH / 2 - 180, 375, `Basis-Punkte:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f5f0e6'
    });
    this.add.text(GAME_WIDTH / 2 + 180, 375, `${data.score ?? 0}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#4fc3f7'
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2 - 180, 410, `GESAMTERGEBNIS:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#5cd670'
    });
    this.add.text(GAME_WIDTH / 2 + 180, 410, `${finalScore}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffd13b'
    }).setOrigin(1, 0);

    // Weiterspielen / Nochmal spielen Button
    const againBtn = this.createButton(GAME_WIDTH / 2, 495, 'NOCHMAL SPIELEN', 300, 50, 0x215428, 0x3d8c47, () => {
      this.scene.start('GameScene');
    });

    // Hauptmenü
    const menuBtn = this.add.text(GAME_WIDTH / 2, 560, '< ZURÜCK ZUM MENÜ', {
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
      bg.fillStyle(0x2f7a39, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
      bg.lineStyle(3, 0x58c769, 1);
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

