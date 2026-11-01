import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { WORLDS_CONFIG } from '../config/WorldConfig';
import { SaveSystem, WorldId } from '../systems/SaveSystem';
import { SoundManager } from '../systems/SoundManager';

export class WorldSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldSelectScene' });
  }

  public create(): void {
    this.input.setPollAlways();

    const bg = this.add.graphics();
    bg.fillStyle(0x110f17, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Header mit gut lesbarer Schrift
    this.add.text(GAME_WIDTH / 2, 40, 'KAMPAGNEN-WELTEN', {
      fontFamily: GAME_FONT,
      fontSize: '32px',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 75, 'Schließe jeweils 30 Missionen einer Welt ab, um die nächste Welt und das Dungeon freizuschalten.', {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#dcdde1',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Kristall-Anzeige oben rechts
    const crystals = SaveSystem.getCrystals();
    const crystalLabel = this.add.text(GAME_WIDTH - 60, 40, `${crystals}`, {
      fontFamily: GAME_FONT,
      fontSize: '18px',
      color: '#be2edd'
    }).setOrigin(1, 0.5);
    this.add.image(crystalLabel.x - crystalLabel.width - 16, 40, 'icon_crystal').setScale(1.3);

    // 4 Welten-Karten nebeneinander (inkl. Endgame Dungeon)
    const worldIds: WorldId[] = ['witch_forest', 'goblin_caves', 'dead_mountain', 'dungeon'];
    const cardWidth = 275;
    const gap = 20;
    const startX = 60;

    worldIds.forEach((wId, idx) => {
      this.createWorldCard(wId, startX + idx * (cardWidth + gap), 105, cardWidth, 470);
    });

    // Unten: Skins-Arsenal, Upgrade-Schmiede & Menü mit großzügigem Abstand
    this.createBottomButton(GAME_WIDTH / 2 - 290, 648, '🎨 TURM-SKINS', 0x1e3a8a, 0x3b82f6, () => {
      SoundManager.playClick();
      this.scene.start('SkinShopScene');
    });

    this.createBottomButton(GAME_WIDTH / 2, 648, '💎 TURM-SCHMIEDE', 0x512b7a, 0x8e44ad, () => {
      SoundManager.playClick();
      this.scene.start('UpgradeMenuScene');
    });

    this.createBottomButton(GAME_WIDTH / 2 + 290, 648, 'HAUPTMENÜ', 0x2d3436, 0x636e72, () => {
      SoundManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  private createWorldCard(worldId: WorldId, x: number, y: number, w: number, h: number): void {
    const def = WORLDS_CONFIG[worldId];
    const isUnlocked = SaveSystem.isWorldUnlocked(worldId);
    const progress = SaveSystem.getData().worlds[worldId];
    const completed = progress ? progress.completedMissions : 0;

    const card = this.add.container(x, y);

    const bg = this.add.graphics();
    if (isUnlocked) {
      bg.fillStyle(def.themeColor, 0.3);
      bg.fillRoundedRect(0, 0, w, h, 10);
      bg.lineStyle(3, def.themeColor, 1);
      bg.strokeRoundedRect(0, 0, w, h, 10);
    } else {
      bg.fillStyle(0x1a1a24, 0.75);
      bg.fillRoundedRect(0, 0, w, h, 10);
      bg.lineStyle(2, 0x3d354a, 1);
      bg.strokeRoundedRect(0, 0, w, h, 10);
    }
    card.add(bg);

    // Titel (Groß & fett)
    const title = this.add.text(w / 2, 33, def.name.toUpperCase(), {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      fontStyle: 'bold',
      color: isUnlocked ? def.textColor : '#7f8c8d',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    card.add(title);

    // Schwierigkeit Pill
    const diffText = this.add.text(w / 2, 64, `SCHWIERIGKEIT: ${def.difficulty}`, {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: isUnlocked ? def.difficultyColor : '#57606f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    card.add(diffText);

    // Galaxie-Wesen & Xeno-Kreaturen Schaufenster
    this.createCreatureShowcase(card, worldId, isUnlocked, w);

    // Beschreibung (Groß & lesbar)
    const desc = this.add.text(w / 2, 240, def.description, {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      lineSpacing: 4,
      color: isUnlocked ? '#f5f0e6' : '#57606f',
      align: 'center',
      wordWrap: { width: w - 30 }
    }).setOrigin(0.5);
    card.add(desc);

    // Fortschritt
    const isKammer = worldId === 'dungeon';
    const progressLabel = SaveSystem.isAdminMode()
      ? `FORTSCHRITT:\nALLE 30 FREI (ADMIN)`
      : `FORTSCHRITT:\n${completed} / 30 ${isKammer ? 'KAMMERN' : 'MISSIONEN'}`;

    const progressText = this.add.text(w / 2, 325, progressLabel, {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      lineSpacing: 4,
      color: isUnlocked ? '#ffd13b' : '#57606f',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    card.add(progressText);

    // Button / Sperr-Text
    if (isUnlocked) {
      const playBtn = this.add.container(w / 2, 408);
      const btnBg = this.add.graphics();
      const primaryColor = worldId === 'dungeon' ? 0x6a1b9a : 0x27ae60;
      const borderColor = worldId === 'dungeon' ? 0xba68c8 : 0x2ecc71;
      const hoverColor = worldId === 'dungeon' ? 0x8e24aa : 0x2ecc71;

      btnBg.fillStyle(primaryColor, 1);
      btnBg.fillRoundedRect(-100, -20, 200, 40, 6);
      btnBg.lineStyle(2, borderColor, 1);
      btnBg.strokeRoundedRect(-100, -20, 200, 40, 6);
      playBtn.add(btnBg);

      const btnLabel = this.add.text(0, 0, isKammer ? 'KAMMERN ÖFFNEN' : 'MISSIONEN ÖFFNEN', {
        fontFamily: GAME_FONT,
        fontSize: '13px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      playBtn.add(btnLabel);

      playBtn.setSize(200, 40);
      playBtn.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, 200, 40),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true
      });

      playBtn.on('pointerdown', () => {
        SoundManager.playClick();
        SaveSystem.getData().selectedWorld = worldId;
        SaveSystem.save();
        this.scene.start('MissionSelectScene', { worldId });
      });

      playBtn.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(hoverColor, 1);
        btnBg.fillRoundedRect(-100, -20, 200, 40, 6);
        btnBg.lineStyle(2, 0xffffff, 1);
        btnBg.strokeRoundedRect(-100, -20, 200, 40, 6);
        playBtn.setScale(1.04);
      });

      playBtn.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(primaryColor, 1);
        btnBg.fillRoundedRect(-100, -20, 200, 40, 6);
        btnBg.lineStyle(2, borderColor, 1);
        btnBg.strokeRoundedRect(-100, -20, 200, 40, 6);
        playBtn.setScale(1.0);
      });

      card.add(playBtn);
    } else {
      const reqWorld = worldId === 'dungeon'
        ? WORLDS_CONFIG.dead_mountain.name
        : worldId === 'dead_mountain'
        ? WORLDS_CONFIG.goblin_caves.name
        : WORLDS_CONFIG.witch_forest.name;
      const lockText = this.add.text(w / 2, 408, `🔒 GESPERRT\nErfordert 30 Missionen\nin ${reqWorld}`, {
        fontFamily: GAME_FONT,
        fontSize: '12px',
        lineSpacing: 4,
        color: '#e74c3c',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      card.add(lockText);
    }
  }

  private createCreatureShowcase(card: Phaser.GameObjects.Container, worldId: WorldId, isUnlocked: boolean, w: number): void {
    const boxW = 236;
    const boxH = 118;
    const boxX = w / 2;
    const boxY = 148;

    const showcase = this.add.container(boxX, boxY);

    // 1. Tiefraum- / Galaxie-Hintergrund
    const bg = this.add.graphics();
    bg.fillStyle(0x060814, 0.95);
    bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);

    // Kosmischer Nebel passend zum Biom
    let nebulaColor = 0x10b981; // Zerus Emerald
    let techBorder = 0x059669;
    let badgeText = '🧬 XENO-SPEZIES: ZERGLING';
    let centerSpriteKey = 'enemy_goblin';
    let leftSpriteKey = 'enemy_bat';
    let rightSpriteKey = 'enemy_slime';

    if (worldId === 'goblin_caves') {
      nebulaColor = 0x0284c7; // Korhal Neon Blue
      techBorder = 0x0ea5e9;
      badgeText = '⚙️ MECH-CYBORG: GOLIATH';
      centerSpriteKey = 'enemy_orc';
      leftSpriteKey = 'enemy_cave_goblin';
      rightSpriteKey = 'enemy_bomber';
    } else if (worldId === 'dead_mountain') {
      nebulaColor = 0xdc2626; // Char Magma Red
      techBorder = 0xf43f5e;
      badgeText = '🔥 MAGMA-TITAN: ULTRALISK';
      centerSpriteKey = 'enemy_magma_orc';
      leftSpriteKey = 'enemy_hellhound';
      rightSpriteKey = 'enemy_lava_golem';
    } else if (worldId === 'dungeon') {
      nebulaColor = 0x8b5cf6; // Void Celestial Purple
      techBorder = 0xa855f7;
      badgeText = '⚡ VOID-WESEN: OVERLORD';
      centerSpriteKey = 'enemy_boss';
      leftSpriteKey = 'enemy_witch';
      rightSpriteKey = 'enemy_armored_troll';
    }

    if (isUnlocked) {
      bg.fillStyle(nebulaColor, 0.25);
      bg.fillCircle(0, 0, 52);
      bg.fillStyle(nebulaColor, 0.15);
      bg.fillCircle(-40, -10, 36);
      bg.fillCircle(40, 10, 36);

      // Funkelnde Galaxie-Sterne
      bg.fillStyle(0xffffff, 0.9);
      const starOffsets = [
        [-80, -35], [-45, -42], [-15, -45], [35, -38], [80, -32],
        [-90, 20], [-60, 35], [20, 38], [75, 25], [95, -10]
      ];
      starOffsets.forEach(([sx, sy]) => {
        bg.fillCircle(sx, sy, 1.2);
      });
    }

    // Rahmen & Tech-Corner-Brackets
    bg.lineStyle(1.5, isUnlocked ? techBorder : 0x334155, 0.8);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);

    // Eck-Brackets im Sci-Fi-Stil
    bg.lineStyle(2, isUnlocked ? 0xffffff : 0x64748b, 0.9);
    const bLen = 10;
    // Oben-links
    bg.lineBetween(-boxW / 2, -boxH / 2 + bLen, -boxW / 2, -boxH / 2);
    bg.lineBetween(-boxW / 2, -boxH / 2, -boxW / 2 + bLen, -boxH / 2);
    // Oben-rechts
    bg.lineBetween(boxW / 2 - bLen, -boxH / 2, boxW / 2, -boxH / 2);
    bg.lineBetween(boxW / 2, -boxH / 2, boxW / 2, -boxH / 2 + bLen);
    // Unten-links
    bg.lineBetween(-boxW / 2, boxH / 2 - bLen, -boxW / 2, boxH / 2);
    bg.lineBetween(-boxW / 2, boxH / 2, -boxW / 2 + bLen, boxH / 2);
    // Unten-rechts
    bg.lineBetween(boxW / 2 - bLen, boxH / 2, boxW / 2, boxH / 2);
    bg.lineBetween(boxW / 2, boxH / 2, boxW / 2, boxH / 2 - bLen);

    showcase.add(bg);

    if (isUnlocked) {
      // 2. Galaxie-Wesen Sprites (Flankierende Kreaturen)
      const leftCreature = this.add.sprite(-62, 4, leftSpriteKey).setScale(1.15);
      const rightCreature = this.add.sprite(62, 4, rightSpriteKey).setScale(1.15);
      const centerCreature = this.add.sprite(0, 0, centerSpriteKey).setScale(1.55);

      showcase.add([leftCreature, rightCreature, centerCreature]);

      // Lebendige Atmungs-/Schweb-Animation
      this.tweens.add({
        targets: centerCreature,
        y: -4,
        scaleY: 1.62,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: [leftCreature, rightCreature],
        y: 8,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 300
      });

      // Hologramm-Scan-Leiste oben
      const scanBadge = this.add.text(0, -boxH / 2 + 10, badgeText, {
        fontFamily: GAME_FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      showcase.add(scanBadge);
    } else {
      // Gesperrtes Holo-Display mit Scan-Verzerrung
      const lockIcon = this.add.text(0, -6, '🔒', { fontSize: '26px' }).setOrigin(0.5);
      const lockLabel = this.add.text(0, 24, 'BIO-SCAN VERSCHLÜSSELT', {
        fontFamily: GAME_FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ef4444',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      showcase.add([lockIcon, lockLabel]);
    }

    card.add(showcase);
  }

  private createBottomButton(x: number, y: number, text: string, color: number, border: number, onClick: () => void, btnWidth: number = 260): void {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    const halfW = btnWidth / 2;
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-halfW, -22, btnWidth, 44, 6);
    bg.lineStyle(2, border, 1);
    bg.strokeRoundedRect(-halfW, -22, btnWidth, 44, 6);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(btnWidth, 44);
    btn.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, btnWidth, 44),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(border, 1);
      bg.fillRoundedRect(-halfW, -22, btnWidth, 44, 6);
      bg.lineStyle(2, 0xffffff, 1);
      bg.strokeRoundedRect(-halfW, -22, btnWidth, 44, 6);
      btn.setScale(1.03);
    });
    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-halfW, -22, btnWidth, 44, 6);
      bg.lineStyle(2, border, 1);
      bg.strokeRoundedRect(-halfW, -22, btnWidth, 44, 6);
      btn.setScale(1.0);
    });
  }
}
