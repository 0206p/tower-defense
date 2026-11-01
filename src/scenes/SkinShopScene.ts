import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { SaveSystem, SKINS_CONFIG, TowerSkinId } from '../systems/SaveSystem';
import { SoundManager } from '../systems/SoundManager';

export class SkinShopScene extends Phaser.Scene {
  private crystalLabel!: Phaser.GameObjects.Text;
  private cardContainers: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'SkinShopScene' });
  }

  public create(): void {
    this.input.setPollAlways();

    const bg = this.add.graphics();
    bg.fillStyle(0x0c0a14, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Deko-Sterne / Sternenfeld im Hintergrund
    for (let i = 0; i < 40; i++) {
      const starX = Phaser.Math.Between(0, GAME_WIDTH);
      const starY = Phaser.Math.Between(0, GAME_HEIGHT);
      const starAlpha = Phaser.Math.FloatBetween(0.2, 0.7);
      bg.fillStyle(0xffffff, starAlpha);
      bg.fillCircle(starX, starY, Phaser.Math.FloatBetween(0.8, 1.8));
    }

    // Header
    this.add.text(GAME_WIDTH / 2, 40, 'ARSENAL: SKINS', {
      fontFamily: GAME_FONT,
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 75, 'Schalte visuelle Sci-Fi-Themes frei! Ausgerüstete Skins verändern alle Türme & Effekte im Kampf.', {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#dcdde1',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Kristall-Anzeige oben rechts
    this.crystalLabel = this.add.text(GAME_WIDTH - 60, 40, `${SaveSystem.getCrystals()}`, {
      fontFamily: GAME_FONT,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#be2edd'
    }).setOrigin(1, 0.5);
    this.add.image(this.crystalLabel.x - this.crystalLabel.width - 16, 40, 'icon_crystal').setScale(1.3);

    // Kacheln rendern
    this.renderSkinCards();

    // Unten: Navigation zur Turm-Schmiede & zum Hauptmenü
    this.createBottomButton(GAME_WIDTH / 2 - 180, 648, '💎 TURM-SCHMIEDE', 0x512b7a, 0x8e44ad, () => {
      SoundManager.playClick();
      this.scene.start('UpgradeMenuScene');
    });

    this.createBottomButton(GAME_WIDTH / 2 + 180, 648, 'HAUPTMENÜ', 0x2d3436, 0x636e72, () => {
      SoundManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  private updateCrystalDisplay(): void {
    this.crystalLabel.setText(`${SaveSystem.getCrystals()}`);
  }

  private renderSkinCards(): void {
    // Alte Kacheln abräumen
    this.cardContainers.forEach((c) => c.destroy());
    this.cardContainers = [];

    const skinIds: TowerSkinId[] = ['default', 'void', 'zerg', 'gold'];
    const cardWidth = 275;
    const gap = 20;
    const startX = 60;
    const activeSkin = SaveSystem.getActiveSkin();

    skinIds.forEach((skinId, idx) => {
      const def = SKINS_CONFIG[skinId];
      const isUnlocked = SaveSystem.isSkinUnlocked(skinId);
      const isEquipped = activeSkin === skinId;
      const x = startX + idx * (cardWidth + gap);
      const y = 105;
      const h = 470;

      const card = this.add.container(x, y);

      const bg = this.add.graphics();
      if (isEquipped) {
        bg.fillStyle(def.glowColor, 0.22);
        bg.fillRoundedRect(0, 0, cardWidth, h, 10);
        bg.lineStyle(3, def.themeColor, 1);
        bg.strokeRoundedRect(0, 0, cardWidth, h, 10);
      } else if (isUnlocked) {
        bg.fillStyle(0x191624, 0.85);
        bg.fillRoundedRect(0, 0, cardWidth, h, 10);
        bg.lineStyle(2, 0x4b3f61, 1);
        bg.strokeRoundedRect(0, 0, cardWidth, h, 10);
      } else {
        bg.fillStyle(0x13111c, 0.85);
        bg.fillRoundedRect(0, 0, cardWidth, h, 10);
        bg.lineStyle(1.5, 0x2d243a, 1);
        bg.strokeRoundedRect(0, 0, cardWidth, h, 10);
      }
      card.add(bg);

      // Titel
      const title = this.add.text(cardWidth / 2, 32, def.name, {
        fontFamily: GAME_FONT,
        fontSize: '17px',
        fontStyle: 'bold',
        color: isEquipped ? '#ffd13b' : '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      card.add(title);

      // Theme-Pill
      const themeText = this.add.text(cardWidth / 2, 60, def.theme.toUpperCase(), {
        fontFamily: GAME_FONT,
        fontSize: '11px',
        color: def.themeColor === 0xffffff ? '#94a3b8' : `#${def.themeColor.toString(16).padStart(6, '0')}`,
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      card.add(themeText);

      // Vorschau-Box mit 3 Turm-Modellen
      const previewBox = this.add.graphics();
      previewBox.fillStyle(0x0a0812, 0.95);
      previewBox.fillRoundedRect(18, 85, cardWidth - 36, 115, 8);
      previewBox.lineStyle(1.5, def.glowColor, 0.8);
      previewBox.strokeRoundedRect(18, 85, cardWidth - 36, 115, 8);
      card.add(previewBox);

      // Aura unter den Mini-Türmen
      const aura = this.add.graphics();
      aura.fillStyle(def.glowColor, 0.35);
      aura.fillCircle(cardWidth / 2 - 64, 145, 20);
      aura.fillCircle(cardWidth / 2, 145, 20);
      aura.fillCircle(cardWidth / 2 + 64, 145, 20);
      card.add(aura);

      const previewTowers = ['tower_archer_1', 'tower_cannon_1', 'tower_tesla_1'];
      previewTowers.forEach((tKey, tIdx) => {
        const tx = cardWidth / 2 - 64 + tIdx * 64;
        const spr = this.add.sprite(tx, 140, tKey).setDisplaySize(42, 42);
        if (def.tint !== 0xffffff) {
          spr.setTint(def.tint);
        }
        card.add(spr);
      });

      // Beschreibung
      const desc = this.add.text(cardWidth / 2, 245, def.description, {
        fontFamily: GAME_FONT,
        fontSize: '12px',
        lineSpacing: 4,
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: cardWidth - 32 }
      }).setOrigin(0.5);
      card.add(desc);

      // Preis-Badge
      const costBadge = def.cost === 0
        ? 'STANDARD-AUSRÜSTUNG (GRATIS)'
        : `${def.cost} KRISTALLE`;
      const costText = this.add.text(cardWidth / 2, 335, costBadge, {
        fontFamily: GAME_FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: isUnlocked ? '#22c55e' : '#ffd13b',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      card.add(costText);

      // Aktions-Button
      const btnY = 408;
      const btn = this.add.container(cardWidth / 2, btnY);
      const btnBg = this.add.graphics();
      const btnW = 200;
      const btnH = 40;

      let btnLabelText = 'AKTIVIEREN';
      let btnFill = 0x2563eb;
      let btnBorder = 0x38bdf8;

      if (isEquipped) {
        btnLabelText = '✓ AUSGERÜSTET';
        btnFill = 0x059669;
        btnBorder = 0x34d399;
      } else if (!isUnlocked) {
        btnLabelText = `FREISCHALTEN (${def.cost} 💎)`;
        btnFill = 0x6b21a8;
        btnBorder = 0xc084fc;
      }

      const drawButton = (hovered: boolean) => {
        btnBg.clear();
        btnBg.fillStyle(hovered ? btnBorder : btnFill, 1);
        btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        btnBg.lineStyle(2, hovered ? 0xffffff : btnBorder, 1);
        btnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      };
      drawButton(false);
      btn.add(btnBg);

      const btnLabel = this.add.text(0, 0, btnLabelText, {
        fontFamily: GAME_FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      btn.add(btnLabel);

      btn.setSize(btnW, btnH);
      btn.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, btnW, btnH),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true
      });

      btn.on('pointerover', () => {
        drawButton(true);
        btn.setScale(1.03);
      });

      btn.on('pointerout', () => {
        drawButton(false);
        btn.setScale(1.0);
      });

      btn.on('pointerdown', () => {
        if (isEquipped) {
          SoundManager.playClick();
          return;
        }

        if (isUnlocked) {
          SaveSystem.setActiveSkin(skinId);
          SoundManager.playUpgrade();
          this.renderSkinCards();
          return;
        }

        // Freischalten mit Kristallen
        if (SaveSystem.unlockSkin(skinId, def.cost)) {
          SoundManager.playUpgrade();
          this.cameras.main.flash(200, 255, 215, 0);
          this.updateCrystalDisplay();
          this.renderSkinCards();
        } else {
          SoundManager.playDeny();
          this.cameras.main.shake(150, 0.005);
        }
      });

      card.add(btn);
      this.cardContainers.push(card);
    });
  }

  private createBottomButton(x: number, y: number, text: string, color: number, border: number, onClick: () => void): void {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-160, -22, 320, 44, 6);
    bg.lineStyle(2, border, 1);
    bg.strokeRoundedRect(-160, -22, 320, 44, 6);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(320, 44);
    btn.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, 320, 44),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(border, 1);
      bg.fillRoundedRect(-160, -22, 320, 44, 6);
      bg.lineStyle(2, 0xffffff, 1);
      bg.strokeRoundedRect(-160, -22, 320, 44, 6);
      btn.setScale(1.03);
    });
    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-160, -22, 320, 44, 6);
      bg.lineStyle(2, border, 1);
      bg.strokeRoundedRect(-160, -22, 320, 44, 6);
      btn.setScale(1.0);
    });
  }
}

