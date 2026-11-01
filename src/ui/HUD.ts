import Phaser from 'phaser';
import { GAME_FONT, GAME_WIDTH, PALETTE } from '../config/GameConfig';
import { SoundManager } from '../systems/SoundManager';

export class HUD extends Phaser.GameObjects.Container {
  private livesText: Phaser.GameObjects.Text;
  private goldText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;

  private speedButtons: Map<number, Phaser.GameObjects.Container> = new Map();
  private btnPause: Phaser.GameObjects.Container;
  private btnNextWave: Phaser.GameObjects.Container;
  private nextWaveLabel!: Phaser.GameObjects.Text;

  private announcementText: Phaser.GameObjects.Text;
  private announcementBg: Phaser.GameObjects.Graphics;

  private onSpeedChange: (multiplier: number) => void;
  private onNextWaveClicked: () => void;
  private onPauseClicked: () => void;

  constructor(
    scene: Phaser.Scene,
    initialLives: number,
    initialGold: number,
    callbacks: {
      onSpeedChange: (multiplier: number) => void;
      onNextWaveClicked: () => void;
      onPauseClicked: () => void;
    }
  ) {
    super(scene, 0, 0);
    this.onSpeedChange = callbacks.onSpeedChange;
    this.onNextWaveClicked = callbacks.onNextWaveClicked;
    this.onPauseClicked = callbacks.onPauseClicked;

    // Top Bar Hintergrund
    const topBar = scene.add.graphics();
    topBar.fillStyle(PALETTE.uiBg, 0.95);
    topBar.fillRect(0, 0, GAME_WIDTH, 44);
    topBar.lineStyle(2, PALETTE.uiBorder, 1);
    topBar.lineBetween(0, 44, GAME_WIDTH, 44);
    this.add(topBar);

    // 1. LEBEN
    const heartIcon = scene.add.image(26, 22, 'icon_heart');
    this.add(heartIcon);

    this.livesText = scene.add.text(44, 11, `${initialLives}`, {
      fontFamily: GAME_FONT,
      fontSize: '16px',
      fontStyle: 'bold',
      color: PALETTE.uiTextRed,
      stroke: '#000000',
      strokeThickness: 2
    });
    this.add(this.livesText);

    // 2. GOLD
    const goldIcon = scene.add.image(110, 22, 'icon_gold');
    this.add(goldIcon);

    this.goldText = scene.add.text(128, 11, `${initialGold}`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      fontStyle: 'bold',
      color: PALETTE.uiTextGold,
      stroke: '#000000',
      strokeThickness: 2
    });
    this.add(this.goldText);

    // 3. WELLE
    const waveIcon = scene.add.image(218, 22, 'icon_wave');
    this.add(waveIcon);

    this.waveText = scene.add.text(238, 11, 'Welle: 0 / 10', {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      fontStyle: 'bold',
      color: PALETTE.uiTextWhite,
      stroke: '#000000',
      strokeThickness: 1.5
    });
    this.add(this.waveText);

    // 4. SCORE (Sicherer Abstand zum Pause-Button, absolut überschneidungsfrei)
    this.scoreText = scene.add.text(340, 11, 'Punkte: 0', {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      fontStyle: 'bold',
      color: PALETTE.uiTextBlue,
      stroke: '#000000',
      strokeThickness: 1.5
    });
    this.add(this.scoreText);

    // 5. PAUSE-BUTTON (Sauber positioniert bei x=535, kein Überlappen)
    this.btnPause = this.createPauseButton(535, 22);
    this.add(this.btnPause);

    // 6. SPEED BUTTONS (1x, 2x, 3x, 5x)
    const speeds = [1.0, 2.0, 3.0, 5.0];
    const speedLabels = ['1x', '2x', '3x', '5x'];
    speeds.forEach((sp, i) => {
      const btn = this.createSpeedButton(595 + i * 38, 22, speedLabels[i], sp, sp === 1.0);
      this.speedButtons.set(sp, btn);
      this.add(btn);
    });

    // 7. IN-GAME SOUND TOGGLE BUTTON
    const btnSound = this.createSoundButton(785, 22);
    this.add(btnSound);

    // 8. VOLLBILD BUTTON
    const btnFullscreen = this.createFullscreenButton(920, 22);
    this.add(btnFullscreen);

    // 9. NÄCHSTE WELLE BUTTON (Bündig und reaktiv rechts)
    this.btnNextWave = this.createNextWaveButton(1135, 22);
    this.add(this.btnNextWave);

    // 8. ANNOUNCEMENT OVERLAY
    this.announcementBg = scene.add.graphics();
    this.announcementBg.fillStyle(0x0e0d14, 0.9);
    this.announcementBg.fillRoundedRect(GAME_WIDTH / 2 - 380, 52, 760, 40, 6);
    this.announcementBg.lineStyle(2, 0xd4af37, 0.9);
    this.announcementBg.strokeRoundedRect(GAME_WIDTH / 2 - 380, 52, 760, 40, 6);
    this.announcementBg.setAlpha(0);
    this.add(this.announcementBg);

