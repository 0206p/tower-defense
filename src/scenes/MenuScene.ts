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
    this.input.setPollAlways();
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
    panel.fillRoundedRect(GAME_WIDTH / 2 - 280, 75, 560, 565, 16);
    panel.lineStyle(2, 0xd4af37, 0.85);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 280, 75, 560, 565, 16);
    panel.lineStyle(1, 0x8a78a5, 0.4);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 272, 83, 544, 549, 12);

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
    const crystalContainer = this.add.container(GAME_WIDTH / 2, 235);

    const crystalText = this.add.text(0, 0, '', {
      fontFamily: GAME_FONT,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e056fd',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    const crystalIcon = this.add.image(0, 0, 'icon_crystal').setScale(1.3).setOrigin(0.5);
    crystalContainer.add([crystalIcon, crystalText]);

    const updateCrystalDisplay = () => {
      const currentCrystals = SaveSystem.getCrystals();
      const isAdmin = SaveSystem.isAdminMode();
      const crystalStr = isAdmin
        ? 'VERFÜGBARE KRISTALLE: 9.999.999.999 (ADMIN)'
        : `VERFÜGBARE KRISTALLE: ${currentCrystals.toLocaleString('de-DE')}`;

      crystalText.setText(crystalStr);
      crystalText.setColor(isAdmin ? '#fbc531' : '#e056fd');
      const totalWidth = 32 + 8 + crystalText.width;
      const startX = -totalWidth / 2;
      crystalIcon.setX(startX + 14);
      crystalText.setX(startX + 34);
    };

    updateCrystalDisplay();

    // 6. Hauptmenü-Buttons (Groß, responsiv, modern gestaltet, ohne störende Klammern)
    const maxEndlessWave = SaveSystem.getEndlessMaxWave();
    const endlessLabel = maxEndlessWave > 0
      ? `🔥 ENDLOSMODUS • REKORD WELLE ${maxEndlessWave}`
      : '🔥 ENDLOSMODUS';

    this.createMenuButton(GAME_WIDTH / 2, 285, '⚔️ KAMPAGNE STARTEN', 410, 42, 0x27ae60, 0x2ecc71, () => {
      SoundManager.playClick();
      logger.info('MenuScene', 'Kampagne starten gewählt');
      this.scene.start('WorldSelectScene');
    });

    // Neuer Spielmodus: Dungeon (am Ende der Kampagne freigeschaltet)
    const isDungeonUnlocked = SaveSystem.isDungeonUnlocked();
    const dungeonRecord = SaveSystem.getDungeonMaxWave();
    const dungeonLabel = isDungeonUnlocked
      ? (dungeonRecord > 0 ? `🏰 DUNGEON • KAMMER ${dungeonRecord}/30` : '🏰 DUNGEON-MODUS')
      : '🔒 DUNGEON • GESPERRT';

    this.createMenuButton(
      GAME_WIDTH / 2,
      335,
      dungeonLabel,
      410,
      42,
      isDungeonUnlocked ? 0x4a148c : 0x221a2e,
      isDungeonUnlocked ? 0x9c27b0 : 0x3d3250,
      () => {
        if (!SaveSystem.isDungeonUnlocked()) {
          SoundManager.playDeny();
          logger.info('MenuScene', 'Dungeon versucht, aber noch gesperrt');
          hint.setText('🔒 Das Dungeon öffnet sich erst nach Beendigung aller 3 Welten (je 30 Missionen)!');
          hint.setColor('#ff7675');
          this.tweens.add({
            targets: hint,
            scaleX: { from: 1.1, to: 1.0 },
            scaleY: { from: 1.1, to: 1.0 },
            duration: 300
          });
          return;
        }

        SoundManager.playClick();
        logger.info('MenuScene', 'Dungeon-Modus gestartet');
        this.scene.start('GameScene', {
          worldId: 'dungeon',
          missionNumber: 1,
          isDungeon: true
        });
      }
    );

    this.createMenuButton(GAME_WIDTH / 2, 385, endlessLabel, 410, 42, 0xb33939, 0xff5252, () => {
      SoundManager.playClick();
      logger.info('MenuScene', 'Endlosmodus gestartet');
      this.scene.start('GameScene', {
        worldId: 'witch_forest',
        missionNumber: 1,
        isEndless: true
      });
    });

    this.createMenuButton(GAME_WIDTH / 2 - 105, 435, '💎 TURM-SCHMIEDE', 200, 42, 0x512b7a, 0x8e44ad, () => {
      SoundManager.playClick();
      logger.info('MenuScene', 'Turm-Schmiede gewählt');
      this.scene.start('UpgradeMenuScene');
    });

    this.createMenuButton(GAME_WIDTH / 2 + 105, 435, '🎨 TURM-SKINS', 200, 42, 0x1e3a8a, 0x3b82f6, () => {
      SoundManager.playClick();
      logger.info('MenuScene', 'Turm-Skins Arsenal gewählt');
      this.scene.start('SkinShopScene');
    });

    // Sound Toggle Button & Logs
    const soundLabel = SoundManager.getIsMuted() ? '🔊 MUSIK: AUS' : '🔊 MUSIK: AN';
    const soundBtn = this.createMenuButton(GAME_WIDTH / 2 - 105, 488, soundLabel, 200, 34, 0x2d3436, 0x636e72, () => {
      const muted = SoundManager.toggleMute();
      logger.info('Sound', `Musik umgeschaltet: ${muted ? 'AUS' : 'AN'}`);
      (soundBtn.getAt(1) as Phaser.GameObjects.Text).setText(muted ? '🔊 MUSIK: AUS' : '🔊 MUSIK: AN');
    });

    this.createMenuButton(GAME_WIDTH / 2 + 105, 488, '📜 LOGS EXPORT', 200, 34, 0x1e3799, 0x4a69bd, () => {
      SoundManager.playClick();
      logger.downloadLogs(30);
    });

    // 7. Admin-Mode Switch (Kompakter Umschalter)
    const getAdminBtnText = (active: boolean) => {
      return active ? 'ADMIN-MODUS: AN' : 'ADMIN-MODUS: AUS';
    };

    const adminBtn = this.add.container(GAME_WIDTH / 2, 538);
    const adminBg = this.add.graphics();
    const adminWidth = 210;
    const adminHeight = 36;

    const renderAdminBg = (active: boolean, hovered: boolean = false) => {
      adminBg.clear();
      if (active) {
        adminBg.fillStyle(hovered ? 0x995d08 : 0x78350f, 1);
        adminBg.fillRoundedRect(-adminWidth / 2, -adminHeight / 2, adminWidth, adminHeight, 8);
        adminBg.lineStyle(2, 0xf59e0b, 1);
        adminBg.strokeRoundedRect(-adminWidth / 2, -adminHeight / 2, adminWidth, adminHeight, 8);
      } else {
        adminBg.fillStyle(hovered ? 0x2e293d : 0x1e1b29, 1);
        adminBg.fillRoundedRect(-adminWidth / 2, -adminHeight / 2, adminWidth, adminHeight, 8);
        adminBg.lineStyle(2, hovered ? 0x6e5d87 : 0x443b59, 1);
        adminBg.strokeRoundedRect(-adminWidth / 2, -adminHeight / 2, adminWidth, adminHeight, 8);
      }
    };

    adminBtn.add(adminBg);

    const adminLabel = this.add.text(0, 0, getAdminBtnText(SaveSystem.isAdminMode()), {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: SaveSystem.isAdminMode() ? '#fef08a' : '#9e97b0',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    adminBtn.add(adminLabel);

    renderAdminBg(SaveSystem.isAdminMode());

    adminBtn.setSize(adminWidth, adminHeight);
    adminBtn.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, adminWidth, adminHeight),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });

    adminBtn.on('pointerover', () => {
      renderAdminBg(SaveSystem.isAdminMode(), true);
    });

    adminBtn.on('pointerout', () => {
      renderAdminBg(SaveSystem.isAdminMode(), false);
    });

    adminBtn.on('pointerdown', () => {
      const active = SaveSystem.toggleAdminMode();
      SoundManager.playUpgrade();
      logger.info('AdminMode', `Admin-Modus ${active ? 'EINGESCHALTET (9999999999 Kristalle, alle Missionen & Dungeon frei)' : 'AUSGESCHALTET'}`);
      this.cameras.main.flash(220, 255, 215, 0, false);
      this.time.delayedCall(150, () => {
        this.scene.restart();
      });
    });

    // Subtiler Fußnoten-Text
    const hint = this.add.text(GAME_WIDTH / 2, 598, 'Dungeon: 30 gnadenlose Kammern • Schmiede-Upgrades & StarCraft II RTS-Befehlskonsole', {
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
    const renderBg = (hovered: boolean) => {
      bg.clear();
      bg.fillStyle(hovered ? borderColor : color, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
      bg.lineStyle(2, hovered ? 0xffffff : borderColor, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
    };
    renderBg(false);
    container.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: GAME_FONT,
      fontSize: width < 210 ? '13px' : '15px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, width, height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });

    container.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      onClick();
    });

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
