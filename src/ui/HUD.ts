import Phaser from 'phaser';
import { GAME_WIDTH, PALETTE } from '../config/GameConfig';

export class HUD extends Phaser.GameObjects.Container {
  private livesText: Phaser.GameObjects.Text;
  private goldText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;

  private btnSpeed1: Phaser.GameObjects.Container;
  private btnSpeed2: Phaser.GameObjects.Container;
  private btnNextWave: Phaser.GameObjects.Container;
  private nextWaveLabel!: Phaser.GameObjects.Text;

  private announcementText: Phaser.GameObjects.Text;
  private announcementBg: Phaser.GameObjects.Graphics;

  private onSpeedChange: (multiplier: number) => void;
  private onNextWaveClicked: () => void;

  constructor(
    scene: Phaser.Scene,
    initialLives: number,
    initialGold: number,
    callbacks: {
      onSpeedChange: (multiplier: number) => void;
      onNextWaveClicked: () => void;
    }
  ) {
    super(scene, 0, 0);
    this.onSpeedChange = callbacks.onSpeedChange;
    this.onNextWaveClicked = callbacks.onNextWaveClicked;

    // Top Bar Hintergrund (Höhe 40px, Breite 1280px)
    const topBar = scene.add.graphics();
    topBar.fillStyle(PALETTE.uiBg, 0.92);
    topBar.fillRect(0, 0, GAME_WIDTH, 42);
    topBar.lineStyle(2, PALETTE.uiBorder, 1);
    topBar.lineBetween(0, 42, GAME_WIDTH, 42);
    this.add(topBar);

    // 1. LEBEN
    const heartIcon = scene.add.image(24, 21, 'icon_heart');
    this.add(heartIcon);

    this.livesText = scene.add.text(42, 13, `${initialLives}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: PALETTE.uiTextRed
    });
    this.add(this.livesText);

    // 2. GOLD
    const goldIcon = scene.add.image(140, 21, 'icon_gold');
    this.add(goldIcon);

    this.goldText = scene.add.text(158, 13, `${initialGold}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: PALETTE.uiTextGold
    });
    this.add(this.goldText);

    // 3. WELLE
    const waveIcon = scene.add.image(300, 21, 'icon_wave');
    this.add(waveIcon);

