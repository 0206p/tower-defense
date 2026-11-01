import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { WORLDS_CONFIG, WorldDefinition } from '../config/WorldConfig';
import { SaveSystem, WorldId } from '../systems/SaveSystem';

export class WorldSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldSelectScene' });
  }

  public create(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x110f17, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Header
    this.add.text(GAME_WIDTH / 2, 45, 'KAMPAGNEN-WELTEN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#ffd13b'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 80, 'Wähle eine Kampagne. Jede Welt umfasst 50 herausfordernde Missionen.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#9e97b0'
    }).setOrigin(0.5);

    // Kristall-Anzeige oben rechts
    const crystals = SaveSystem.getCrystals();
    this.add.image(GAME_WIDTH - 150, 45, 'icon_crystal').setScale(1.2);
    this.add.text(GAME_WIDTH - 130, 45, `${crystals}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#be2edd'
    }).setOrigin(0, 0.5);

    // 3 Welten-Karten nebeneinander
    const worldIds: WorldId[] = ['witch_forest', 'goblin_caves', 'dead_mountain'];
    const cardWidth = 360;
    const startX = 140;

    worldIds.forEach((wId, idx) => {
      this.createWorldCard(wId, startX + idx * 390, 120, cardWidth, 440);
    });

    // Unten: Upgrade-Menü Button & Menü Button
    this.createBottomButton(GAME_WIDTH / 2 - 160, 640, '💎 TURM-SCHMIEDE (UPGRADES)', 0x512b7a, 0x8e44ad, () => {
      this.scene.start('UpgradeMenuScene');
    });

    this.createBottomButton(GAME_WIDTH / 2 + 180, 640, '< HAUPTMENÜ', 0x2d3436, 0x636e72, () => {
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
      bg.fillStyle(def.themeColor, 0.25);
      bg.fillRoundedRect(0, 0, w, h, 10);
      bg.lineStyle(3, def.themeColor, 1);
      bg.strokeRoundedRect(0, 0, w, h, 10);
    } else {
      bg.fillStyle(0x1a1a24, 0.7);
      bg.fillRoundedRect(0, 0, w, h, 10);
      bg.lineStyle(2, 0x3d354a, 1);
      bg.strokeRoundedRect(0, 0, w, h, 10);
    }
    card.add(bg);

    // Titel
    const title = this.add.text(w / 2, 35, def.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: isUnlocked ? def.textColor : '#7f8c8d'
    }).setOrigin(0.5);
    card.add(title);

    // Schwierigkeit Pill
    const diffText = this.add.text(w / 2, 70, `SCHWIERIGKEIT: ${def.difficulty}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: isUnlocked ? def.difficultyColor : '#57606f'
    }).setOrigin(0.5);
    card.add(diffText);

    // Deko-Banner
    const banner = this.add.graphics();
    banner.fillStyle(def.themeColor, isUnlocked ? 0.8 : 0.2);
    banner.fillRoundedRect(16, 95, w - 32, 130, 8);
    card.add(banner);

    // Miniatur-Grafik der Welt
    const tileKey = worldId === 'dead_mountain' ? 'tile_ground_mountain' : worldId === 'goblin_caves' ? 'tile_ground_cave' : 'tile_ground_witch';
    for (let bx = 0; bx < 3; bx++) {
      for (let by = 0; by < 2; by++) {
        const mini = this.add.image(w / 2 - 40 + bx * 40, 135 + by * 40, tileKey).setScale(0.85);
        if (!isUnlocked) mini.setTint(0x333333);
        card.add(mini);
      }
    }

    // Beschreibung
    const desc = this.add.text(w / 2, 255, def.description, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      lineSpacing: 6,
      color: isUnlocked ? '#dcdde1' : '#57606f',
      align: 'center',
      wordWrap: { width: w - 36 }
    }).setOrigin(0.5);
    card.add(desc);

    // Fortschritt
    const progressText = this.add.text(w / 2, 335, `FORTSCHRITT:\n${completed} / 50 MISSIONEN`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      lineSpacing: 5,
      color: isUnlocked ? '#ffd13b' : '#57606f',
      align: 'center'
    }).setOrigin(0.5);
    card.add(progressText);

    // Button / Sperr-Text
    if (isUnlocked) {
      const playBtn = this.add.container(w / 2, 395);
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x27ae60, 1);
      btnBg.fillRoundedRect(-90, -18, 180, 36, 6);
      btnBg.lineStyle(2, 0x2ecc71, 1);
      btnBg.strokeRoundedRect(-90, -18, 180, 36, 6);
      playBtn.add(btnBg);

      const btnLabel = this.add.text(0, 0, 'MISSIONEN ÖFFNEN', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#ffffff'
      }).setOrigin(0.5);
      playBtn.add(btnLabel);

      playBtn.setSize(180, 36);
      playBtn.setInteractive(new Phaser.Geom.Rectangle(-90, -18, 180, 36), Phaser.Geom.Rectangle.Contains);

      playBtn.on('pointerdown', () => {
        SaveSystem.getData().selectedWorld = worldId;
        SaveSystem.save();
        this.scene.start('MissionSelectScene', { worldId });
      });

      playBtn.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x2ecc71, 1);
        btnBg.fillRoundedRect(-90, -18, 180, 36, 6);
      });

      playBtn.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x27ae60, 1);
        btnBg.fillRoundedRect(-90, -18, 180, 36, 6);
      });

      card.add(playBtn);
    } else {
      const reqWorld = worldId === 'goblin_caves' ? 'der Hexenwelt' : 'den Goblinhöhlen';
      const lockText = this.add.text(w / 2, 395, `🔒 GESPERRT\nErfordert 50 Missionen in ${reqWorld}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        lineSpacing: 4,
        color: '#e74c3c',
        align: 'center'
      }).setOrigin(0.5);
      card.add(lockText);
    }
  }

  private createBottomButton(x: number, y: number, text: string, color: number, border: number, onClick: () => void): void {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-140, -18, 280, 36, 6);
    bg.lineStyle(2, border, 1);
    bg.strokeRoundedRect(-140, -18, 280, 36, 6);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff'
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 36);
    btn.setInteractive(new Phaser.Geom.Rectangle(-140, -18, 280, 36), Phaser.Geom.Rectangle.Contains);
    btn.on('pointerdown', onClick);
  }
}
