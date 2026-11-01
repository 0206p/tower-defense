import Phaser from 'phaser';
import { TOWER_CONFIGS, TowerDefinition, TowerLevelData, TowerType } from '../config/TowerConfig';
import { Enemy } from './Enemy';
import { Projectile, ProjectileType } from './Projectile';
import { EconomySystem } from '../systems/EconomySystem';
import { SaveSystem } from '../systems/SaveSystem';

export class Tower extends Phaser.GameObjects.Container {
  public towerType: TowerType;
  public gridCol: number;
  public gridRow: number;
  public currentLevel: number = 1;
  public investedGold: number = 0;

  private definition: TowerDefinition;
  private currentStats: TowerLevelData;
  private sprite: Phaser.GameObjects.Sprite;
  private rangeCircle: Phaser.GameObjects.Graphics;
  private attackCooldownTimer: number = 0;
  private isSelected: boolean = false;

  private economy: EconomySystem;
  private getEnemiesFn: () => Enemy[];
  private onSelectCallback: (tower: Tower) => void;

  // Stat Multipliers aus dem globalen Upgrade-Menü
  private metaDamageMult: number = 1.0;
  private metaFrequencyMult: number = 1.0;
  private metaRangeMult: number = 1.0;
  private metaSpeedMult: number = 1.0;

  constructor(
    scene: Phaser.Scene,
    col: number,
    row: number,
    x: number,
    y: number,
    towerType: TowerType,
    economy: EconomySystem,
    getEnemies: () => Enemy[],
    onSelect: (tower: Tower) => void
  ) {
    super(scene, x, y);
    this.gridCol = col;
    this.gridRow = row;
    this.towerType = towerType;
    this.definition = TOWER_CONFIGS[towerType];
    this.currentStats = this.definition.levels[0];
    this.investedGold = this.currentStats.cost;
    this.economy = economy;
    this.getEnemiesFn = getEnemies;
    this.onSelectCallback = onSelect;

    // Meta-Boni laden
    const mults = SaveSystem.getStatMultipliers(towerType);
    this.metaDamageMult = mults.damageMult;
    this.metaFrequencyMult = mults.frequencyMult;
    this.metaRangeMult = mults.rangeMult;
    this.metaSpeedMult = mults.speedMult;

    // Reichweitenanzeige
    this.rangeCircle = scene.add.graphics();
    this.rangeCircle.setDepth(4);
    this.updateRangeCircle();

    // Sprite
    const textureKey = `tower_${towerType}_1`;
    this.sprite = scene.add.sprite(0, 0, textureKey);
    this.add(this.sprite);

    this.setSize(40, 40);
    this.setInteractive(new Phaser.Geom.Rectangle(-20, -20, 40, 40), Phaser.Geom.Rectangle.Contains);

    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.onSelectCallback(this);
    });

    this.on('pointerover', () => {
      if (!this.isSelected) {
        this.showRangePreview(true);
      }
    });

    this.on('pointerout', () => {
      if (!this.isSelected) {
        this.showRangePreview(false);
      }
    });

    this.setDepth(5);
    scene.add.existing(this);

    // Platzierungs-Tween
    this.setScale(0.2);
    scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });
  }

  public getEffectiveRange(): number {
    return Math.round(this.currentStats.range * this.metaRangeMult);
  }

  public getEffectiveDamage(): number {
    return Math.round(this.currentStats.damage * this.metaDamageMult);
  }

  public getEffectiveCooldown(): number {
    return Math.round(this.currentStats.attackCooldown / this.metaFrequencyMult);
  }

  public getStats(): TowerLevelData {
    return this.currentStats;
  }

  public getDefinition(): TowerDefinition {
    return this.definition;
  }

  public canUpgrade(): boolean {
    return this.currentLevel < this.definition.levels.length;
  }

  public getNextLevelStats(): TowerLevelData | null {
    if (!this.canUpgrade()) return null;
    return this.definition.levels[this.currentLevel];
  }

  public getUpgradeCost(): number {
    const next = this.getNextLevelStats();
    return next ? next.cost : 0;
  }

  public getSellValue(): number {
    return Math.floor(this.investedGold * 0.7);
  }

  public upgrade(): boolean {
    if (!this.canUpgrade()) return false;
    const nextStats = this.getNextLevelStats();
    if (!nextStats) return false;

    if (!this.economy.spendGold(nextStats.cost)) {
      return false;
    }

    this.investedGold += nextStats.cost;
    this.currentLevel++;
    this.currentStats = nextStats;

    // Textur anpassen
    const textureKey = `tower_${this.towerType}_${this.currentLevel}`;
    this.sprite.setTexture(textureKey);

    this.updateRangeCircle();

    // Glanz & Upgrade-Partikel
    const glow = this.scene.add.circle(this.x, this.y, 24, 0xf1c40f, 0.8).setDepth(15);
    this.scene.tweens.add({
      targets: glow,
      scaleX: 2.2,
      scaleY: 2.2,
      alpha: 0,
      duration: 350,
      onComplete: () => glow.destroy()
    });

    return true;
  }

  public sell(): number {
    const refund = this.getSellValue();
    this.economy.addGold(refund);

    this.setSelected(false);
    this.rangeCircle.destroy();

    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy()
    });

    return refund;
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.rangeCircle.setVisible(selected);
  }

  public showRangePreview(show: boolean): void {
    if (this.isSelected) return;
    this.rangeCircle.setVisible(show);
  }

  private updateRangeCircle(): void {
    this.rangeCircle.clear();
    const effectiveRange = this.getEffectiveRange();
    this.rangeCircle.fillStyle(0x4fc3f7, 0.18);
    this.rangeCircle.fillCircle(this.x, this.y, effectiveRange);
    this.rangeCircle.lineStyle(2, 0x4fc3f7, 0.85);
    this.rangeCircle.strokeCircle(this.x, this.y, effectiveRange);
    this.rangeCircle.setVisible(this.isSelected);
  }

  public update(time: number, delta: number): void {
    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= delta;
    }

    if (this.attackCooldownTimer <= 0) {
      const target = this.findTarget();
      if (target) {
        this.shoot(target);
        this.attackCooldownTimer = this.getEffectiveCooldown();
      }
    }
  }

  private findTarget(): Enemy | null {
    const enemies = this.getEnemiesFn();
    let bestTarget: Enemy | null = null;
    let maxProgress = -1;
    const effectiveRange = this.getEffectiveRange();

    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist <= effectiveRange) {
        if (enemy.pathProgress > maxProgress) {
          maxProgress = enemy.pathProgress;
          bestTarget = enemy;
        }
      }
    }

    return bestTarget;
  }

  private shoot(target: Enemy): void {
    new Projectile(this.scene, {
      type: this.towerType as ProjectileType,
      startX: this.x,
      startY: this.y - 4,
      target: target,
      damage: this.getEffectiveDamage(),
      splashRadius: this.currentStats.splashRadius,
      slowFactor: this.currentStats.slowFactor,
      slowDuration: this.currentStats.slowDuration,
      dotDamage: this.currentStats.dotDamage,
      dotDuration: this.currentStats.dotDuration,
      chainTargets: this.currentStats.chainTargets,
      critChance: this.currentStats.critChance,
      allEnemies: this.getEnemiesFn(),
      speedMultiplier: this.metaSpeedMult
    });

    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: 0.85,
      yoyo: true,
      duration: 60
    });
  }

  public destroy(fromScene?: boolean): void {
    if (this.rangeCircle) {
      this.rangeCircle.destroy();
    }
    super.destroy(fromScene);
  }
}
