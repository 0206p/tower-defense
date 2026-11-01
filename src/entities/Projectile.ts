import Phaser from 'phaser';
import { Enemy } from './Enemy';

export type ProjectileType = 'arrow' | 'cannonball' | 'ice' | 'poison' | 'tesla' | 'sniper';

export interface ProjectileParams {
  type: ProjectileType;
  startX: number;
  startY: number;
  target: Enemy;
  damage: number;
  splashRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  dotDamage?: number;
  dotDuration?: number;
  chainTargets?: number;
  critChance?: number;
  allEnemies: Enemy[];
  speedMultiplier?: number;
}

export class Projectile extends Phaser.GameObjects.Sprite {
  private pType: ProjectileType;
  private target: Enemy;
  private targetLastX: number;
  private targetLastY: number;
  private damage: number;
  private splashRadius: number;
  private slowFactor: number;
  private slowDuration: number;
  private dotDamage: number;
  private dotDuration: number;
  private chainTargets: number;
  private critChance: number;
  private allEnemies: Enemy[];
  private speed: number;

  constructor(scene: Phaser.Scene, params: ProjectileParams) {
    let textureKey = 'proj_arrow';
    let baseSpeed = 480;

    switch (params.type) {
      case 'cannonball':
        textureKey = 'proj_cannonball';
        baseSpeed = 350;
        break;
      case 'ice':
        textureKey = 'proj_ice';
        baseSpeed = 400;
        break;
      case 'poison':
        textureKey = 'proj_poison';
        baseSpeed = 370;
        break;
      case 'tesla':
        textureKey = 'proj_tesla';
        baseSpeed = 650;
        break;
      case 'sniper':
        textureKey = 'proj_sniper';
        baseSpeed = 950;
        break;
    }

    super(scene, params.startX, params.startY, textureKey);
    this.pType = params.type;
    this.target = params.target;
    this.targetLastX = params.target.x;
    this.targetLastY = params.target.y;
    this.damage = params.damage;
    this.splashRadius = params.splashRadius || 0;
    this.slowFactor = params.slowFactor || 0;
    this.slowDuration = params.slowDuration || 0;
    this.dotDamage = params.dotDamage || 0;
    this.dotDuration = params.dotDuration || 0;
    this.chainTargets = params.chainTargets || 1;
    this.critChance = params.critChance || 0;
    this.allEnemies = params.allEnemies;
    this.speed = baseSpeed * (params.speedMultiplier || 1.0);

    this.setDepth(15);
    scene.add.existing(this);
  }

  public update(time: number, delta: number): void {
    if (this.target && !this.target.isDead) {
      this.targetLastX = this.target.x;
      this.targetLastY = this.target.y;
    }

    const dx = this.targetLastX - this.x;
    const dy = this.targetLastY - this.y;
    const distance = Math.hypot(dx, dy);

    this.rotation = Math.atan2(dy, dx);
    const moveDist = this.speed * (delta / 1000);

    if (distance <= moveDist || distance < 14) {
      this.hit();
    } else {
      this.x += Math.cos(this.rotation) * moveDist;
      this.y += Math.sin(this.rotation) * moveDist;
    }
  }

  private hit(): void {
    const isCrit = Math.random() < this.critChance;
    const finalDamage = isCrit ? Math.round(this.damage * 2.2) : this.damage;

    switch (this.pType) {
      case 'arrow':
      case 'sniper':
        if (this.target && !this.target.isDead) {
          this.target.takeDamage(finalDamage, isCrit);
          this.spawnHitEffect(this.x, this.y);
        }
        break;

      case 'cannonball':
        this.spawnExplosionEffect(this.x, this.y);
        this.allEnemies.forEach((e) => {
          if (!e.isDead) {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.splashRadius) {
              const ratio = Math.max(0.5, 1 - dist / this.splashRadius);
              e.takeDamage(Math.round(finalDamage * ratio), isCrit);
            }
          }
        });
        break;

      case 'ice':
        this.spawnFrostEffect(this.x, this.y);
        this.allEnemies.forEach((e) => {
          if (!e.isDead) {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.splashRadius) {
              e.takeDamage(finalDamage);
              if (this.slowFactor > 0) e.applySlow(this.slowFactor, this.slowDuration);
            }
          }
        });
        break;

