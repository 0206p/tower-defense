import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { SoundManager } from '../systems/SoundManager';

export class PauseModal extends Phaser.GameObjects.Container {
  private isShowing: boolean = false;
  private onResumeCallback: () => void;
  private onQuitCallback: () => void;

  constructor(
    scene: Phaser.Scene,
    callbacks: {
      onResume: () => void;
      onQuit: () => void;
    }
  ) {
    super(scene, 0, 0);
    this.onResumeCallback = callbacks.onResume;
    this.onQuitCallback = callbacks.onQuit;

    // Halbtransparenter Vollbild-Schatten
    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.add(overlay);

    // Dialog-Box
    const boxW = 420;
    const boxH = 320;
    const boxX = (GAME_WIDTH - boxW) / 2;
    const boxY = (GAME_HEIGHT - boxH) / 2;

    const box = scene.add.graphics();
    box.fillStyle(0x1c1726, 0.98);
    box.fillRoundedRect(boxX, boxY, boxW, boxH, 10);
    box.lineStyle(3, 0xd4af37, 1);
    box.strokeRoundedRect(boxX, boxY, boxW, boxH, 10);
    box.lineStyle(1, 0x8a78a5, 0.7);
    box.strokeRoundedRect(boxX + 6, boxY + 6, boxW - 12, boxH - 12, 8);
    this.add(box);

    // Titel
    const title = scene.add.text(GAME_WIDTH / 2, boxY + 45, 'SPIEL PAUSIERT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffd13b'
    }).setOrigin(0.5);
    this.add(title);

    const sub = scene.add.text(GAME_WIDTH / 2, boxY + 80, 'Das Königreich wartet auf deine Befehle.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#a4b0be'
    }).setOrigin(0.5);
    this.add(sub);

    // [WEITER] Button
    const resumeBtn = this.createButton(GAME_WIDTH / 2, boxY + 140, 'WEITER SPIELEN', 280, 44, 0x27ae60, 0x2ecc71, () => {
      SoundManager.playClick();
      this.hide();
      this.onResumeCallback();
    });
    this.add(resumeBtn);

    // [SOUND AN / AUS] Button
    const soundLabel = SoundManager.getIsMuted() ? '🔊 SOUND: AUS' : '🔊 SOUND: AN';
    const soundBtn = this.createButton(GAME_WIDTH / 2, boxY + 195, soundLabel, 280, 40, 0x3d354a, 0x8a78a5, () => {
      const muted = SoundManager.toggleMute();
      (soundBtn.getAt(1) as Phaser.GameObjects.Text).setText(muted ? '🔊 SOUND: AUS' : '🔊 SOUND: AN');
    });
    this.add(soundBtn);

    // [ABBRECHEN / ZURÜCK] Button
    const quitBtn = this.createButton(GAME_WIDTH / 2, boxY + 250, 'ABBRECHEN (BEENDEN)', 280, 42, 0x7a2828, 0xa33b3b, () => {
      SoundManager.playClick();
      this.hide();
      this.onQuitCallback();
    });
    this.add(quitBtn);

    this.setDepth(200);
    this.setVisible(false);
    scene.add.existing(this);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    w: number,
    h: number,
    color: number,
    borderColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    container.add(bg);

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', onClick);
    container.on('pointerover', () => container.setScale(1.03));
    container.on('pointerout', () => container.setScale(1.0));

    return container;
  }

  public show(): void {
    this.isShowing = true;
    this.setVisible(true);
  }

  public hide(): void {
    this.isShowing = false;
    this.setVisible(false);
  }

  public isOpen(): boolean {
    return this.isShowing;
  }
}
