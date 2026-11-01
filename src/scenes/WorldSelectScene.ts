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

    // Unten: Upgrade-Menü Button & Menü Button mit großzügigem Abstand
    this.createBottomButton(GAME_WIDTH / 2 - 180, 648, '💎 TURM-SCHMIEDE', 0x512b7a, 0x8e44ad, () => {
      SoundManager.playClick();
      this.scene.start('UpgradeMenuScene');
    });

    this.createBottomButton(GAME_WIDTH / 2 + 180, 648, 'HAUPTMENÜ', 0x2d3436, 0x636e72, () => {
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
    const title = this.add.text(w / 2, 35, def.name.toUpperCase(), {
      fontFamily: GAME_FONT,
      fontSize: '18px',
      color: isUnlocked ? def.textColor : '#7f8c8d',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    card.add(title);

    // Schwierigkeit Pill
    const diffText = this.add.text(w / 2, 70, `SCHWIERIGKEIT: ${def.difficulty}`, {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: isUnlocked ? def.difficultyColor : '#57606f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    card.add(diffText);

    // Deko-Kacheln
    const tileKey = worldId === 'dungeon'
      ? 'tile_ground_dungeon'
      : worldId === 'dead_mountain'
      ? 'tile_ground_mountain'
      : worldId === 'goblin_caves'
      ? 'tile_ground_cave'
      : 'tile_ground_witch';

    for (let bx = 0; bx < 3; bx++) {
      for (let by = 0; by < 2; by++) {
        const mini = this.add.image(w / 2 - 40 + bx * 40, 125 + by * 38, tileKey).setScale(0.85);
        if (!isUnlocked) mini.setTint(0x333333);
        card.add(mini);
      }
    }

    // Beschreibung (Groß & lesbar)
    const desc = this.add.text(w / 2, 235, def.description, {
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

    const progressText = this.add.text(w / 2, 320, progressLabel, {
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
        hitArea: new Phaser.Geom.Rectangle(-100, -20, 200, 40),
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
        ? 'dem Toten Berg'
        : worldId === 'dead_mountain'
        ? 'den Goblinhöhlen'
        : 'der Hexenwelt';
      const lockText = this.add.text(w / 2, 408, `🔒 GESPERRT\nErfordert 30 Missionen\nin ${reqWorld}`, {
        fontFamily: GAME_FONT,
        fontSize: '13px',
        lineSpacing: 5,
        color: '#e74c3c',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      card.add(lockText);
    }
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
      hitArea: new Phaser.Geom.Rectangle(-160, -22, 320, 44),
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
