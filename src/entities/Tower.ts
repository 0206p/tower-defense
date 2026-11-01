import Phaser from 'phaser';
import {
  TOWER_CONFIGS,
  TowerDefinition,
  TowerLevelData,
  TowerSpecializationDef,
  TowerSpecializationId,
  TowerType
} from '../config/TowerConfig';
import { Enemy } from './Enemy';
import { Projectile, ProjectileType } from './Projectile';
import { EconomySystem } from '../systems/EconomySystem';
import { SaveSystem, SKINS_CONFIG } from '../systems/SaveSystem';
import { logger } from '../systems/GameLogger';
import { balancing } from '../systems/BalancingTelemetry';

export type TargetPriority = 'FIRST' | 'LAST' | 'STRONGEST' | 'WEAKEST' | 'CLOSEST';

export const TARGET_PRIORITY_LABELS: Record<TargetPriority, string> = {
  FIRST: 'ERSTER (Pfad)',
  LAST: 'LETZTER (Start)',
  STRONGEST: 'STÄRKSTER (HP)',
  WEAKEST: 'SCHWÄCHSTER (Finisher)',
  CLOSEST: 'NÄCHSTER (Distanz)'
};

export class Tower extends Phaser.GameObjects.Container {
  public towerType: TowerType;
  public gridCol: number;
  public gridRow: number;
  public currentLevel: number = 1;
  public investedGold: number = 0;
  public targetPriority: TargetPriority = 'FIRST';
  public specialization: TowerSpecializationId = 'none';
  public specializationDef: TowerSpecializationDef | null = null;
  public isRuneEmpowered: boolean = false;

  private definition: TowerDefinition;
  private currentStats: TowerLevelData;
  private sprite: Phaser.GameObjects.Sprite;
  private rangeCircle: Phaser.GameObjects.Graphics;
  private attackCooldownTimer: number = 0;
  private isSelected: boolean = false;

  private economy: EconomySystem;
  private getEnemiesFn: () => Enemy[];
  private onSelectCallback: (tower: Tower, pointer?: Phaser.Input.Pointer) => void;

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
    onSelect: (tower: Tower, pointer?: Phaser.Input.Pointer) => void
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

    // Skin-Aura unter dem Turm
    const skinId = SaveSystem.getActiveSkin();
    const skinDef = SKINS_CONFIG[skinId];
    if (skinId !== 'default') {
      const skinAura = scene.add.graphics();
      skinAura.fillStyle(skinDef.glowColor, 0.35);
      skinAura.fillCircle(0, 10, 16);
      skinAura.lineStyle(1.5, skinDef.themeColor, 0.7);
      skinAura.strokeCircle(0, 10, 16);
      this.addAt(skinAura, 0);
    }

    // Sprite
    const textureKey = `tower_${towerType}_1`;
    this.sprite = scene.add.sprite(0, 0, textureKey);
    if (skinDef.tint !== 0xffffff) {
      this.sprite.setTint(skinDef.tint);
    }
    this.add(this.sprite);

