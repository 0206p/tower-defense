import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
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

    // Rahmen
    const banner = this.add.graphics();
    banner.fillStyle(0x211b30, 0.95);
    banner.fillRoundedRect(GAME_WIDTH / 2 - 470, 40, 940, 625, 12);
    banner.lineStyle(3, 0x8a78a5, 1);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - 470, 40, 940, 625, 12);
    banner.lineStyle(1, 0xd4af37, 0.7);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - 460, 50, 920, 605, 8);

    // Großer Titel mit deutlichem Abstand nach oben
    this.add.text(GAME_WIDTH / 2 + 3, 113, 'RETRO TOWER DEFENSE', {
      fontFamily: GAME_FONT,
      fontSize: '42px',
      color: '#0d0714',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 110, 'RETRO TOWER DEFENSE', {
      fontFamily: GAME_FONT,
      fontSize: '42px',
      color: '#ffd13b',
      stroke: '#3d253b',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 160, '- DIE DREI GROSSEN KAMPAGNEN-WELTEN -', {
      fontFamily: GAME_FONT,
      fontSize: '16px',
      color: '#5eead4',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 3 Welten-Teaser mit deutlich lesbarer Schrift
    const worlds = [
      { name: 'DIE HEXENWELT', desc: '50 Missionen\nSumpf & Magie', color: '#c586fa' },
      { name: 'DIE GOBLINHÖHLEN', desc: '50 Missionen\nSchiefer & Minen', color: '#ffd13b' },
      { name: 'DER TOTE BERG', desc: '50 Missionen\nGross, Rot & Lava', color: '#ff4757' }
    ];

    worlds.forEach((w, idx) => {
      const wx = GAME_WIDTH / 2 - 280 + idx * 280;
      const wCard = this.add.graphics();
      wCard.fillStyle(0x191424, 0.92);
      wCard.fillRoundedRect(wx - 125, 205, 250, 105, 8);
      wCard.lineStyle(2, 0x483d5a, 1);
      wCard.strokeRoundedRect(wx - 125, 205, 250, 105, 8);

      this.add.text(wx, 235, w.name, {
        fontFamily: GAME_FONT,
        fontSize: '16px',
        color: w.color,
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      this.add.text(wx, 275, w.desc, {
        fontFamily: GAME_FONT,
        fontSize: '14px',
        lineSpacing: 5,
        color: '#f5f0e6',
        align: 'center'
      }).setOrigin(0.5);
    });

    // Exakt zentrierte "Verfügbare Kristalle"-Anzeige
    const crystals = SaveSystem.getCrystals();
    const crystalStr = `VERFÜGBARE KRISTALLE: ${crystals}`;
    const crystalContainer = this.add.container(GAME_WIDTH / 2, 348);
    
    const crystalText = this.add.text(0, 0, crystalStr, {
      fontFamily: GAME_FONT,
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#c586fa',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    const totalWidth = 32 + 8 + crystalText.width;
    const startX = -totalWidth / 2;
    const crystalIcon = this.add.image(startX + 14, 0, 'icon_crystal').setScale(1.3).setOrigin(0.5);
    crystalText.setX(startX + 34);
    
    crystalContainer.add([crystalIcon, crystalText]);

    // Haupt-Aktions-Buttons
    this.createButton(GAME_WIDTH / 2, 420, 'KAMPAGNE WÄHLEN', 380, 58, 0x27ae60, 0x2ecc71, () => {
      SoundManager.playClick();
      this.scene.start('WorldSelectScene');
    });

    this.createButton(GAME_WIDTH / 2, 495, '💎 TURM-SCHMIEDE (UPGRADES)', 380, 56, 0x512b7a, 0x8e44ad, () => {
      SoundManager.playClick();
      this.scene.start('UpgradeMenuScene');
    });

    // Sound Toggle Button
    const soundLabel = SoundManager.getIsMuted() ? '🔊 MUSIK: AUS' : '🔊 MUSIK: AN';
    const soundBtn = this.createButton(GAME_WIDTH / 2 - 165, 565, soundLabel, 150, 40, 0x2d3436, 0x636e72, () => {
      const muted = SoundManager.toggleMute();
      (soundBtn.getAt(1) as Phaser.GameObjects.Text).setText(muted ? '🔊 MUSIK: AUS' : '🔊 MUSIK: AN');
    });

    // Savegame Export
    this.createButton(GAME_WIDTH / 2, 565, '💾 EXPORT', 140, 40, 0x1e3799, 0x4a69bd, () => {
      SoundManager.playClick();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(SaveSystem.exportSave());
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "tower_defense_save.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    // Savegame Import
    this.createButton(GAME_WIDTH / 2 + 165, 565, '📂 IMPORT', 140, 40, 0x4a1c1c, 0xe55039, () => {
      SoundManager.playClick();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
          const content = re.target?.result as string;
          if (content && SaveSystem.importSave(content)) {
            SoundManager.playUpgrade();
            this.scene.restart();
          } else {
            alert('Ungültiges Spielstand-Format!');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });

    // Hinweis
    const hint = this.add.text(GAME_WIDTH / 2, 630, '150 Missionen insgesamt. Schalte alle Welten frei!', {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#f5f0e6',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.5,
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
      fontFamily: GAME_FONT,
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
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