    this.waveText = scene.add.text(320, 13, 'Welle: 0 / 10', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: PALETTE.uiTextWhite
    });
    this.add(this.waveText);

    // 4. SCORE
    this.scoreText = scene.add.text(540, 13, 'Punkte: 0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: PALETTE.uiTextBlue
    });
    this.add(this.scoreText);

    // 5. SPEED BUTTONS (1x und 2x)
    this.btnSpeed1 = this.createSpeedButton(860, 21, '1x', 1.0, true);
    this.btnSpeed2 = this.createSpeedButton(920, 21, '2x', 2.0, false);
    this.add(this.btnSpeed1);
    this.add(this.btnSpeed2);

    // 6. NÄCHSTE WELLE BUTTON
    this.btnNextWave = this.createNextWaveButton(1120, 21);
    this.add(this.btnNextWave);

    // 7. ANNOUNCEMENT OVERLAY
    this.announcementBg = scene.add.graphics();
    this.announcementBg.fillStyle(0x0e0d14, 0.88);
    this.announcementBg.fillRoundedRect(GAME_WIDTH / 2 - 380, 52, 760, 40, 6);
    this.announcementBg.lineStyle(2, 0xd4af37, 0.9);
    this.announcementBg.strokeRoundedRect(GAME_WIDTH / 2 - 380, 52, 760, 40, 6);
    this.announcementBg.setAlpha(0);
    this.add(this.announcementBg);

    this.announcementText = scene.add.text(GAME_WIDTH / 2, 72, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffd13b',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    this.add(this.announcementText);

    this.setDepth(100);
    scene.add.existing(this);
  }

  private createSpeedButton(x: number, y: number, label: string, speedVal: number, isActive: boolean): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    const drawBg = (active: boolean) => {
      bg.clear();
      bg.fillStyle(active ? 0x483d5a : 0x221f2d, 1);
      bg.fillRoundedRect(-22, -14, 44, 28, 4);
      bg.lineStyle(2, active ? 0x8a78a5 : 0x3d354a, 1);
      bg.strokeRoundedRect(-22, -14, 44, 28, 4);
    };
    drawBg(isActive);
    container.add(bg);

    const text = this.scene.add.text(0, 0, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: isActive ? '#ffffff' : '#8c829e'
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(44, 28);
    container.setInteractive(new Phaser.Geom.Rectangle(-22, -14, 44, 28), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.setActiveSpeedButton(speedVal);
      this.onSpeedChange(speedVal);
    });

    return container;
  }

  private setActiveSpeedButton(speed: number): void {
    // Buttons optisch aktualisieren
    const is1 = speed === 1.0;
    const bg1 = this.btnSpeed1.getAt(0) as Phaser.GameObjects.Graphics;
    const text1 = this.btnSpeed1.getAt(1) as Phaser.GameObjects.Text;
    bg1.clear();
    bg1.fillStyle(is1 ? 0x483d5a : 0x221f2d, 1);
    bg1.fillRoundedRect(-22, -14, 44, 28, 4);
    bg1.lineStyle(2, is1 ? 0x8a78a5 : 0x3d354a, 1);
    bg1.strokeRoundedRect(-22, -14, 44, 28, 4);
    text1.setColor(is1 ? '#ffffff' : '#8c829e');

    const bg2 = this.btnSpeed2.getAt(0) as Phaser.GameObjects.Graphics;
    const text2 = this.btnSpeed2.getAt(1) as Phaser.GameObjects.Text;
    bg2.clear();
    bg2.fillStyle(!is1 ? 0x483d5a : 0x221f2d, 1);
    bg2.fillRoundedRect(-22, -14, 44, 28, 4);
    bg2.lineStyle(2, !is1 ? 0x8a78a5 : 0x3d354a, 1);
    bg2.strokeRoundedRect(-22, -14, 44, 28, 4);
    text2.setColor(!is1 ? '#ffffff' : '#8c829e');
  }

  private createNextWaveButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2d6323, 1);
    bg.fillRoundedRect(-90, -14, 180, 28, 4);
    bg.lineStyle(2, 0x518233, 1);
    bg.strokeRoundedRect(-90, -14, 180, 28, 4);
    container.add(bg);

    this.nextWaveLabel = this.scene.add.text(0, 0, 'WELLE STARTEN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(this.nextWaveLabel);

    container.setSize(180, 28);
    container.setInteractive(new Phaser.Geom.Rectangle(-90, -14, 180, 28), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.onNextWaveClicked();
    });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x38782c, 1);
      bg.fillRoundedRect(-90, -14, 180, 28, 4);
      bg.lineStyle(2, 0x6bb844, 1);
      bg.strokeRoundedRect(-90, -14, 180, 28, 4);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2d6323, 1);
      bg.fillRoundedRect(-90, -14, 180, 28, 4);
      bg.lineStyle(2, 0x518233, 1);
      bg.strokeRoundedRect(-90, -14, 180, 28, 4);
    });

    return container;
  }

  public setNextWaveButtonEnabled(enabled: boolean, label: string = 'WELLE STARTEN'): void {
    this.nextWaveLabel.setText(label);
    const bg = this.btnNextWave.getAt(0) as Phaser.GameObjects.Graphics;

    if (enabled) {
      this.btnNextWave.setInteractive();
      bg.clear();
      bg.fillStyle(0x2d6323, 1);
      bg.fillRoundedRect(-90, -14, 180, 28, 4);
      bg.lineStyle(2, 0x518233, 1);
      bg.strokeRoundedRect(-90, -14, 180, 28, 4);
      this.nextWaveLabel.setColor('#ffffff');
    } else {
      this.btnNextWave.disableInteractive();
      bg.clear();
      bg.fillStyle(0x221f2d, 1);
      bg.fillRoundedRect(-90, -14, 180, 28, 4);
      bg.lineStyle(2, 0x3d354a, 1);
      bg.strokeRoundedRect(-90, -14, 180, 28, 4);
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
    this.waveText.setText(`Welle: ${current} / ${total}`);
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