      case 'poison':
        this.spawnPoisonEffect(this.x, this.y);
        this.allEnemies.forEach((e) => {
          if (!e.isDead) {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.splashRadius) {
              e.takeDamage(finalDamage);
              if (this.dotDamage > 0) e.applyPoison(this.dotDamage, this.dotDuration);
            }
          }
        });
        break;

      case 'tesla':
        this.chainLightningHit();
        break;
    }

    this.destroy();
  }

  private chainLightningHit(): void {
    const hitList: Enemy[] = [];
    if (this.target && !this.target.isDead) {
      hitList.push(this.target);
      this.target.takeDamage(this.damage);
    }

    // Nächste Gegner finden
    while (hitList.length < this.chainTargets) {
      const last = hitList[hitList.length - 1] || { x: this.x, y: this.y };
      let nearest: Enemy | null = null;
      let minDist = 120;

      for (const e of this.allEnemies) {
        if (!e.isDead && !hitList.includes(e)) {
          const dist = Math.hypot(e.x - last.x, e.y - last.y);
          if (dist < minDist) {
            minDist = dist;
            nearest = e;
          }
        }
      }

      if (nearest) {
        hitList.push(nearest);
        // Blitzgrafik zeichnen
        const beam = this.scene.add.graphics().setDepth(20);
        beam.lineStyle(2, 0x74b9ff, 1);
        beam.lineBetween(last.x, last.y, nearest.x, nearest.y);
        this.scene.tweens.add({
          targets: beam,
          alpha: 0,
          duration: 180,
          onComplete: () => beam.destroy()
        });
        // 80% Schaden bei Kettensprung
        const chainDmg = Math.round(this.damage * Math.pow(0.85, hitList.length - 1));
        nearest.takeDamage(chainDmg);
      } else {
        break;
      }
    }
  }

  private spawnHitEffect(x: number, y: number): void {
    const hit = this.scene.add.image(x, y, 'effect_hit').setDepth(20);
    this.scene.tweens.add({
      targets: hit,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 140,
      onComplete: () => hit.destroy()
    });
  }

  private spawnExplosionEffect(x: number, y: number): void {
    const explosion = this.scene.add.image(x, y, 'effect_explosion').setDepth(20);
    explosion.setScale(0.3);
    this.scene.cameras.main.shake(80, 0.003);
    this.scene.tweens.add({
      targets: explosion,
      scaleX: (this.splashRadius * 2) / 48,
      scaleY: (this.splashRadius * 2) / 48,
      alpha: 0,
      duration: 280,
      ease: 'Quad.easeOut',
      onComplete: () => explosion.destroy()
    });
  }

  private spawnFrostEffect(x: number, y: number): void {
    const frost = this.scene.add.image(x, y, 'effect_frost').setDepth(20);
    frost.setScale(0.3);
    this.scene.tweens.add({
      targets: frost,
      scaleX: (this.splashRadius * 2) / 48,
      scaleY: (this.splashRadius * 2) / 48,
      alpha: 0,
      duration: 320,
      onComplete: () => frost.destroy()
    });
  }

  private spawnPoisonEffect(x: number, y: number): void {
    const poison = this.scene.add.image(x, y, 'effect_poison').setDepth(20);
    poison.setScale(0.3);
    this.scene.tweens.add({
      targets: poison,
      scaleX: (this.splashRadius * 2) / 48,
      scaleY: (this.splashRadius * 2) / 48,
      alpha: 0,
      duration: 350,
      onComplete: () => poison.destroy()
    });
  }
}
