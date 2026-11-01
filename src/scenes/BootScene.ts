import Phaser from 'phaser';
import { PixelTextureGenerator } from '../systems/PixelTextureGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public preload(): void {
    // Generiere alle Pixel-Art-Grafiken zur Laufzeit
    PixelTextureGenerator.generateAll(this);
  }

  public create(): void {
    // Weiter zur Menü-Szene
    this.scene.start('MenuScene');
  }
}

