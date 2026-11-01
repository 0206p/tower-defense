import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../config/GameConfig';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  public create(): void {
    // Dunkler Fantasy-Hintergrund mit Kacheleffekt
    const bg = this.add.graphics();
    bg.fillStyle(0x121019, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Kacheln als Retro-Boden
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      for (let y = 0; y < GAME_HEIGHT; y += 40) {
        if ((x / 40 + y / 40) % 2 === 0) {
          bg.fillStyle(0x191624, 0.4);
          bg.fillRect(x, y, 40, 40);
        }
      }
    }

    // Dekorative Banner / Rahmen
    const banner = this.add.graphics();
    banner.fillStyle(0x231d33, 0.9);
    banner.fillRoundedRect(GAME_WIDTH / 2 - 420, 70, 840, 560, 12);
    banner.lineStyle(3, 0x8a78a5, 1);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - 420, 70, 840, 560, 12);

    banner.lineStyle(1, 0xd4af37, 0.7);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - 410, 80, 820, 540, 8);

    // Titel mit Pixel-Schattierung
    const titleShadow = this.add.text(GAME_WIDTH / 2 + 4, 144, 'TOWER DEFENSE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '44px',
      color: '#1a1024'
    }).setOrigin(0.5);

    const title = this.add.text(GAME_WIDTH / 2, 140, 'TOWER DEFENSE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '44px',
      color: '#ffd13b'
    }).setOrigin(0.5);

    // Untertitel
    const subtitle = this.add.text(GAME_WIDTH / 2, 200, '- 16-BIT RETRO STRATEGIE -', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#5eead4'
    }).setOrigin(0.5);

    // Deko: 3 Turm-Vorschauen in der Mitte
    this.createTowerShowcase(GAME_WIDTH / 2 - 220, 310, 'tower_archer_2', 'Bogenschütze', 'Schnell & Präzise\nEinzelziel');
    this.createTowerShowcase(GAME_WIDTH / 2, 310, 'tower_cannon_2', 'Kanone', 'Schwere Artillerie\nFlächenschaden');
    this.createTowerShowcase(GAME_WIDTH / 2 + 220, 310, 'tower_ice_2', 'Eismagier', 'Frostzauber\nVerlangsamt');

    // Spielen-Button
    const playBtn = this.createButton(GAME_WIDTH / 2, 470, 'SPIELEN', 240, 52, 0x2d6323, 0x518233, () => {
      this.cameras.main.fade(300, 0, 0, 0, false, (cam: any, progress: number) => {
        if (progress === 1) {
          this.scene.start('GameScene');
        }
      });
    });

    // Retro-Blinkender Hinweistext unten
    const hint = this.add.text(GAME_WIDTH / 2, 570, 'Verteidige das Schloss gegen 10 tödliche Wellen!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#f5f0e6'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Dekorative Partikel / Sterne im Hintergrund
    for (let i = 0; i < 15; i++) {
      const px = Phaser.Math.Between(50, GAME_WIDTH - 50);
      const py = Phaser.Math.Between(40, GAME_HEIGHT - 40);
      const dot = this.add.circle(px, py, 2, 0xd4af37, 0.4);
      this.tweens.add({
        targets: dot,
        alpha: 0.9,
        duration: Phaser.Math.Between(1000, 2500),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }
  }

  private createTowerShowcase(x: number, y: number, spriteKey: string, name: string, desc: string): void {
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x191624, 0.85);
    cardBg.fillRoundedRect(x - 90, y - 60, 180, 120, 6);
    cardBg.lineStyle(2, 0x483d5a, 1);
    cardBg.strokeRoundedRect(x - 90, y - 60, 180, 120, 6);

    const img = this.add.image(x, y - 18, spriteKey).setScale(1.2);

    const title = this.add.text(x, y + 16, name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffd13b'
    }).setOrigin(0.5);

    const info = this.add.text(x, y + 38, desc, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      lineSpacing: 4,
      color: '#a39cb5',
      align: 'center'
    }).setOrigin(0.5);
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
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', onClick);

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x38782c, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
      bg.lineStyle(3, 0x7eb34d, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
      container.setScale(1.05);
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

