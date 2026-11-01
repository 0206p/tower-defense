import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { SaveSystem } from '../systems/SaveSystem';
import { SoundManager } from '../systems/SoundManager';
import { logger } from '../systems/GameLogger';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  public create(): void {
    logger.info('MenuScene', 'Hauptmenü aufgerufen');

    // 1. Grafik-Hintergrund: Episches Retro-Panorama
    const bgImage = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_menu_panorama');
    bgImage.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // 2. Schwebende magische Glühpartikel & Funken (Atmosphäre)
    for (let i = 0; i < 35; i++) {
      const px = Phaser.Math.Between(30, GAME_WIDTH - 30);
      const py = Phaser.Math.Between(150, GAME_HEIGHT - 30);
      const size = Phaser.Math.FloatBetween(1.5, 3.5);
      const isTeal = Math.random() > 0.5;
      const color = isTeal ? 0x55efc4 : 0xffd32a;
      const spark = this.add.circle(px, py, size, color, Phaser.Math.FloatBetween(0.3, 0.7));

      this.tweens.add({
        targets: spark,
        y: py - Phaser.Math.Between(60, 180),
        x: px + Phaser.Math.Between(-30, 30),
        alpha: { from: 0.8, to: 0.05 },
        duration: Phaser.Math.Between(2500, 5000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000)
      });
    }

    // 3. Zentrales, transparentes Glas-Panel für Menü-Inhalte
    const panel = this.add.graphics();
    panel.fillStyle(0x130e22, 0.78);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 280, 80, 560, 550, 16);
    panel.lineStyle(2, 0xd4af37, 0.85);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 280, 80, 560, 550, 16);
    panel.lineStyle(1, 0x8a78a5, 0.4);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 272, 88, 544, 534, 12);

    // 4. Logo & Titel
    this.add.text(GAME_WIDTH / 2 + 2, 142, 'RETRO TOWER DEFENSE', {
      fontFamily: GAME_FONT,
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#000000',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 140, 'RETRO TOWER DEFENSE', {
      fontFamily: GAME_FONT,
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#ffd13b',
      stroke: '#3b2118',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 185, '⚔️ 3 KAMPAGNEN-WELTEN • 150 MISSIONEN ⚔️', {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#5eead4',
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);

    // 5. Exakt zentrierte "Verfügbare Kristalle"-Anzeige
    const crystals = SaveSystem.getCrystals();
    const crystalStr = `VERFÜGBARE KRISTALLE: ${crystals}`;
    const crystalContainer = this.add.container(GAME_WIDTH / 2, 235);

    const crystalText = this.add.text(0, 0, crystalStr, {
      fontFamily: GAME_FONT,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e056fd',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    const totalWidth = 32 + 8 + crystalText.width;
    const startX = -totalWidth / 2;
    const crystalIcon = this.add.image(startX + 14, 0, 'icon_crystal').setScale(1.3).setOrigin(0.5);
    crystalText.setX(startX + 34);
    crystalContainer.add([crystalIcon, crystalText]);

    // 6. Hauptmenü-Buttons (Groß, responsiv, reaktionsschnell)
    this.createMenuButton(GAME_WIDTH / 2, 305, '⚔️ KAMPAGNE STARTEN', 380, 56, 0x27ae60, 0x2ecc71, () => {
      SoundManager.playClick();
      logger.info('MenuScene', 'Kampagne starten gewählt');
      this.scene.start('WorldSelectScene');
    });

    this.createMenuButton(GAME_WIDTH / 2, 380, '💎 TURM-SCHMIEDE (UPGRADES)', 380, 54, 0x512b7a, 0x8e44ad, () => {
      SoundManager.playClick();
      logger.info('MenuScene', 'Turm-Schmiede gewählt');
      this.scene.start('UpgradeMenuScene');
    });

    // Sound Toggle Button
    const soundLabel = SoundManager.getIsMuted() ? '🔊 MUSIK: AUS' : '🔊 MUSIK: AN';
    const soundBtn = this.createMenuButton(GAME_WIDTH / 2 - 105, 452, soundLabel, 170, 42, 0x2d3436, 0x636e72, () => {
      const muted = SoundManager.toggleMute();
      logger.info('Sound', `Musik umgeschaltet: ${muted ? 'AUS' : 'AN'}`);
      (soundBtn.getAt(1) as Phaser.GameObjects.Text).setText(muted ? '🔊 MUSIK: AUS' : '🔊 MUSIK: AN');
    });

    // Logs Herunterladen (für den Nutzer & Support zur 15-Minuten-Analyse)
    this.createMenuButton(GAME_WIDTH / 2 + 105, 452, '📜 LOGS EXPORT', 170, 42, 0x1e3799, 0x4a69bd, () => {
      SoundManager.playClick();
      logger.downloadLogs(30);
    });

    // Subtiler Fußnoten-Text
    const hint = this.add.text(GAME_WIDTH / 2, 575, 'Türme im Spiel ziehen & ablegen (Drag & Drop) • 2 Spezialisierungen ab Stufe 3', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      color: '#f5f0e6',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.6,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });
  }

  private createMenuButton(
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
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
    container.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      onClick();
    });

    container.on('pointerover', () => {
      container.setScale(1.03);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
    });

    return container;
  }
}
