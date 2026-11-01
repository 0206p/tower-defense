import Phaser from 'phaser';
import { WaveDefinition, WAVES_CONFIG } from '../config/WaveConfig';
import { ENEMY_CONFIGS, EnemyType } from '../config/EnemyConfig';
import { Enemy } from '../entities/Enemy';
import { MapManager } from './MapManager';
import { EconomySystem } from './EconomySystem';

export class WaveManager {
  private scene: Phaser.Scene;
  private mapManager: MapManager;
  private economy: EconomySystem;

  private currentWaveIndex: number = 0;
  private isSpawning: boolean = false;
  private enemiesRemainingToSpawn: number = 0;
  private activeEnemies: Enemy[] = [];

  private onWaveChange: (waveNumber: number, totalWaves: number) => void;
  private onWaveCompleted: (waveNumber: number) => void;
  private onAllWavesCompleted: () => void;
  private onWaveAnnouncement: (text: string) => void;

  constructor(
    scene: Phaser.Scene,
    mapManager: MapManager,
    economy: EconomySystem,
    callbacks: {
      onWaveChange: (waveNumber: number, totalWaves: number) => void;
      onWaveCompleted: (waveNumber: number) => void;
      onAllWavesCompleted: () => void;
      onWaveAnnouncement: (text: string) => void;
    }
  ) {
    this.scene = scene;
    this.mapManager = mapManager;
    this.economy = economy;
    this.onWaveChange = callbacks.onWaveChange;
    this.onWaveCompleted = callbacks.onWaveCompleted;
    this.onAllWavesCompleted = callbacks.onAllWavesCompleted;
    this.onWaveAnnouncement = callbacks.onWaveAnnouncement;
  }

  public getCurrentWaveNumber(): number {
    return this.currentWaveIndex + 1;
  }

  public getTotalWaves(): number {
    return WAVES_CONFIG.length;
  }

  public isWaveActive(): boolean {
    return this.isSpawning || this.activeEnemies.length > 0;
  }

  public getActiveEnemies(): Enemy[] {
    return this.activeEnemies;
  }

  public startNextWave(): boolean {
    if (this.isWaveActive() || this.currentWaveIndex >= WAVES_CONFIG.length) {
      return false;
    }

    const wave = WAVES_CONFIG[this.currentWaveIndex];
    this.onWaveChange(this.getCurrentWaveNumber(), this.getTotalWaves());
    this.onWaveAnnouncement(wave.announcement);

    this.isSpawning = true;
    this.enemiesRemainingToSpawn = wave.spawns.length;

    let cumulativeDelay = 400; // Kurze Vorlaufzeit

    wave.spawns.forEach((spawnItem) => {
      cumulativeDelay += spawnItem.delayMs;

      this.scene.time.delayedCall(cumulativeDelay, () => {
        if (this.scene && this.scene.sys.isActive()) {
          this.spawnEnemy(spawnItem.enemyType, spawnItem.hpMultiplier || 1.0);
          this.enemiesRemainingToSpawn--;

          if (this.enemiesRemainingToSpawn <= 0) {
            this.isSpawning = false;
          }
        }
      });
    });

    return true;
  }

  private spawnEnemy(type: EnemyType, hpMultiplier: number): void {
    const config = ENEMY_CONFIGS[type];
    const enemy = new Enemy(
      this.scene,
      config,
      this.mapManager,
      this.economy,
      {
        onDeath: (e) => this.handleEnemyRemoved(e),
        onReachedEnd: (e) => this.handleEnemyRemoved(e)
      },
      hpMultiplier
    );

    this.activeEnemies.push(enemy);
  }

  private handleEnemyRemoved(enemy: Enemy): void {
    const idx = this.activeEnemies.indexOf(enemy);
    if (idx !== -1) {
      this.activeEnemies.splice(idx, 1);
    }

    // Prüfen, ob Welle abgeschlossen ist
    if (!this.isSpawning && this.activeEnemies.length === 0) {
      this.handleWaveEnd();
    }
  }

  private handleWaveEnd(): void {
    const completedWaveNum = this.getCurrentWaveNumber();
    this.onWaveCompleted(completedWaveNum);

    // Wellen-Bonus-Gold geben (z.B. 25 + Welle * 10)
    const waveBonus = 25 + completedWaveNum * 10;
    this.economy.addGold(waveBonus);

    this.currentWaveIndex++;

    if (this.currentWaveIndex >= WAVES_CONFIG.length) {
      // Alle 10 Wellen geschafft! Sieg!
      this.onAllWavesCompleted();
    }
  }

  public update(time: number, delta: number): void {
    for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
      const enemy = this.activeEnemies[i];
      if (enemy && !enemy.isDead) {
        enemy.update(time, delta);
      }
    }
  }
}

