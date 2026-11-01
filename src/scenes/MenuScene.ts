import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { SaveSystem } from '../systems/SaveSystem';
import { SoundManager } from '../systems/SoundManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  public create(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x100d18, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Animierte Sterne
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
    banner.fillStyle(0x211b30, 0.94);
    banner.fillRoundedRect(GAME_WIDTH / 2 - 460, 45, 920, 610, 12);
    banner.lineStyle(3, 0x8a78a5, 1);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - 460, 45, 920, 610, 12);
    banner.lineStyle(1, 0xd4af37, 0.7);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - 450, 55, 900, 590, 8);

    // Titel mit deutlicher Lesbarkeit
    this.add.text(GAME_WIDTH / 2 + 3, 123, 'RETRO TOWER DEFENSE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '34px',
      color: '#0d0714',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 120, 'RETRO TOWER DEFENSE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '34px',
      color: '#ffd13b',
      stroke: '#3d253b',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 168, '- DIE DREI GROSSEN KAMPAGNEN-WELTEN -', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#5eead4'
    }).setOrigin(0.5);

    // 3 Welten-Teaser
    const worlds = [
      { name: 'DIE HEXENWELT', desc: '50 Missionen\nSumpf & Magie', color: '#c586fa' },
      { name: 'DIE GOBLINHÖHLEN', desc: '50 Missionen\nSchiefer & Minen', color: '#ffd13b' },
      { name: 'DER TOTE BERG', desc: '50 Missionen\nGross, Rot & Lava', color: '#ff4757' }
    ];

    worlds.forEach((w, idx) => {
      const wx = GAME_WIDTH / 2 - 280 + idx * 280;
      const wCard = this.add.graphics();
      wCard.fillStyle(0x191424, 0.88);
      wCard.fillRoundedRect(wx - 125, 215, 250, 95, 8);
      wCard.lineStyle(2, 0x483d5a, 1);
      wCard.strokeRoundedRect(wx - 125, 215, 250, 100, 8);

      this.add.text(wx, 245, w.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: w.color
      }).setOrigin(0.5);

      this.add.text(wx, 275, w.desc, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        lineSpacing: 4,
        color: '#dcdde1',
        align: 'center'
      }).setOrigin(0.5);
    });

    // Exakt zentrierte "Verfügbare Kristalle"-Anzeige
    const crystals = SaveSystem.getCrystals();
    const crystalStr = `VERFÜGBARE KRISTALLE: ${crystals}`;
    const crystalText = this.add.text(GAME_WIDTH / 2 + 14, 355, crystalStr, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#be2edd'
    }).setOrigin(0.5);

    const iconX = GAME_WIDTH / 2 - crystalText.width / 2 - 6;
    this.add.image(iconX, 355, 'icon_crystal').setScale(1.2);

    // Haupt-Aktions-Buttons
    this.createButton(GAME_WIDTH / 2, 425, 'KAMPAGNE WÄHLEN', 340, 52, 0x27ae60, 0x2ecc71, () => {
      SoundManager.playClick();
      this.scene.start('WorldSelectScene');
    });

    this.createButton(GAME_WIDTH / 2, 495, '💎 TURM-SCHMIEDE (UPGRADES 1-5)', 340, 50, 0x512b7a, 0x8e44ad, () => {
      SoundManager.playClick();
      this.scene.start('UpgradeMenuScene');
    });

    // Sound Toggle Button unten
    const soundLabel = SoundManager.getIsMuted() ? 'MUSIK: AUS' : 'MUSIK: AN';
    const soundBtn = this.createButton(GAME_WIDTH / 2, 560, soundLabel, 200, 36, 0x2d3436, 0x636e72, () => {
      const muted = SoundManager.toggleMute();
      (soundBtn.getAt(1) as Phaser.GameObjects.Text).setText(muted ? 'MUSIK: AUS' : 'MUSIK: AN');
    });

    // Hinweis
    const hint = this.add.text(GAME_WIDTH / 2, 620, '150 Missionen insgesamt. Schalte Welten frei!', {
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
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    container.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', onClick);

    container.on('pointerover', () => {
      container.setScale(1.03);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
    });

    return container;
  }
}
