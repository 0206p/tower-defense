import Phaser from 'phaser';
import { ENEMY_CONFIGS, EnemyDefinition, EnemyType } from '../config/EnemyConfig';
import { WORLDS_CONFIG } from '../config/WorldConfig';
import { WorldId, SaveSystem } from './SaveSystem';
import { Enemy } from '../entities/Enemy';
import { MapManager } from './MapManager';
import { EconomySystem } from './EconomySystem';
import { balancing } from './BalancingTelemetry';

export class WaveManager {
  private scene: Phaser.Scene;
  private mapManager: MapManager;
  private economy: EconomySystem;
  private worldId: WorldId;
  private missionNumber: number;

  private currentWaveIndex: number = 0;
  private totalWaves: number = 10;
  private isEndless: boolean = false;
  private isDungeon: boolean = false;
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
    isEndless: boolean = false,
    isDungeon: boolean = false
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
    this.isDungeon = isDungeon;

    if (this.isEndless) {
      this.totalWaves = 999999;
    } else if (this.isDungeon) {
      this.totalWaves = 30;
    }
  }

  public getIsEndless(): boolean {
    return this.isEndless;
  }

  public getIsDungeon(): boolean {
    return this.isDungeon;
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
    balancing.startWave(waveNum, this.worldId, this.isEndless);
    this.onWaveChange(waveNum, this.isEndless ? 0 : this.totalWaves);

    const worldDef = WORLDS_CONFIG[this.worldId] || WORLDS_CONFIG.witch_forest;
    const isBossWave = this.isEndless
      ? waveNum % 10 === 0
      : (this.isDungeon ? (waveNum === 30 || waveNum % 10 === 0) : waveNum === 10);
    const isMiniBossWave = this.isEndless
      ? (!isBossWave && waveNum % 5 === 0)
      : (this.isDungeon ? (!isBossWave && waveNum % 5 === 0) : false);

    let announcement = `Welle ${waveNum} / 10 - Feindlicher Vorstoß!`;
    if (this.isDungeon) {
      if (waveNum === 30) {
        announcement = `⚠️ FINALE KAMMER 30: DER KERKERMEISTER ERWACHT!`;
      } else if (isBossWave) {
        announcement = `⚔️ DUNGEON-BOSS KAMMER ${waveNum}: Ein finsterer Titan bricht hervor!`;
      } else if (isMiniBossWave) {
        announcement = `⚠️ KAMMER ${waveNum} / 30: Elite-Vorhut nähert sich!`;
      } else {
        announcement = `🏰 DUNGEON - KAMMER ${waveNum} / 30`;
      }
    } else if (this.isEndless) {
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

    if (this.isDungeon) {
      // Dungeon: Endgame-Herausforderung (30 Kammern), fordernd aber mit Upgrades schlagbar!
      // Kammer 1 startet bei 2.2x HP, Kammer 30 skaliert bis auf ~12.5x HP
      hpMult = 2.2 + (waveNum - 1) * 0.22 + Math.pow((waveNum - 1) / 29, 1.4) * 4.5;
      spawnCount = Math.min(26, 8 + Math.floor(waveNum * 0.6));

      const allDungeonTypes: EnemyType[] = [
        'cave_goblin', 'bat', 'witch', 'slime', 'bomber',
        'orc', 'armored_troll', 'golem', 'fire_imp', 'magma_orc',
        'hellhound', 'lava_golem'
      ];
      const poolLen = Math.min(allDungeonTypes.length, 4 + Math.floor(waveNum / 2.5));
      currentPool = allDungeonTypes.slice(0, poolLen);
    } else if (this.isEndless) {
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
      // Kampagnen-Skalierung: Balancierter Verlauf über 3 Welten x 30 Missionen
      // Hexenwelt: 1.0x -> 1.8x
      // Goblinhöhlen: 1.45x -> 2.9x
      // Toter Berg: 1.9x -> 4.2x (Welle 1) bis max 10.8x (Welle 10)
      const worldMult = this.worldId === 'dead_mountain' ? 1.9 : this.worldId === 'goblin_caves' ? 1.45 : 1.0;
      const progressRatio = Math.max(0, (this.missionNumber - 1) / 29);
      const missionMult = 1.0 + Math.pow(progressRatio, 1.15) * 1.20;

      // Wellen-Skalierung innerhalb der 10 Wellen einer Mission:
      // Welle 1: 1.0x -> Welle 5: 1.6x -> Welle 10: 2.5x
      const waveMult = 1.0 + (waveNum - 1) * 0.12 + Math.pow((waveNum - 1) / 3.0, 1.4) * 0.25;
      hpMult = worldMult * missionMult * waveMult;

      const fullPool = worldDef.enemyPool as EnemyType[];
      let allowedPoolLength = 2;
      if (waveNum >= 3) allowedPoolLength = 3;
      if (waveNum >= 5) allowedPoolLength = 4;
      if (waveNum >= 8) allowedPoolLength = fullPool.length;
      currentPool = fullPool.slice(0, allowedPoolLength);
      spawnCount = 6 + Math.floor(waveNum * 1.1);
    }

    const extraEnemies = isBossWave ? 1 : isMiniBossWave ? 1 : 0;
    this.isSpawning = true;
    this.enemiesRemainingToSpawn = spawnCount + extraEnemies;

    // Tempo-Steigerung mit späteren Wellen (+2% bis +22% Tempo)
    const waveSpeedScale = 1.0 + Math.min(0.24, (waveNum - 1) * 0.026);
    let cumulativeDelay = 350;

    for (let i = 0; i < spawnCount; i++) {
      cumulativeDelay += Math.max(380, 950 - waveNum * 35);
      const enemyType = currentPool[i % currentPool.length];

      this.scene.time.delayedCall(cumulativeDelay, () => {
        if (this.scene && this.scene.sys.isActive()) {
          this.spawnEnemy(enemyType, hpMult, waveSpeedScale);
          this.enemiesRemainingToSpawn--;
          if (this.enemiesRemainingToSpawn <= 0) {
            this.isSpawning = false;
            if (this.activeEnemies.length === 0) {
              this.handleWaveEnd();
            }
          }
        }
      });
    }

    if (isBossWave) {
      cumulativeDelay += 1200;
      this.scene.time.delayedCall(cumulativeDelay, () => {
        if (this.scene && this.scene.sys.isActive()) {
          this.spawnEnemy('boss', hpMult * 2.2, 1.0);
          this.enemiesRemainingToSpawn--;
          if (this.enemiesRemainingToSpawn <= 0) {
            this.isSpawning = false;
            if (this.activeEnemies.length === 0) {
              this.handleWaveEnd();
            }
          }
        }
      });
    } else if (isMiniBossWave) {
      cumulativeDelay += 800;
      this.scene.time.delayedCall(cumulativeDelay, () => {
        if (this.scene && this.scene.sys.isActive()) {
          this.spawnEnemy('armored_troll', hpMult * 1.6, 1.05);
          this.enemiesRemainingToSpawn--;
          if (this.enemiesRemainingToSpawn <= 0) {
            this.isSpawning = false;
            if (this.activeEnemies.length === 0) {
              this.handleWaveEnd();
            }
          }
        }
      });
    }

    return true;
  }

  private spawnEnemy(type: EnemyType, hpMultiplier: number, speedMultiplier: number = 1.0): void {
    const config = ENEMY_CONFIGS[type] || ENEMY_CONFIGS.goblin;

    // Balancierte Schilde: Nur Einheiten mit angeborenen Panzern (Golems, gepanzerte Trolle, Bosse)
    // erhalten skalierende Schilde. Schwärme/Läufer behalten 0 Schild, damit Türme direkten Schaden anrichten!
    let extraShield = config.shield || 0;
    if (extraShield > 0) {
      if (this.isDungeon) {
        extraShield += Math.round(this.currentWaveIndex * 3);
      } else if (this.worldId === 'dead_mountain') {
        extraShield += Math.round(this.missionNumber * 2);
      } else if (this.worldId === 'goblin_caves') {
        extraShield += Math.round(this.missionNumber * 1.2);
      }
    }

    const enemyConfig: EnemyDefinition = {
      ...config,
      speed: Math.round(config.speed * speedMultiplier),
      shield: extraShield > 0 ? extraShield : config.shield
    };

    const enemy = new Enemy(
      this.scene,
      enemyConfig,
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
    balancing.finalizeWave(completedWaveNum);
    this.onWaveCompleted(completedWaveNum);

    const waveBonus = 12 + completedWaveNum * 3;
    this.economy.addGold(waveBonus);

    if (this.isEndless && completedWaveNum % 5 === 0) {
      const bonusCrystals = 10 + Math.floor(completedWaveNum / 5) * 5;
      SaveSystem.addCrystals(bonusCrystals);
      this.onWaveAnnouncement(`💎 MEILENSTEIN WELLE ${completedWaveNum}! +${bonusCrystals} KRISTALLE!`);
    } else if (this.isDungeon && completedWaveNum % 5 === 0) {
      const bonusCrystals = 25 + Math.floor(completedWaveNum / 5) * 10;
      SaveSystem.addCrystals(bonusCrystals);
      this.onWaveAnnouncement(`💎 KAMMER ${completedWaveNum} GEMEISTERT! +${bonusCrystals} KRISTALLE!`);
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
