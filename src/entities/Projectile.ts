import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { TowerType } from '../config/TowerConfig';

export type ProjectileType = 'arrow' | 'cannonball' | 'ice' | 'poison' | 'tesla' | 'sniper' | 'archer' | 'cannon';

export interface ProjectileParams {
  type: ProjectileType;
  sourceTowerType?: TowerType;
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
  stunDuration?: number;
  shieldPiercing?: boolean;
  executeThreshold?: number;
  allEnemies: Enemy[];
  speedMultiplier?: number;
}

export class Projectile extends Phaser.GameObjects.Sprite {
  private pType: ProjectileType;
  private sourceTowerType: TowerType;
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
  private stunDuration: number;
  private shieldPiercing: boolean;
  private executeThreshold: number;
  private allEnemies: Enemy[];
  private speed: number;
  private lifespan: number = 3500; // Schutz vor verirrten Geisterprojektilen

  constructor(scene: Phaser.Scene, params: ProjectileParams) {
    let textureKey = 'proj_arrow';
    let baseSpeed = 900;

    switch (params.type) {
      case 'cannon':
      case 'cannonball':
        textureKey = 'proj_cannonball';
        baseSpeed = 650;
        break;
      case 'archer':
      case 'arrow':
        textureKey = 'proj_arrow';
        baseSpeed = 900;
        break;
      case 'ice':
        textureKey = 'proj_ice';
        baseSpeed = 700;
        break;
      case 'poison':
        textureKey = 'proj_poison';
        baseSpeed = 700;
        break;
      case 'tesla':
        textureKey = 'proj_tesla';
        baseSpeed = 1100;
        break;
      case 'sniper':
        textureKey = 'proj_sniper';
        baseSpeed = 1600;
        break;
    }

    super(scene, params.startX, params.startY, textureKey);
    this.pType = params.type;
    if (params.sourceTowerType) {
      this.sourceTowerType = params.sourceTowerType;
    } else if (params.type === 'cannon' || params.type === 'cannonball') {
      this.sourceTowerType = 'cannon';
    } else if (params.type === 'ice') {
      this.sourceTowerType = 'ice';
    } else if (params.type === 'poison') {
      this.sourceTowerType = 'poison';
    } else if (params.type === 'tesla') {
      this.sourceTowerType = 'tesla';
    } else if (params.type === 'sniper') {
      this.sourceTowerType = 'sniper';
    } else {
      this.sourceTowerType = 'archer';
    }
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
    this.stunDuration = params.stunDuration || 0;
    this.shieldPiercing = params.shieldPiercing || false;
    this.executeThreshold = params.executeThreshold || 0;
    this.allEnemies = params.allEnemies;
    this.speed = baseSpeed * (params.speedMultiplier || 1.0);

    this.setDepth(15);
    scene.add.existing(this);
  }

  public update(time: number, delta: number): void {
    this.lifespan -= delta;
    if (this.lifespan <= 0) {
      this.destroy();
      return;
    }

    // Zielverfolgung: Wenn Ziel stirbt, suche nächstgelegenen lebendigen Feind
    if (this.target && !this.target.isDead) {
      this.targetLastX = this.target.x;
      this.targetLastY = this.target.y;
    } else {
      let nearest: Enemy | null = null;
      let minDist = 140;
      for (const e of this.allEnemies) {
        if (!e.isDead) {
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < minDist) {
            minDist = d;
            nearest = e;
          }
        }
      }
      if (nearest) {
        this.target = nearest;
        this.targetLastX = nearest.x;
        this.targetLastY = nearest.y;
      }
    }

    const dx = this.targetLastX - this.x;
    const dy = this.targetLastY - this.y;
    const distance = Math.hypot(dx, dy);

    this.rotation = Math.atan2(dy, dx);
    const moveDist = this.speed * (delta / 1000);

