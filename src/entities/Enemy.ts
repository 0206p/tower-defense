import Phaser from 'phaser';
import { EnemyDefinition } from '../config/EnemyConfig';
import { MapManager } from '../systems/MapManager';
import { EconomySystem } from '../systems/EconomySystem';

export class Enemy extends Phaser.GameObjects.Container {
  public config: EnemyDefinition;
  public currentHp: number;
  public maxHp: number;
  public isDead: boolean = false;
  public pathProgress: number = 0; // 0 bis 1
  private pathLength: number;
  private path: Phaser.Curves.Path;

  private sprite: Phaser.GameObjects.Sprite;
  private healthBarBg: Phaser.GameObjects.Graphics;
  private healthBarFill: Phaser.GameObjects.Graphics;

  private slowMultiplier: number = 1.0;
  private slowTimer: number = 0;
  private walkTime: number = 0;

  private mapManager: MapManager;
  private economy: EconomySystem;
  private onEnemyDeath: (enemy: Enemy) => void;
  private onEnemyReachedEnd: (enemy: Enemy) => void;

  constructor(
    scene: Phaser.Scene,
    config: EnemyDefinition,
    mapManager: MapManager,
    economy: EconomySystem,
    callbacks: {
      onDeath: (enemy: Enemy) => void;
      onReachedEnd: (enemy: Enemy) => void;
    },
    hpMultiplier: number = 1.0
  ) {
    super(scene, 0, 0);
    this.config = config;
    this.mapManager = mapManager;
    this.economy = economy;
    this.path = mapManager.curvePath;
    this.pathLength = this.path.getLength();
    this.onEnemyDeath = callbacks.onDeath;
    this.onEnemyReachedEnd = callbacks.onReachedEnd;

    this.maxHp = Math.round(config.maxHp * hpMultiplier);
    this.currentHp = this.maxHp;

    // Sprite
    this.sprite = scene.add.sprite(0, 0, config.spriteKey);
    this.add(this.sprite);

    // Healthbars
    const barWidth = config.type === 'boss' ? 36 : 24;
    const barHeight = 4;
    const barY = -(config.radius + 8);

    this.healthBarBg = scene.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);
    this.healthBarBg.fillStyle(0xcc2936, 1);
    this.healthBarBg.fillRect(-barWidth / 2, barY, barWidth, barHeight);
    this.add(this.healthBarBg);

    this.healthBarFill = scene.add.graphics();
    this.add(this.healthBarFill);
    this.updateHealthBar();

    // Startposition auf dem Pfad
    const startPoint = this.path.getPoint(0);
    this.setPosition(startPoint.x, startPoint.y);
    this.setDepth(10);

    scene.add.existing(this);
  }

  public updateHealthBar(): void {
    this.healthBarFill.clear();
    const barWidth = this.config.type === 'boss' ? 36 : 24;
    const barHeight = 4;
    const barY = -(this.config.radius + 8);

    const hpRatio = Phaser.Math.Clamp(this.currentHp / this.maxHp, 0, 1);
    const fillWidth = Math.round(barWidth * hpRatio);

    // Grün bei viel Leben, Gelb bei halbem Leben
    const color = hpRatio > 0.5 ? 0x4cd964 : 0xffcc00;
    this.healthBarFill.fillStyle(color, 1);
    this.healthBarFill.fillRect(-barWidth / 2, barY, fillWidth, barHeight);
  }

  public takeDamage(damage: number): void {
    if (this.isDead) return;

    this.currentHp -= damage;
    this.updateHealthBar();

    // Aufblitzen bei Treffer
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.4,
      duration: 60,
      yoyo: true,
      onComplete: () => {
        if (!this.isDead) this.sprite.alpha = 1;
      }
    });

    if (this.currentHp <= 0) {
      this.die();
    }
  }

  public applySlow(factor: number, durationMs: number): void {
    if (this.isDead) return;

    // Nur den stärksten Slow anwenden
    const newMultiplier = 1.0 - factor;
    if (newMultiplier < this.slowMultiplier || this.slowTimer <= 0) {
      this.slowMultiplier = newMultiplier;
      this.slowTimer = durationMs;
      this.sprite.setTint(0x76d7ea); // Frost-Blau
    }
  }

  public die(): void {
    if (this.isDead) return;
    this.isDead = true;

    // Gold & Punkte vergeben
    this.economy.addGold(this.config.rewardGold);
    this.economy.addScore(this.config.score);

    // Schwebender Text für Gold "+14g"
    const goldText = this.scene.add.text(this.x, this.y - 12, `+${this.config.rewardGold}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffd13b'
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: goldText,
      y: goldText.y - 20,
      alpha: 0,
      duration: 800,
      onComplete: () => goldText.destroy()
    });

    // Todes-Tween (Zerplatzen / Ausblenden)
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.onEnemyDeath(this);
        this.destroy();
      }
    });
  }

  public reachEnd(): void {
    if (this.isDead) return;
    this.isDead = true;

    // Spieler verliert Leben
    this.economy.loseLives(this.config.damageToPlayer);

    // Bildschirm kurz rot aufblitzen lassen bei Schadenseingang
    this.scene.cameras.main.flash(150, 200, 30, 30, true);

    this.onEnemyReachedEnd(this);
    this.destroy();
  }

  public update(time: number, delta: number): void {
    if (this.isDead) return;

    // Slow Timer aktualisieren
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) {
        this.slowMultiplier = 1.0;
        this.sprite.clearTint();
      }
    }

    // Bewegung entlang des Pfades
    const currentSpeed = this.config.speed * this.slowMultiplier;
    const step = (currentSpeed * (delta / 1000)) / this.pathLength;
    this.pathProgress += step;

    if (this.pathProgress >= 1.0) {
      this.reachEnd();
      return;
    }

    const pos = this.path.getPoint(this.pathProgress);
    this.setPosition(pos.x, pos.y);

    // Geh-Animation (leichtes Schaukeln)
    this.walkTime += delta * 0.01 * (currentSpeed / 50);
    this.sprite.y = Math.sin(this.walkTime) * 2;
    if (this.config.type === 'bat') {
      this.sprite.scaleY = 0.8 + Math.sin(this.walkTime * 2) * 0.3; // Flügelschlag
    }
  }
}

