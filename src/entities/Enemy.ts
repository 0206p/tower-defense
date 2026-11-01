import Phaser from 'phaser';
import { EnemyDefinition } from '../config/EnemyConfig';
import { MapManager } from '../systems/MapManager';
import { EconomySystem } from '../systems/EconomySystem';
import { GAME_FONT } from '../config/GameConfig';
import { TowerType } from '../config/TowerConfig';
import { balancing } from '../systems/BalancingTelemetry';

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

  public currentShield: number = 0;
  public maxShield: number = 0;
  private isEnraged: boolean = false;
  private stunTimer: number = 0;

  private slowMultiplier: number = 1.0;
  private slowTimer: number = 0;
  private poisonTimer: number = 0;
  private poisonDamageTick: number = 0;
  private nextPoisonTick: number = 0;
  private walkTime: number = 0;
  private spawnTime: number = Date.now();
  public lastDamagedByTower?: TowerType;

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
    hpMultiplier: number = 1.0,
    customPath?: Phaser.Curves.Path
  ) {
    super(scene, 0, 0);
    this.config = config;
    this.mapManager = mapManager;
    this.economy = economy;
    this.path = customPath || mapManager.curvePath;
    this.pathLength = this.path.getLength();
    this.onEnemyDeath = callbacks.onDeath;
    this.onEnemyReachedEnd = callbacks.onReachedEnd;
    this.spawnTime = Date.now();

    balancing.recordEnemySpawn(config.type);

    this.maxHp = Math.round(config.maxHp * hpMultiplier);
    this.currentHp = this.maxHp;
    this.maxShield = config.shield ? Math.round(config.shield) : 0;
    this.currentShield = this.maxShield;

    // Sprite
    const textureKey = scene.textures.exists(config.spriteKey) ? config.spriteKey : 'enemy_goblin';
    this.sprite = scene.add.sprite(0, 0, textureKey);
    this.add(this.sprite);

    // Healthbars
    const barWidth = config.type === 'boss' ? 44 : 26;
    const barHeight = 4;
    const barY = -(config.radius + 8);

    this.healthBarBg = scene.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.75);
    this.healthBarBg.fillRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);
    this.healthBarBg.fillStyle(0xcc2936, 1);
    this.healthBarBg.fillRect(-barWidth / 2, barY, barWidth, barHeight);
    this.add(this.healthBarBg);

    this.healthBarFill = scene.add.graphics();
    this.add(this.healthBarFill);
    this.updateHealthBar();

    const startPoint = this.path.getPoint(0);
    this.setPosition(startPoint.x, startPoint.y);
    this.setDepth(10);

    scene.add.existing(this);
  }

  public updateHealthBar(): void {
    this.healthBarFill.clear();
    const barWidth = this.config.type === 'boss' ? 44 : 26;
    const barHeight = 4;
    const barY = -(this.config.radius + 8);

    const hpRatio = Phaser.Math.Clamp(this.currentHp / this.maxHp, 0, 1);
    const fillWidth = Math.round(barWidth * hpRatio);

    const color = hpRatio > 0.5 ? 0x2ecc71 : hpRatio > 0.25 ? 0xf1c40f : 0xe74c3c;
    this.healthBarFill.fillStyle(color, 1);
    this.healthBarFill.fillRect(-barWidth / 2, barY, fillWidth, barHeight);

    // Schild-Balken über dem Lebensbalken (Türkis)
    if (this.maxShield > 0 && this.currentShield > 0) {
      const shieldRatio = Phaser.Math.Clamp(this.currentShield / this.maxShield, 0, 1);
      const shieldFill = Math.round(barWidth * shieldRatio);
      this.healthBarFill.fillStyle(0x00d2d3, 1);
      this.healthBarFill.fillRect(-barWidth / 2, barY - 4, shieldFill, 3);
    }
  }

  public takeDamage(damage: number, isCrit: boolean = false, shieldPiercing: boolean = false, sourceTowerType?: TowerType): void {
    if (this.isDead) return;

    // Taktisches Konter- & Resistenz-System
    let effectiveDamage = damage;
    let isResisted = false;
    let isVulnerable = false;

    // 1. Golems und gepanzerte Trolle sind geerdet: 75% Blitz-/Tesla-Resistenz
    const isEarthArmored = ['golem', 'lava_golem', 'armored_troll'].includes(this.config.type);
    if (isEarthArmored && sourceTowerType === 'tesla') {
      effectiveDamage = Math.max(1, Math.round(damage * 0.25));
      isResisted = true;
    }

    // 2. Erdwesen sind dafür extrem anfällig gegen schwere Kanonenschläge (+50% Bonusschaden)
    if (isEarthArmored && sourceTowerType === 'cannon') {
      effectiveDamage = Math.round(damage * 1.5);
      isVulnerable = true;
    }

    // 3. Wenn Gegner unter Frost-Einfluss stehen: Zersplitterungs-Schwäche (+35% Extraschaden)
    if (this.slowTimer > 0 && sourceTowerType !== 'ice') {
      effectiveDamage = Math.round(effectiveDamage * 1.35);
      isVulnerable = true;
    }

    if (sourceTowerType) {
      this.lastDamagedByTower = sourceTowerType;
      balancing.recordDamage(sourceTowerType, effectiveDamage, isCrit, this.config.type);
    }

    let damageToHp = effectiveDamage;
    let hitShield = false;

    if (this.currentShield > 0 && !shieldPiercing) {
      hitShield = true;
      if (this.currentShield >= effectiveDamage) {
        this.currentShield -= effectiveDamage;
        damageToHp = 0;
      } else {
        damageToHp = effectiveDamage - this.currentShield;
        this.currentShield = 0;
      }
    }

    this.currentHp -= damageToHp;
    this.updateHealthBar();

    // Schadens-Popup
    let popupColor = isCrit ? '#ff3838' : '#ffd13b';
    let popupText = isCrit ? `!${effectiveDamage}!` : `-${effectiveDamage}`;
    if (isResisted) {
      popupColor = '#74b9ff';
      popupText = `⚡${effectiveDamage} (Resist)`;
    } else if (isVulnerable) {
      popupColor = '#ff9f43';
      popupText = `💥${effectiveDamage}!`;
    } else if (shieldPiercing) {
      popupColor = '#a29bfe';
      popupText = `⚡${effectiveDamage}`;
    } else if (hitShield && damageToHp === 0) {
      popupColor = '#00d2d3';
      popupText = `🛡${effectiveDamage}`;
    }

    const dmgText = this.scene.add.text(
      this.x + Phaser.Math.Between(-8, 8),
      this.y - 18,
      popupText,
      {
        fontFamily: GAME_FONT,
        fontSize: isCrit ? '16px' : '13px',
        color: popupColor,
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setDepth(30);

    this.scene.tweens.add({
      targets: dmgText,
      y: dmgText.y - 20,
      alpha: 0,
      duration: 550,
      onComplete: () => dmgText.destroy()
    });

    // Aufblitzen
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.35,
      duration: 60,
      yoyo: true,
      onComplete: () => {
        if (!this.isDead && this.stunTimer <= 0) this.sprite.alpha = 1;
      }
    });

    // Boss Phase 2 Enrage
    if (this.config.type === 'boss' && !this.isEnraged && this.currentHp <= this.maxHp * 0.5) {
      this.isEnraged = true;
      this.currentShield = Math.round(this.maxShield * 0.6);
      this.sprite.setTint(0xff3333);
      const gameScene = this.scene as any;
      if (gameScene?.hud?.showAnnouncement) {
        gameScene.hud.showAnnouncement('⚠ ACHTUNG: TITANEN-BOSS IST ERZÜRNT! (PHASE 2)');
      }
    }

    if (this.currentHp <= 0) {
      this.die();
    }
  }

  public applyStun(durationMs: number): void {
    if (this.isDead) return;
    this.stunTimer = Math.max(this.stunTimer, durationMs);
    this.sprite.setTint(0xffeaa7);
    const stunIcon = this.scene.add.text(this.x, this.y - 26, '💫', { fontSize: '14px' }).setOrigin(0.5).setDepth(35);
    this.scene.tweens.add({
      targets: stunIcon,
      y: stunIcon.y - 16,
      alpha: 0,
      duration: durationMs,
      onComplete: () => stunIcon.destroy()
    });
  }

  public applySlow(factor: number, durationMs: number): void {
    if (this.isDead) return;
    if (this.config.iceResistant) {
      factor = factor * 0.25;
      const resistIcon = this.scene.add.text(this.x, this.y - 18, '❄️ IMMUN', {
        fontFamily: GAME_FONT,
        fontSize: '11px',
        color: '#93c5fd',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(35);
      this.scene.tweens.add({
        targets: resistIcon,
        y: resistIcon.y - 14,
        alpha: 0,
        duration: 600,
        onComplete: () => resistIcon.destroy()
      });
      if (factor <= 0.05) return;
    }
    const newMultiplier = 1.0 - factor;
    if (newMultiplier < this.slowMultiplier || this.slowTimer <= 0) {
      this.slowMultiplier = newMultiplier;
      this.slowTimer = durationMs;
      this.sprite.setTint(0x76d7ea);
    }
  }

  public applyPoison(damagePerTick: number, durationMs: number): void {
    if (this.isDead) return;
    if (this.config.poisonResistant) {
      damagePerTick = Math.max(1, Math.round(damagePerTick * 0.25));
      const resistIcon = this.scene.add.text(this.x, this.y - 18, '☠️ IMMUN', {
        fontFamily: GAME_FONT,
        fontSize: '11px',
        color: '#86efac',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(35);
      this.scene.tweens.add({
        targets: resistIcon,
        y: resistIcon.y - 14,
        alpha: 0,
        duration: 600,
        onComplete: () => resistIcon.destroy()
      });
      if (damagePerTick <= 1) return;
    }
    this.poisonDamageTick = Math.max(this.poisonDamageTick, damagePerTick);
    this.poisonTimer = durationMs;
    this.nextPoisonTick = 400; // alle 400ms Schaden
    this.sprite.setTint(0x2ecc71);
  }

  public die(): void {
    if (this.isDead) return;
    this.isDead = true;

    balancing.recordEnemyDeath(this.config.type, this.pathProgress, Date.now() - this.spawnTime, this.lastDamagedByTower);

    this.economy.addGold(this.config.rewardGold);
    this.economy.addScore(this.config.score);

    const goldText = this.scene.add.text(this.x, this.y - 12, `+${this.config.rewardGold}`, {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: goldText,
      y: goldText.y - 20,
      alpha: 0,
      duration: 700,
      onComplete: () => goldText.destroy()
    });

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        this.onEnemyDeath(this);
        this.destroy();
      }
    });
  }

  public reachEnd(): void {
    if (this.isDead) return;
    this.isDead = true;

    balancing.recordEnemyLeak(this.config.type);

    const isBoss = this.config.type === 'boss' || this.config.damageToPlayer >= 5;
    const damage = isBoss ? 10 : this.config.damageToPlayer;
    this.economy.loseLives(damage);
    this.scene.cameras.main.flash(isBoss ? 300 : 150, 220, 20, 20, true);

    this.onEnemyReachedEnd(this);
    this.destroy();
  }

  public update(time: number, delta: number): void {
    if (this.isDead) return;

    // Betäubung (Stun) aktualisieren
    if (this.stunTimer > 0) {
      this.stunTimer -= delta;
      if (this.stunTimer <= 0) {
        if (this.poisonTimer <= 0 && this.slowTimer <= 0) this.sprite.clearTint();
      }
      return; // Während Betäubung keine Bewegung!
    }

    // Slow aktualisieren
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) {
        this.slowMultiplier = 1.0;
        if (this.poisonTimer <= 0) this.sprite.clearTint();
      }
    }

    // Gift aktualisieren
    if (this.poisonTimer > 0) {
      this.poisonTimer -= delta;
      this.nextPoisonTick -= delta;
      if (this.nextPoisonTick <= 0) {
        this.nextPoisonTick = 400;
        this.takeDamage(this.poisonDamageTick);
      }
      if (this.poisonTimer <= 0) {
        this.poisonDamageTick = 0;
        if (this.slowTimer <= 0) this.sprite.clearTint();
      }
    }

    // Pfadbewegung
    const enrageSpeedMult = this.isEnraged ? 1.35 : 1.0;
    const currentSpeed = this.config.speed * this.slowMultiplier * enrageSpeedMult;
    const step = (currentSpeed * (delta / 1000)) / this.pathLength;
    this.pathProgress += step;

    if (this.pathProgress >= 1.0) {
      this.reachEnd();
      return;
    }

    const pos = this.path.getPoint(this.pathProgress);
    this.setPosition(pos.x, pos.y);

    this.walkTime += delta * 0.01 * (currentSpeed / 50);
    this.sprite.y = Math.sin(this.walkTime) * 2;
    if (this.config.type === 'bat' || this.config.type === 'witch') {
      this.sprite.scaleY = 0.85 + Math.sin(this.walkTime * 2.5) * 0.25;
    }
  }
}
