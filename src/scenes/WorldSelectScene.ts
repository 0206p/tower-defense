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

    this.add.text(GAME_WIDTH / 2, 75, 'Schließe jeweils 15 Missionen einer Welt ab, um die nächste Welt und das Dungeon freizuschalten.', {
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
      this.createWorldCard(wId, startX + idx * (cardWidth + gap), 95, cardWidth, 495);
    });

    // Unten: Skins, Schmiede & Menü mit großzügigem Abstand
    this.createBottomButton(GAME_WIDTH / 2 - 290, 650, '🎨 SKINS', 0x1e3a8a, 0x3b82f6, () => {
      SoundManager.playClick();
      this.scene.start('SkinShopScene');
    });

    this.createBottomButton(GAME_WIDTH / 2, 650, '⚙️ SCHMIEDE', 0x432368, 0x7b3fa8, () => {
      SoundManager.playClick();
      this.scene.start('UpgradeMenuScene');
    });

    this.createBottomButton(GAME_WIDTH / 2 + 290, 650, 'HAUPTMENÜ', 0x2d3436, 0x636e72, () => {
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
      bg.fillStyle(def.themeColor, 0.22);
      bg.fillRoundedRect(0, 0, w, h, 12);
      bg.lineStyle(2, def.themeColor, 0.85);
      bg.strokeRoundedRect(0, 0, w, h, 12);
    } else {
      bg.fillStyle(0x13131c, 0.8);
      bg.fillRoundedRect(0, 0, w, h, 12);
      bg.lineStyle(1.5, 0x2d2b38, 0.9);
      bg.strokeRoundedRect(0, 0, w, h, 12);
    }
    card.add(bg);

    // Titel (Groß & fett)
    const title = this.add.text(w / 2, 28, def.name.toUpperCase(), {
      fontFamily: GAME_FONT,
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: isUnlocked ? def.textColor : '#7f8c8d',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    card.add(title);

    // Schwierigkeit Pill
    const diffText = this.add.text(w / 2, 50, `SEKTOR-STUFE: ${def.difficulty}`, {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: isUnlocked ? def.difficultyColor : '#57606f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    card.add(diffText);

    // Nahtloses Hologramm-Schaufenster ohne eckige Umrandung
    this.createCreatureShowcase(card, worldId, isUnlocked, w);

    // Beschreibung mit angenehmem Abstand
    const desc = this.add.text(w / 2, 246, def.description, {
      fontFamily: GAME_FONT,
      fontSize: '11.5px',
      lineSpacing: 3.5,
      color: isUnlocked ? '#e2e8f0' : '#64748b',
      align: 'center',
      wordWrap: { width: w - 24 }
    }).setOrigin(0.5);
    card.add(desc);

    // Fortschrittsbalken & Zähler
    const isKammer = worldId === 'dungeon';
    const progressLabel = SaveSystem.isAdminMode()
      ? `FORTSCHRITT: ALLE FREI (ADMIN)`
      : `FORTSCHRITT: ${completed} / 15 ${isKammer ? 'KAMMERN' : 'MISSIONEN'}`;

    const progressText = this.add.text(w / 2, 350, progressLabel, {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: isUnlocked ? '#ffd13b' : '#64748b',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2.5
    }).setOrigin(0.5);
    card.add(progressText);

    // Fortschrittsbalken-Grafik
    const barG = this.add.graphics();
    const barW = 180;
    const barH = 6;
    const barX = (w - barW) / 2;
    const barY = 368;
    barG.fillStyle(0x0f172a, 0.9);
    barG.fillRoundedRect(barX, barY, barW, barH, 3);
    if (isUnlocked) {
      const fillW = Math.min(barW, Math.round(barW * (completed / 15)));
      barG.fillStyle(def.themeColor, 1);
      barG.fillRoundedRect(barX, barY, fillW, barH, 3);
    }
    card.add(barG);

    // Button / Sperr-Text
    if (isUnlocked) {
      const playBtn = this.add.container(w / 2, 428);
      const btnBg = this.add.graphics();
      const primaryColor = worldId === 'dungeon' ? 0x581c87 : 0x1e3a8a;
      const borderColor = worldId === 'dungeon' ? 0xa855f7 : 0x38bdf8;
      const hoverColor = worldId === 'dungeon' ? 0x7e22ce : 0x2563eb;

      btnBg.fillStyle(primaryColor, 1);
      btnBg.fillRoundedRect(-100, -20, 200, 40, 6);
      btnBg.lineStyle(2, borderColor, 1);
      btnBg.strokeRoundedRect(-100, -20, 200, 40, 6);
      playBtn.add(btnBg);

      const btnLabel = this.add.text(0, 0, isKammer ? '⚔️ KAMMERN BETRETEN' : '⚔️ SEKTOR STARTEN', {
        fontFamily: GAME_FONT,
        fontSize: '12.5px',
        fontStyle: 'bold',
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
        playBtn.setScale(1.03);
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
      const lockText = this.add.text(w / 2, 424, `🔒 GESPERRT\nErfordert 15 Missionen\nin ${reqWorld}`, {
        fontFamily: GAME_FONT,
        fontSize: '11.5px',
        lineSpacing: 4,
        color: '#f87171',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      card.add(lockText);
    }
  }

  private createCreatureShowcase(card: Phaser.GameObjects.Container, worldId: WorldId, isUnlocked: boolean, w: number): void {
    const boxX = w / 2;
    const boxY = 126;

    const showcase = this.add.container(boxX, boxY);

    // Kosmischer Nebel passend zum Biom
    let nebulaColor = 0x10b981; // Zerus Emerald
    let techBorder = 0x34d399;
    let badgeText = '🧬 XENO-BRUT';
    let centerSpriteKey = 'enemy_goblin';
    let leftSpriteKey = 'enemy_bat';
    let rightSpriteKey = 'enemy_slime';

    if (worldId === 'goblin_caves') {
      nebulaColor = 0x0284c7; // Korhal Neon Blue
      techBorder = 0x38bdf8;
      badgeText = '⚙️ MECH-CYBORGS';
      centerSpriteKey = 'enemy_orc';
      leftSpriteKey = 'enemy_cave_goblin';
      rightSpriteKey = 'enemy_bomber';
    } else if (worldId === 'dead_mountain') {
      nebulaColor = 0xdc2626; // Char Magma Red
      techBorder = 0xf87171;
      badgeText = '🔥 VULKAN-TITANEN';
      centerSpriteKey = 'enemy_magma_orc';
      leftSpriteKey = 'enemy_hellhound';
      rightSpriteKey = 'enemy_lava_golem';
    } else if (worldId === 'dungeon') {
      nebulaColor = 0x8b5cf6; // Void Celestial Purple
      techBorder = 0xc084fc;
      badgeText = '⚡ VOID-OVERLORDS';
      centerSpriteKey = 'enemy_boss';
      leftSpriteKey = 'enemy_witch';
      rightSpriteKey = 'enemy_armored_troll';
    }

    const bg = this.add.graphics();
    if (isUnlocked) {
      // Fließender kosmischer Nebel
      bg.fillStyle(nebulaColor, 0.2);
      bg.fillCircle(0, -4, 48);
      bg.fillStyle(nebulaColor, 0.1);
      bg.fillCircle(-35, 0, 32);
      bg.fillCircle(35, 0, 32);

      // Holographischer Projektionssockel (Elliptische Plattform ohne harte Boxgrenzen)
      bg.lineStyle(1.5, techBorder, 0.7);
      bg.strokeEllipse(0, 38, 160, 22);
      bg.fillStyle(techBorder, 0.08);
      bg.fillEllipse(0, 38, 160, 22);

      // Sanfte Vertikalstrahlen
      bg.lineStyle(1, techBorder, 0.25);
      [-60, -30, 0, 30, 60].forEach((lx) => {
        bg.lineBetween(lx, 38, lx * 0.7, -30);
      });
    } else {
      bg.fillStyle(0x1e293b, 0.3);
      bg.fillCircle(0, 0, 38);
      bg.lineStyle(1, 0x475569, 0.4);
      bg.strokeEllipse(0, 38, 120, 18);
    }
    showcase.add(bg);

    if (isUnlocked) {
      // Flankierende Kreaturen
      const leftCreature = this.add.sprite(-54, 10, leftSpriteKey).setScale(1.1);
      const rightCreature = this.add.sprite(54, 10, rightSpriteKey).setScale(1.1);
      const centerCreature = this.add.sprite(0, 4, centerSpriteKey).setScale(1.5);

      showcase.add([leftCreature, rightCreature, centerCreature]);

      // Lebendige Atmungs-/Schweb-Animation
      this.tweens.add({
        targets: centerCreature,
        y: -2,
        scaleY: 1.56,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.tweens.add({
        targets: [leftCreature, rightCreature],
        y: 6,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 300
      });

      // Hologramm-Spezies-Badge
      const badge = this.add.text(0, 56, badgeText, {
        fontFamily: GAME_FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#f8fafc',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      showcase.add(badge);
    } else {
      const lockIcon = this.add.text(0, 8, '🔒', {
        fontSize: '32px'
      }).setOrigin(0.5).setAlpha(0.65);
      showcase.add(lockIcon);
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