    // Großzügige Trefferzone (kein Durchfliegen bei schnellen Berechnungen)
    if (distance <= moveDist || distance < 28) {
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
      case 'archer':
      case 'arrow':
      case 'sniper': {
        // Falls primäres Ziel noch lebt, trifft es; andernfalls beliebigen Feind im Umkreis
        let hitTarget: Enemy | null = (this.target && !this.target.isDead) ? this.target : null;
        if (!hitTarget) {
          let bestCandidate: Enemy | null = null;
          let bestDist = 65;
          for (const e of this.allEnemies) {
            if (!e.isDead) {
              const d = Math.hypot(e.x - this.x, e.y - this.y);
              if (d < bestDist) {
                bestDist = d;
                bestCandidate = e;
              }
            }
          }
          hitTarget = bestCandidate;
        }
        if (hitTarget) {
          if (this.executeThreshold > 0 && hitTarget.currentHp <= hitTarget.maxHp * this.executeThreshold) {
            // Tödliche Exekution!
            hitTarget.takeDamage(hitTarget.currentHp + 999, true, true, this.sourceTowerType);
          } else {
            hitTarget.takeDamage(finalDamage, isCrit, this.shieldPiercing, this.sourceTowerType);
          }

          if (this.stunDuration > 0) {
            hitTarget.applyStun(this.stunDuration);
          }

          this.spawnHitEffect(this.x, this.y);
        }
        break;
      }

      case 'cannon':
      case 'cannonball': {
        this.spawnExplosionEffect(this.x, this.y);
        this.allEnemies.forEach((e) => {
          if (!e.isDead) {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.splashRadius) {
              const ratio = Math.max(0.6, 1 - dist / this.splashRadius);
              e.takeDamage(Math.round(finalDamage * ratio), isCrit, this.shieldPiercing, this.sourceTowerType);
              if (this.stunDuration > 0) {
                e.applyStun(this.stunDuration);
              }
              if (this.dotDamage > 0) {
                e.applyPoison(this.dotDamage, this.dotDuration);
              }
            }
          }
        });
        break;
      }

      case 'ice': {
        this.spawnFrostEffect(this.x, this.y);
        this.allEnemies.forEach((e) => {
          if (!e.isDead) {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.splashRadius) {
              e.takeDamage(finalDamage, isCrit, this.shieldPiercing, this.sourceTowerType);
              if (this.stunDuration > 0) {
                e.applyStun(this.stunDuration);
              }
              if (this.slowFactor > 0) e.applySlow(this.slowFactor, this.slowDuration);
            }
          }
        });
        break;
      }

      case 'poison': {
        this.spawnPoisonEffect(this.x, this.y);
        this.allEnemies.forEach((e) => {
          if (!e.isDead) {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.splashRadius) {
              e.takeDamage(finalDamage, false, false, this.sourceTowerType);
              if (this.dotDamage > 0) e.applyPoison(this.dotDamage, this.dotDuration);
            }
          }
        });
        break;
      }

      case 'tesla': {
        this.chainLightningHit();
        break;
      }
    }

    this.destroy();
  }

  private chainLightningHit(): void {
    const hitList: Enemy[] = [];
    if (this.target && !this.target.isDead) {
      hitList.push(this.target);
      this.target.takeDamage(this.damage, false, false, this.sourceTowerType);
    }

    while (hitList.length < this.chainTargets) {
      const last = hitList[hitList.length - 1] || { x: this.x, y: this.y };
      let nearest: Enemy | null = null;
      let minDist = 140;

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
        const beam = this.scene.add.graphics().setDepth(20);
        beam.lineStyle(2, 0x74b9ff, 1);
        beam.lineBetween(last.x, last.y, nearest.x, nearest.y);
        this.scene.tweens.add({
          targets: beam,
          alpha: 0,
          duration: 180,
          onComplete: () => beam.destroy()
        });
        const chainDmg = Math.round(this.damage * Math.pow(0.75, hitList.length - 1));
        nearest.takeDamage(chainDmg, false, false, this.sourceTowerType);

        // Geerdete Erdwesen leiten den Kettenblitz ab und brechen die Kette ab!
        if (['golem', 'lava_golem', 'armored_troll'].includes(nearest.config.type)) {
          break;
        }
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
