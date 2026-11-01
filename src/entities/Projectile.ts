import Phaser from 'phaser';
import { Enemy } from './Enemy';

export type ProjectileType = 'arrow' | 'cannonball' | 'ice';

export interface ProjectileParams {
  type: ProjectileType;
  startX: number;
  startY: number;
  target: Enemy;
  damage: number;
  splashRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  allEnemies: Enemy[];
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
  private allEnemies: Enemy[];
  private speed: number;

  constructor(scene: Phaser.Scene, params: ProjectileParams) {
    let textureKey = 'proj_arrow';
    let baseSpeed = 450;

    if (params.type === 'cannonball') {
      textureKey = 'proj_cannonball';
      baseSpeed = 340;
    } else if (params.type === 'ice') {
      textureKey = 'proj_ice';
      baseSpeed = 380;
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
    this.allEnemies = params.allEnemies;
    this.speed = baseSpeed;

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

    // Rotation in Flugrichtung
    const angle = Math.atan2(dy, dx);
    this.rotation = angle;

    const moveDist = this.speed * (delta / 1000);

    if (distance <= moveDist || distance < 12) {
      this.hit();
    } else {
      this.x += Math.cos(angle) * moveDist;
      this.y += Math.sin(angle) * moveDist;
    }
  }

  private hit(): void {
    if (this.pType === 'arrow') {
      // Einzelziel-Treffer
      if (this.target && !this.target.isDead) {
        this.target.takeDamage(this.damage);
        this.spawnHitEffect(this.x, this.y);
      }
    } else if (this.pType === 'cannonball') {
      // Flächenschaden
      this.spawnExplosionEffect(this.x, this.y);

      this.allEnemies.forEach((enemy) => {
        if (!enemy.isDead) {
          const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (dist <= this.splashRadius) {
            // Vollschaden im Zentrum, min 50% am Rand
            const damageRatio = Math.max(0.5, 1 - dist / this.splashRadius);
            enemy.takeDamage(Math.round(this.damage * damageRatio));
          }
        }
      });
    } else if (this.pType === 'ice') {
      // Frost-Effekt & Slow
      this.spawnFrostEffect(this.x, this.y);

      this.allEnemies.forEach((enemy) => {
        if (!enemy.isDead) {
          const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (dist <= this.splashRadius) {
            enemy.takeDamage(this.damage);
            if (this.slowFactor > 0 && this.slowDuration > 0) {
              enemy.applySlow(this.slowFactor, this.slowDuration);
            }
          }
        }
      });
    }

    this.destroy();
  }

  private spawnHitEffect(x: number, y: number): void {
    const hit = this.scene.add.image(x, y, 'effect_hit').setDepth(20);
    this.scene.tweens.add({
      targets: hit,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 150,
      onComplete: () => hit.destroy()
    });
  }

  private spawnExplosionEffect(x: number, y: number): void {
    const explosion = this.scene.add.image(x, y, 'effect_explosion').setDepth(20);
    explosion.setScale(0.4);

    // Kameraschütteln für Wucht
    this.scene.cameras.main.shake(100, 0.003);

    this.scene.tweens.add({
      targets: explosion,
      scaleX: (this.splashRadius * 2) / 48,
      scaleY: (this.splashRadius * 2) / 48,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => explosion.destroy()
    });
  }

  private spawnFrostEffect(x: number, y: number): void {
    const frost = this.scene.add.image(x, y, 'effect_frost').setDepth(20);
    frost.setScale(0.4);

    this.scene.tweens.add({
      targets: frost,
      scaleX: (this.splashRadius * 2) / 48,
      scaleY: (this.splashRadius * 2) / 48,
      rotation: Math.PI * 0.5,
      alpha: 0,
      duration: 350,
      ease: 'Sine.easeOut',
      onComplete: () => frost.destroy()
    });
  }
}

