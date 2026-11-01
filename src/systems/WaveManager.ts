import Phaser from 'phaser';
import { ENEMY_CONFIGS, EnemyType } from '../config/EnemyConfig';
import { WORLDS_CONFIG } from '../config/WorldConfig';
import { WorldId } from './SaveSystem';
import { Enemy } from '../entities/Enemy';
import { MapManager } from './MapManager';
import { EconomySystem } from './EconomySystem';

export class WaveManager {
  private scene: Phaser.Scene;
  private mapManager: MapManager;
  private economy: EconomySystem;
  private worldId: WorldId;
  private missionNumber: number;

  private currentWaveIndex: number = 0;
  private totalWaves: number = 10;
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
    worldId: WorldId = 'witch_forest',
    missionNumber: number = 1,
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
    this.worldId = worldId;
    this.missionNumber = missionNumber;
    this.onWaveChange = callbacks.onWaveChange;
    this.onWaveCompleted = callbacks.onWaveCompleted;
    this.onAllWavesCompleted = callbacks.onAllWavesCompleted;
    this.onWaveAnnouncement = callbacks.onWaveAnnouncement;
  }

  public getCurrentWaveNumber(): number {
    return this.currentWaveIndex + 1;
  }

  public getTotalWaves(): number {
    return this.totalWaves;
  }

  public isWaveActive(): boolean {
    return this.isSpawning || this.activeEnemies.length > 0;
  }

  public getActiveEnemies(): Enemy[] {
    return this.activeEnemies;
  }

  public startNextWave(): boolean {
    if (this.isWaveActive() || this.currentWaveIndex >= this.totalWaves) {
      return false;
    }

    const waveNum = this.getCurrentWaveNumber();
    this.onWaveChange(waveNum, this.totalWaves);

    const worldDef = WORLDS_CONFIG[this.worldId] || WORLDS_CONFIG.witch_forest;
    const isBossWave = waveNum === 10;
    const announcement = isBossWave
      ? `FINALE WELLE 10: Titanen-Boss greift an!`
      : `Welle ${waveNum} / 10 - Feindlicher Vorstoß!`;
    this.onWaveAnnouncement(announcement);

    // Welt-Grundskalierung
    const worldMult = this.worldId === 'dead_mountain' ? 1.25 : this.worldId === 'goblin_caves' ? 1.12 : 1.0;

    // Sanfte globale Missionsprogression über 150 Level:
    const globalMission = this.worldId === 'dead_mountain'
      ? 100 + this.missionNumber
      : this.worldId === 'goblin_caves'
      ? 50 + this.missionNumber
      : this.missionNumber;

    // Sehr kontrollierte Potenzkurve (1.0x bei Level 1 bis ~2.5x bei Level 150)
    const progressRatio = Math.max(0, (globalMission - 1) / 149);
    const missionMult = 1.0 + Math.pow(progressRatio, 1.2) * 1.5;

    // Sanfte Wellen-Skalierung innerhalb einer Mission (Welle 1: 1.0x bis Welle 10: 1.40x)
    const waveMult = 1.0 + (waveNum - 1) * 0.045;
    const hpMult = worldMult * missionMult * waveMult;

    // Nur leichte Gegner in den ersten Wellen!
    const fullPool = worldDef.enemyPool as EnemyType[];
    let allowedPoolLength = 2; // Welle 1-2: nur Goblins & Bats
    if (waveNum >= 3) allowedPoolLength = 3; // Welle 3-4: + Hexen / Bomber
    if (waveNum >= 5) allowedPoolLength = 4; // Welle 5-7: + Schleime / Orks
    if (waveNum >= 8) allowedPoolLength = fullPool.length; // Welle 8-10: schwere Trolle

    const currentPool = fullPool.slice(0, allowedPoolLength);
    const spawnCount = 5 + waveNum;
    this.isSpawning = true;
    this.enemiesRemainingToSpawn = spawnCount + (isBossWave ? 1 : 0);

    let cumulativeDelay = 350;

    for (let i = 0; i < spawnCount; i++) {
      cumulativeDelay += Math.max(600, 1200 - waveNum * 35);
      const enemyType = currentPool[i % currentPool.length];

      this.scene.time.delayedCall(cumulativeDelay, () => {
        if (this.scene && this.scene.sys.isActive()) {
          this.spawnEnemy(enemyType, hpMult);
          this.enemiesRemainingToSpawn--;
          if (this.enemiesRemainingToSpawn <= 0) this.isSpawning = false;
        }
      });
    }

    if (isBossWave) {
      cumulativeDelay += 1400;
      this.scene.time.delayedCall(cumulativeDelay, () => {
        if (this.scene && this.scene.sys.isActive()) {
          this.spawnEnemy('boss', hpMult * 1.8);
          this.enemiesRemainingToSpawn--;
          if (this.enemiesRemainingToSpawn <= 0) this.isSpawning = false;
        }
      });
    }

    return true;
  }

  private spawnEnemy(type: EnemyType, hpMultiplier: number): void {
    const config = ENEMY_CONFIGS[type] || ENEMY_CONFIGS.goblin;
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

    if (!this.isSpawning && this.activeEnemies.length === 0) {
      this.handleWaveEnd();
    }
  }

  private handleWaveEnd(): void {
    const completedWaveNum = this.getCurrentWaveNumber();
    this.onWaveCompleted(completedWaveNum);

    const waveBonus = 20 + completedWaveNum * 6;
    this.economy.addGold(waveBonus);

    this.currentWaveIndex++;

    if (this.currentWaveIndex >= this.totalWaves) {
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