    this.announcementText = scene.add.text(GAME_WIDTH / 2, 72, '', {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#ffd13b',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);
    this.add(this.announcementText);

    this.setDepth(100);
    scene.add.existing(this);
  }

  private createPauseButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x3d354a, 1);
    bg.fillRoundedRect(-30, -14, 60, 28, 4);
    bg.lineStyle(2, 0x8a78a5, 1);
    bg.strokeRoundedRect(-30, -14, 60, 28, 4);
    container.add(bg);

    const text = this.scene.add.text(0, 0, 'PAUSE', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(60, 28);
    container.setInteractive(new Phaser.Geom.Rectangle(-32, -16, 64, 32), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      container.setScale(0.93);
      SoundManager.playClick();
      this.onPauseClicked();
    });

    container.on('pointerup', () => {
      container.setScale(1.0);
    });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x564969, 1);
      bg.fillRoundedRect(-30, -14, 60, 28, 4);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
      bg.clear();
      bg.fillStyle(0x3d354a, 1);
      bg.fillRoundedRect(-30, -14, 60, 28, 4);
      bg.lineStyle(2, 0x8a78a5, 1);
      bg.strokeRoundedRect(-30, -14, 60, 28, 4);
    });

    return container;
  }

  private createSpeedButton(x: number, y: number, label: string, speedVal: number, isActive: boolean): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    const drawBg = (active: boolean) => {
      bg.clear();
      bg.fillStyle(active ? 0x27ae60 : 0x221f2d, 1);
      bg.fillRoundedRect(-18, -14, 36, 28, 4);
      bg.lineStyle(2, active ? 0x2ecc71 : 0x3d354a, 1);
      bg.strokeRoundedRect(-18, -14, 36, 28, 4);
    };
    drawBg(isActive);
    container.add(bg);

    const text = this.scene.add.text(0, 0, label, {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: isActive ? '#ffffff' : '#8c829e'
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(36, 28);
    container.setInteractive(new Phaser.Geom.Rectangle(-20, -16, 40, 32), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      container.setScale(0.92);
      SoundManager.playClick();
      this.setActiveSpeedButton(speedVal);
      this.onSpeedChange(speedVal);
    });

    container.on('pointerup', () => {
      container.setScale(1.0);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
    });

    return container;
  }

  private setActiveSpeedButton(activeSpeed: number): void {
    this.speedButtons.forEach((btn, sp) => {
      const isCur = sp === activeSpeed;
      const bg = btn.getAt(0) as Phaser.GameObjects.Graphics;
      const text = btn.getAt(1) as Phaser.GameObjects.Text;
      bg.clear();
      bg.fillStyle(isCur ? 0x27ae60 : 0x221f2d, 1);
      bg.fillRoundedRect(-18, -14, 36, 28, 4);
      bg.lineStyle(2, isCur ? 0x2ecc71 : 0x3d354a, 1);
      bg.strokeRoundedRect(-18, -14, 36, 28, 4);
      text.setColor(isCur ? '#ffffff' : '#8c829e');
    });
  }

  private createSoundButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    const isMuted = SoundManager.getIsMuted();

    const drawBg = (muted: boolean) => {
      bg.clear();
      bg.fillStyle(muted ? 0x3d1c24 : 0x221f2d, 1);
      bg.fillRoundedRect(-36, -14, 72, 28, 4);
      bg.lineStyle(2, muted ? 0xe74c3c : 0x4d4766, 1);
      bg.strokeRoundedRect(-36, -14, 72, 28, 4);
    };
    drawBg(isMuted);
    container.add(bg);

    const label = this.scene.add.text(0, 0, isMuted ? '🔇 AUS' : '🔊 AN', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: isMuted ? '#ff7675' : '#55efc4'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(72, 28);
    container.setInteractive(new Phaser.Geom.Rectangle(-38, -16, 76, 32), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      container.setScale(0.94);
      const muted = SoundManager.toggleMute();
      drawBg(muted);
      label.setText(muted ? '🔇 AUS' : '🔊 AN');
      label.setColor(muted ? '#ff7675' : '#55efc4');
    });

    container.on('pointerup', () => {
      container.setScale(1.0);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
    });

    return container;
  }

  private createFullscreenButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x272438, 1);
    bg.fillRoundedRect(-44, -14, 88, 28, 4);
    bg.lineStyle(2, 0x4d4766, 1);
    bg.strokeRoundedRect(-44, -14, 88, 28, 4);
    container.add(bg);

    const text = this.scene.add.text(0, 0, '⛶ VOLLBILD', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e4deec'
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(88, 28);
    container.setInteractive(new Phaser.Geom.Rectangle(-46, -16, 92, 32), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      container.setScale(0.94);
      SoundManager.playClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    container.on('pointerup', () => {
      container.setScale(1.0);
    });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x38344e, 1);
      bg.fillRoundedRect(-44, -14, 88, 28, 4);
      bg.lineStyle(2, 0x7c73a0, 1);
      bg.strokeRoundedRect(-44, -14, 88, 28, 4);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
      bg.clear();
      bg.fillStyle(0x272438, 1);
      bg.fillRoundedRect(-44, -14, 88, 28, 4);
      bg.lineStyle(2, 0x4d4766, 1);
      bg.strokeRoundedRect(-44, -14, 88, 28, 4);
    });

    return container;
  }

  private createRtsPrototypeButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0369a1, 1);
    bg.fillRoundedRect(-46, -14, 92, 28, 4);
    bg.lineStyle(2, 0x38bdf8, 1);
    bg.strokeRoundedRect(-46, -14, 92, 28, 4);
    container.add(bg);

    const text = this.scene.add.text(0, 0, '🛸 RTS 3D', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e0f2fe'
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(92, 28);
    container.setInteractive(new Phaser.Geom.Rectangle(-46, -14, 92, 28), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      SoundManager.playClick();
      this.scene.scene.start('StarCraftPrototypeScene');
    });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x0284c7, 1);
      bg.fillRoundedRect(-46, -14, 92, 28, 4);
      bg.lineStyle(2, 0x7dd3fc, 1);
      bg.strokeRoundedRect(-46, -14, 92, 28, 4);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x0369a1, 1);
      bg.fillRoundedRect(-46, -14, 92, 28, 4);
      bg.lineStyle(2, 0x38bdf8, 1);
      bg.strokeRoundedRect(-46, -14, 92, 28, 4);
    });

    return container;
  }

  private createNextWaveButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2d6323, 1);
    bg.fillRoundedRect(-95, -15, 190, 30, 4);
    bg.lineStyle(2, 0x518233, 1);
    bg.strokeRoundedRect(-95, -15, 190, 30, 4);
    container.add(bg);

    this.nextWaveLabel = this.scene.add.text(0, 0, 'WELLE STARTEN', {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);
    container.add(this.nextWaveLabel);

    container.setSize(190, 30);
    container.setInteractive(new Phaser.Geom.Rectangle(-98, -17, 196, 34), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      container.setScale(0.96);
      SoundManager.playClick();
      this.onNextWaveClicked();
    });

    container.on('pointerup', () => {
      container.setScale(1.0);
    });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x38782c, 1);
      bg.fillRoundedRect(-95, -15, 190, 30, 4);
      bg.lineStyle(2, 0x6bb844, 1);
      bg.strokeRoundedRect(-95, -15, 190, 30, 4);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
      bg.clear();
      bg.fillStyle(0x2d6323, 1);
      bg.fillRoundedRect(-95, -15, 190, 30, 4);
      bg.lineStyle(2, 0x518233, 1);
      bg.strokeRoundedRect(-95, -15, 190, 30, 4);
    });

    return container;
  }

  public setNextWaveButtonEnabled(enabled: boolean, label: string = 'WELLE STARTEN'): void {
    this.nextWaveLabel.setText(label);
    const bg = this.btnNextWave.getAt(0) as Phaser.GameObjects.Graphics;

    if (enabled) {
      this.btnNextWave.setInteractive(new Phaser.Geom.Rectangle(-98, -17, 196, 34), Phaser.Geom.Rectangle.Contains);
      bg.clear();
      bg.fillStyle(0x2d6323, 1);
      bg.fillRoundedRect(-95, -15, 190, 30, 4);
      bg.lineStyle(2, 0x518233, 1);
      bg.strokeRoundedRect(-95, -15, 190, 30, 4);
      this.nextWaveLabel.setColor('#ffffff');
    } else {
      this.btnNextWave.disableInteractive();
      bg.clear();
      bg.fillStyle(0x221f2d, 1);
      bg.fillRoundedRect(-95, -15, 190, 30, 4);
      bg.lineStyle(2, 0x3d354a, 1);
      bg.strokeRoundedRect(-95, -15, 190, 30, 4);
      this.nextWaveLabel.setColor('#686075');
    }
  }

  public updateLives(lives: number): void {
    this.livesText.setText(`${lives}`);
  }

  public updateGold(gold: number): void {
    this.goldText.setText(`${gold}`);
  }

  public updateScore(score: number): void {
    this.scoreText.setText(`Punkte: ${score}`);
  }

  public updateWave(current: number, total: number): void {
    if (total === 30) {
      this.waveText.setText(`Kammer: ${current} / 30`);
    } else if (total === 0 || total > 100) {
      this.waveText.setText(`Welle: ${current} / ∞ (Endlos)`);
    } else {
      this.waveText.setText(`Welle: ${current} / ${total}`);
    }
  }

  public showAnnouncement(text: string): void {
    this.announcementText.setText(text);
    this.announcementBg.setAlpha(1);
    this.announcementText.setAlpha(1);

    this.scene.tweens.killTweensOf([this.announcementBg, this.announcementText]);
    this.scene.tweens.add({
      targets: [this.announcementBg, this.announcementText],
      alpha: 0,
      delay: 3500,
      duration: 600
    });
  }
}
