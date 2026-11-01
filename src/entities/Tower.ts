import Phaser from 'phaser';
import { TOWER_CONFIGS, TowerDefinition, TowerLevelData, TowerType } from '../config/TowerConfig';
import { Enemy } from './Enemy';
import { Projectile, ProjectileType } from './Projectile';
import { EconomySystem } from '../systems/EconomySystem';

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
  private lastAttackTime: number = 0;
  private isSelected: boolean = false;

  private economy: EconomySystem;
  private getEnemiesFn: () => Enemy[];
  private onSelectCallback: (tower: Tower) => void;

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

    // Reichweitenanzeige (initial unsichtbar)
    this.rangeCircle = scene.add.graphics();
    this.rangeCircle.setDepth(4);
    this.updateRangeCircle();

    // Sprite
    const textureKey = `tower_${towerType}_1`;
    this.sprite = scene.add.sprite(0, 0, textureKey);
    this.add(this.sprite);

    // Klickbar machen
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

    // Platzierungs-Bounce-Animation
    this.setScale(0.2);
    scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 250,
      ease: 'Back.easeOut'
    });
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
    // 70% der gesamten Investition
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

    // Textur auf neue Stufe anpassen
    const textureKey = `tower_${this.towerType}_${this.currentLevel}`;
    this.sprite.setTexture(textureKey);

    this.updateRangeCircle();

    // Glanz-Effekt bei Upgrade
    const glow = this.scene.add.circle(this.x, this.y, 24, 0xffeb3b, 0.8).setDepth(15);
    this.scene.tweens.add({
      targets: glow,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 350,
      onComplete: () => glow.destroy()
    });

    return true;
  }

  public sell(): number {
    const refund = this.getSellValue();
    this.economy.addGold(refund);

    // Verkaufs-Tween
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
    // Halbtransparenter Kreis mit Rand
    this.rangeCircle.fillStyle(0x4fc3f7, 0.18);
    this.rangeCircle.fillCircle(this.x, this.y, this.currentStats.range);

    this.rangeCircle.lineStyle(2, 0x4fc3f7, 0.85);
    this.rangeCircle.strokeCircle(this.x, this.y, this.currentStats.range);
    this.rangeCircle.setVisible(this.isSelected);
  }

  public update(time: number, delta: number): void {
    if (time - this.lastAttackTime < this.currentStats.attackCooldown) {
      return;
    }

    const target = this.findTarget();
    if (target) {
      this.shoot(target);
      this.lastAttackTime = time;
    }
  }

  private findTarget(): Enemy | null {
    const enemies = this.getEnemiesFn();
    let bestTarget: Enemy | null = null;
    let maxProgress = -1;

    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist <= this.currentStats.range) {
        // First-Targeting: wähle den Gegner, der am weitesten auf dem Pfad ist
        if (enemy.pathProgress > maxProgress) {
          maxProgress = enemy.pathProgress;
          bestTarget = enemy;
        }
      }
    }

    return bestTarget;
  }

  private shoot(target: Enemy): void {
    let projType: ProjectileType = 'arrow';
    if (this.towerType === 'cannon') projType = 'cannonball';
    else if (this.towerType === 'ice') projType = 'ice';

    new Projectile(this.scene, {
      type: projType,
      startX: this.x,
      startY: this.y - 4,
      target: target,
      damage: this.currentStats.damage,
      splashRadius: this.currentStats.splashRadius,
      slowFactor: this.currentStats.slowFactor,
      slowDuration: this.currentStats.slowDuration,
      allEnemies: this.getEnemiesFn()
    });

    // Kleines Mündungsfeuer / Rückstoß-Tween
    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: 0.85,
      yoyo: true,
      duration: 70
    });
  }

  public destroy(fromScene?: boolean): void {
    if (this.rangeCircle) {
      this.rangeCircle.destroy();
    }
    super.destroy(fromScene);
  }
}

