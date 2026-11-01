import Phaser from 'phaser';
import { ENEMY_CONFIGS, EnemyType } from '../config/EnemyConfig';
import { WORLDS_CONFIG } from '../config/WorldConfig';
import { WorldId, SaveSystem } from './SaveSystem';
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
  private isEndless: boolean = false;
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
    },
    isEndless: boolean = false
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
    this.isEndless = isEndless;
    if (this.isEndless) {
      this.totalWaves = 999999;
    }
  }

  public getIsEndless(): boolean {
    return this.isEndless;
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
    if (this.isWaveActive() || (!this.isEndless && this.currentWaveIndex >= this.totalWaves)) {
      return false;
    }

    const waveNum = this.getCurrentWaveNumber();
    this.onWaveChange(waveNum, this.isEndless ? 0 : this.totalWaves);

    const worldDef = WORLDS_CONFIG[this.worldId] || WORLDS_CONFIG.witch_forest;
    const isBossWave = this.isEndless ? waveNum % 10 === 0 : waveNum === 10;
    const isMiniBossWave = this.isEndless && !isBossWave && waveNum % 5 === 0;

    let announcement = `Welle ${waveNum} / 10 - Feindlicher Vorstoß!`;
    if (this.isEndless) {
      if (isBossWave) {
        announcement = `⚔️ ENDLOS-BOSS WELLE ${waveNum}: Titanen erwachen!`;
      } else if (isMiniBossWave) {
        announcement = `⚠️ ENDLOS WELLE ${waveNum}: Elite-Horde greift an!`;
      } else {
        announcement = `⚔️ ENDLOS-WELLE ${waveNum} - Neue Monster nahen!`;
      }
    } else if (isBossWave) {
      announcement = `FINALE WELLE 10: Titanen-Boss greift an!`;
    }
    this.onWaveAnnouncement(announcement);

    let hpMult = 1.0;
    let currentPool: EnemyType[] = [];
    let spawnCount = 6;

    if (this.isEndless) {
      // Endlosmodus-Skalierung: graduell, fordernd, aber mathematisch fair
      hpMult = 1.0 + (waveNum - 1) * 0.08 + Math.pow(Math.max(0, waveNum - 5) * 0.02, 1.25);
      spawnCount = Math.min(28, 6 + Math.floor(waveNum * 0.7));

      // Im Endlosmodus kommen schrittweise alle Monstertypen vor
      const allTypes: EnemyType[] = [
        'goblin', 'bat', 'witch', 'slime', 'swamp_troll',
        'cave_goblin', 'bomber', 'orc', 'armored_troll', 'golem',
        'fire_imp', 'magma_orc', 'hellhound', 'lava_golem'
      ];
      const poolSize = Math.min(allTypes.length, 3 + Math.floor(waveNum / 2));
      currentPool = allTypes.slice(0, poolSize);
    } else {
      // Kampagnen-Skalierung
      const worldMult = this.worldId === 'dead_mountain' ? 1.25 : this.worldId === 'goblin_caves' ? 1.12 : 1.0;
      const globalMission = this.worldId === 'dead_mountain'
        ? 100 + this.missionNumber
        : this.worldId === 'goblin_caves'
        ? 50 + this.missionNumber
        : this.missionNumber;

      const progressRatio = Math.max(0, (globalMission - 1) / 149);
      const missionMult = 1.0 + Math.pow(progressRatio, 1.2) * 1.5;
      const waveMult = 1.0 + (waveNum - 1) * 0.045;
      hpMult = worldMult * missionMult * waveMult;

      const fullPool = worldDef.enemyPool as EnemyType[];
      let allowedPoolLength = 2;
      if (waveNum >= 3) allowedPoolLength = 3;
      if (waveNum >= 5) allowedPoolLength = 4;
      if (waveNum >= 8) allowedPoolLength = fullPool.length;
      currentPool = fullPool.slice(0, allowedPoolLength);
      spawnCount = 5 + waveNum;
    }

    this.isSpawning = true;
    this.enemiesRemainingToSpawn = spawnCount + (isBossWave ? 1 : isMiniBossWave ? 2 : 0);

    let cumulativeDelay = 350;

    for (let i = 0; i < spawnCount; i++) {
      cumulativeDelay += Math.max(500, 1100 - waveNum * 25);
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
    } else if (isMiniBossWave) {
      cumulativeDelay += 800;
      this.scene.time.delayedCall(cumulativeDelay, () => {
        if (this.scene && this.scene.sys.isActive()) {
          this.spawnEnemy('armored_troll', hpMult * 1.4);
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

    if (this.isEndless && completedWaveNum % 5 === 0) {
      const bonusCrystals = 10 + Math.floor(completedWaveNum / 5) * 5;
      SaveSystem.addCrystals(bonusCrystals);
      this.onWaveAnnouncement(`💎 MEILENSTEIN WELLE ${completedWaveNum}! +${bonusCrystals} KRISTALLE!`);
    }

    this.currentWaveIndex++;

    if (!this.isEndless && this.currentWaveIndex >= this.totalWaves) {
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