    this.setSize(48, 56);
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-24, -28, 48, 56),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });

    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.onSelectCallback(this, pointer);
    });

    this.on('pointerover', () => {
      if (!this.isSelected) {
        this.showRangePreview(true);
        this.sprite.setTint(0xffffff);
      }
    });

    this.on('pointerout', () => {
      if (!this.isSelected) {
        this.showRangePreview(false);
        const skin = SKINS_CONFIG[SaveSystem.getActiveSkin()];
        this.sprite.setTint(skin.tint);
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
    const baseRange = this.specializationDef ? this.specializationDef.range : this.currentStats.range;
    const runeMult = this.isRuneEmpowered ? 1.2 : 1.0;
    return Math.round(baseRange * this.metaRangeMult * runeMult);
  }

  public getEffectiveDamage(): number {
    const baseDamage = this.specializationDef ? this.specializationDef.damage : this.currentStats.damage;
    return Math.round(baseDamage * this.metaDamageMult);
  }

  public getEffectiveCooldown(): number {
    const baseCooldown = this.specializationDef ? this.specializationDef.attackCooldown : this.currentStats.attackCooldown;
    return Math.round(baseCooldown / this.metaFrequencyMult);
  }

  public getStats(): TowerLevelData {
    if (this.specializationDef) {
      return {
        level: 4,
        cost: this.specializationDef.cost,
        damage: this.specializationDef.damage,
        range: this.specializationDef.range,
        attackCooldown: this.specializationDef.attackCooldown,
        splashRadius: this.specializationDef.splashRadius,
        slowFactor: this.specializationDef.slowFactor,
        slowDuration: this.specializationDef.slowDuration,
        chainTargets: this.specializationDef.chainTargets,
        dotDamage: this.specializationDef.dotDamage,
        dotDuration: this.specializationDef.dotDuration,
        critChance: this.specializationDef.critChance,
        description: this.specializationDef.description
      };
    }
    return this.currentStats;
  }

  public getTowerType(): TowerType {
    return this.towerType;
  }

  public getDefinition(): TowerDefinition {
    return this.definition;
  }

  public canUpgrade(): boolean {
    return this.currentLevel < this.definition.levels.length;
  }

  public canSpecialize(): boolean {
    return this.currentLevel === 3 && this.specialization === 'none';
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
    const skin = SKINS_CONFIG[SaveSystem.getActiveSkin()];
    if (skin.tint !== 0xffffff) {
      this.sprite.setTint(skin.tint);
    }

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

  public specialize(pathId: 'path_a' | 'path_b'): boolean {
    if (!this.canSpecialize()) return false;
    const spec = this.definition.specializations[pathId];
    if (!spec) return false;

    if (!this.economy.spendGold(spec.cost)) {
      return false;
    }

    this.investedGold += spec.cost;
    balancing.recordTowerUpgrade(this.towerType, spec.cost);
    this.specialization = pathId;
    this.specializationDef = spec;
    logger.tower(`Turm spezialisiert: ${this.towerType} Pfad ${pathId} (${spec.name})`, {
      type: this.towerType,
      path: pathId,
      name: spec.name,
      cost: spec.cost
    });

    const textureKey = `tower_${this.towerType}_${pathId === 'path_a' ? 'spec_a' : 'spec_b'}`;
    if (this.scene.textures.exists(textureKey)) {
      this.sprite.setTexture(textureKey);
      const skin = SKINS_CONFIG[SaveSystem.getActiveSkin()];
      if (skin.tint !== 0xffffff) {
        this.sprite.setTint(skin.tint);
      }
    }

    this.updateRangeCircle();

    const glowColor = pathId === 'path_a' ? 0x00d2d3 : 0x9b59b6;
    const glow = this.scene.add.circle(this.x, this.y, 28, glowColor, 0.9).setDepth(15);
    this.scene.tweens.add({
      targets: glow,
      scaleX: 2.8,
      scaleY: 2.8,
      alpha: 0,
      duration: 450,
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

  public updatePosition(x: number, y: number): void {
    this.setPosition(x, y);
    this.updateRangeCircle();
  }

  public updateRangeCircle(): void {
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

  public cycleTargetPriority(): TargetPriority {
    const list: TargetPriority[] = ['FIRST', 'LAST', 'STRONGEST', 'WEAKEST', 'CLOSEST'];
    const idx = list.indexOf(this.targetPriority);
    this.targetPriority = list[(idx + 1) % list.length];
    return this.targetPriority;
  }

  private findTarget(): Enemy | null {
    const enemies = this.getEnemiesFn();
    const effectiveRange = this.getEffectiveRange();
    const inRange = enemies.filter((e) => !e.isDead && Math.hypot(e.x - this.x, e.y - this.y) <= effectiveRange);

    if (inRange.length === 0) return null;

    switch (this.targetPriority) {
      case 'FIRST':
        return inRange.reduce((prev, curr) => (curr.pathProgress > prev.pathProgress ? curr : prev));
      case 'LAST':
        return inRange.reduce((prev, curr) => (curr.pathProgress < prev.pathProgress ? curr : prev));
      case 'STRONGEST':
        return inRange.reduce((prev, curr) => (curr.currentHp > prev.currentHp ? curr : prev));
      case 'WEAKEST':
        return inRange.reduce((prev, curr) => (curr.currentHp < prev.currentHp ? curr : prev));
      case 'CLOSEST':
        return inRange.reduce((prev, curr) => {
          const dCurr = Math.hypot(curr.x - this.x, curr.y - this.y);
          const dPrev = Math.hypot(prev.x - this.x, prev.y - this.y);
          return dCurr < dPrev ? curr : prev;
        });
      default:
        return inRange[0];
    }
  }

  private shoot(target: Enemy): void {
    const effectiveDamage = this.getEffectiveDamage();
    const stats = this.specializationDef || this.currentStats;
    const gameScene = this.scene as any;

    const multishot = this.specializationDef?.multishotCount || 1;
    if (multishot > 1) {
      const enemies = this.getEnemiesFn();
      const range = this.getEffectiveRange();
      const inRange = enemies.filter((e) => !e.isDead && Math.hypot(e.x - this.x, e.y - this.y) <= range);
      const targets = inRange.slice(0, multishot);
      if (!targets.includes(target) && targets.length > 0) targets[0] = target;

      targets.forEach((t) => {
        const proj = new Projectile(this.scene, {
          type: this.towerType as ProjectileType,
          sourceTowerType: this.towerType,
          startX: this.x,
          startY: this.y - 4,
          target: t,
          damage: effectiveDamage,
          critChance: stats.critChance,
          shieldPiercing: this.specializationDef?.shieldPiercing,
          executeThreshold: this.specializationDef?.executeThreshold,
          stunDuration: this.specializationDef?.stunDuration,
          allEnemies: this.getEnemiesFn(),
          speedMultiplier: this.metaSpeedMult
        });
        if (gameScene && typeof gameScene.addProjectile === 'function') {
          gameScene.addProjectile(proj);
        }
      });
    } else {
      const proj = new Projectile(this.scene, {
        type: this.towerType as ProjectileType,
        sourceTowerType: this.towerType,
        startX: this.x,
        startY: this.y - 4,
        target: target,
        damage: effectiveDamage,
        splashRadius: stats.splashRadius,
        slowFactor: stats.slowFactor,
        slowDuration: stats.slowDuration,
        dotDamage: stats.dotDamage,
        dotDuration: stats.dotDuration,
        chainTargets: stats.chainTargets,
        critChance: stats.critChance,
        stunDuration: this.specializationDef?.stunDuration,
        shieldPiercing: this.specializationDef?.shieldPiercing,
        executeThreshold: this.specializationDef?.executeThreshold,
        allEnemies: this.getEnemiesFn(),
        speedMultiplier: this.metaSpeedMult
      });

      if (gameScene && typeof gameScene.addProjectile === 'function') {
        gameScene.addProjectile(proj);
      }
    }

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
