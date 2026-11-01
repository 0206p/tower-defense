import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { SaveSystem } from '../systems/SaveSystem';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  public create(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x100d18, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Animierte Hintergrund-Glows
    for (let i = 0; i < 20; i++) {
      const px = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const py = Phaser.Math.Between(40, GAME_HEIGHT - 40);
      const dot = this.add.circle(px, py, 2, 0xd4af37, 0.4);
      this.tweens.add({
        targets: dot,
        alpha: 0.9,
        scale: 1.5,
        duration: Phaser.Math.Between(1000, 2500),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }

    // Banner
    const banner = this.add.graphics();
    banner.fillStyle(0x211b30, 0.92);
    banner.fillRoundedRect(GAME_WIDTH / 2 - 460, 50, 920, 600, 12);
    banner.lineStyle(3, 0x8a78a5, 1);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - 460, 50, 920, 600, 12);
    banner.lineStyle(1, 0xd4af37, 0.7);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - 450, 60, 900, 580, 8);

    // Titel
    this.add.text(GAME_WIDTH / 2 + 4, 124, 'RETRO TOWER DEFENSE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '34px',
      color: '#1a1024'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 120, 'RETRO TOWER DEFENSE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '34px',
      color: '#ffd13b'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 168, '- DIE DREI GROSSEN WELTEN DER VERDAMMNIS -', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#5eead4'
    }).setOrigin(0.5);

    // 3 Welten-Teaser
    const worlds = [
      { name: 'DIE HEXENWELT', desc: '50 Missionen | Sumpf & Pilze', color: '#c586fa' },
      { name: 'DIE GOBLINHÖHLEN', desc: '50 Missionen | Schiefer & Minen', color: '#ffd13b' },
      { name: 'DER TOTE BERG', desc: '50 Missionen | Gross, Rot & Lava', color: '#ff4757' }
    ];

    worlds.forEach((w, idx) => {
      const wx = GAME_WIDTH / 2 - 280 + idx * 280;
      const wCard = this.add.graphics();
      wCard.fillStyle(0x191424, 0.85);
      wCard.fillRoundedRect(wx - 125, 215, 250, 100, 8);
      wCard.lineStyle(2, 0x483d5a, 1);
      wCard.strokeRoundedRect(wx - 125, 215, 250, 100, 8);

      this.add.text(wx, 245, w.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: w.color
      }).setOrigin(0.5);

      this.add.text(wx, 280, w.desc, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#9e97b0',
        align: 'center'
      }).setOrigin(0.5);
    });

    // Kristalle-Badge
    const crystals = SaveSystem.getCrystals();
    const crystalBadge = this.add.container(GAME_WIDTH / 2, 360);
    this.add.image(GAME_WIDTH / 2 - 80, 360, 'icon_crystal').setScale(1.2);
    this.add.text(GAME_WIDTH / 2 - 60, 360, `VERFÜGBARE KRISTALLE: ${crystals}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#be2edd'
    }).setOrigin(0, 0.5);

    // Haupt-Aktions-Buttons
    this.createButton(GAME_WIDTH / 2, 435, 'KAMPAGNE WÄHLEN', 340, 54, 0x27ae60, 0x2ecc71, () => {
      this.scene.start('WorldSelectScene');
    });

    this.createButton(GAME_WIDTH / 2, 505, '💎 TURM-SCHMIEDE (UPGRADES 1-5)', 340, 50, 0x512b7a, 0x8e44ad, () => {
      this.scene.start('UpgradeMenuScene');
    });

    // Hinweis
    const hint = this.add.text(GAME_WIDTH / 2, 595, '150 Missionen insgesamt. Schalte Welten & Turmstufen frei!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#f5f0e6'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
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
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', onClick);

    container.on('pointerover', () => {
      container.setScale(1.04);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
    });

    return container;
  }
}
