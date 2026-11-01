export type WorldId = 'witch_forest' | 'goblin_caves' | 'dead_mountain';

export interface WorldProgress {
  unlocked: boolean;
  completedMissions: number; // 0 bis 50
  stars: Record<number, number>; // missionNum (1..50) -> 1..3 stars
}

export interface TowerMetaUpgrade {
  damage: number;    // 0..5 (je +12%)
  frequency: number; // 0..5 (je +9%)
  range: number;     // 0..5 (je +8%)
  speed: number;     // 0..5 (je +15%)
}

export interface SaveData {
  crystals: number;
  totalScore: number;
  selectedWorld: WorldId;
  selectedMission: number;
  worlds: Record<WorldId, WorldProgress>;
  towerUpgrades: Record<string, TowerMetaUpgrade>;
}

const DEFAULT_SAVE: SaveData = {
  crystals: 150,
  totalScore: 0,
  selectedWorld: 'witch_forest',
  selectedMission: 1,
  worlds: {
    witch_forest: {
      unlocked: true,
      completedMissions: 0,
      stars: {}
    },
    goblin_caves: {
      unlocked: false,
      completedMissions: 0,
      stars: {}
    },
    dead_mountain: {
      unlocked: false,
      completedMissions: 0,
      stars: {}
    }
  },
  towerUpgrades: {
    archer: { damage: 0, frequency: 0, range: 0, speed: 0 },
    cannon: { damage: 0, frequency: 0, range: 0, speed: 0 },
    ice: { damage: 0, frequency: 0, range: 0, speed: 0 },
    poison: { damage: 0, frequency: 0, range: 0, speed: 0 },
    tesla: { damage: 0, frequency: 0, range: 0, speed: 0 },
    sniper: { damage: 0, frequency: 0, range: 0, speed: 0 }
  }
};

const STORAGE_KEY = 'tower_defense_save_v3';

export class SaveSystem {
  private static data: SaveData = SaveSystem.load();

  public static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const data: SaveData = {
          ...DEFAULT_SAVE,
          ...parsed,
          worlds: {
            ...DEFAULT_SAVE.worlds,
            ...(parsed.worlds || {})
          },
          towerUpgrades: {
            ...DEFAULT_SAVE.towerUpgrades,
            ...(parsed.towerUpgrades || {})
          }
        };

        // Absicherung: worlds und completedMissions immer als Zahl
        (['witch_forest', 'goblin_caves', 'dead_mountain'] as WorldId[]).forEach((wId) => {
          if (!data.worlds[wId]) {
            data.worlds[wId] = { unlocked: wId === 'witch_forest', completedMissions: 0, stars: {} };
          }
          data.worlds[wId].completedMissions = Number(data.worlds[wId].completedMissions || 0);
          if (!data.worlds[wId].stars) data.worlds[wId].stars = {};
        });

        return data;
      }
    } catch (e) {
      console.warn('Fehler beim Laden des Spielstands, Standardwerte genutzt.', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
  }

  public static save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Konnte Spielstand nicht speichern', e);
    }
  }

  public static exportSave(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public static importSave(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.crystals === 'number' && parsed.worlds) {
        this.data = {
          ...DEFAULT_SAVE,
          ...parsed,
          worlds: {
            ...DEFAULT_SAVE.worlds,
            ...(parsed.worlds || {})
          },
          towerUpgrades: {
            ...DEFAULT_SAVE.towerUpgrades,
            ...(parsed.towerUpgrades || {})
          }
        };
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Import fehlgeschlagen:', e);
    }
    return false;
  }

  public static getData(): SaveData {
    return this.data;
  }

  public static getCrystals(): number {
    return this.data.crystals;
  }

  public static addCrystals(amount: number): void {
    this.data.crystals += amount;
    this.save();
  }

  public static spendCrystals(amount: number): boolean {
    if (this.data.crystals >= amount) {
      this.data.crystals -= amount;
      this.save();
      return true;
    }
    return false;
  }

  public static isWorldUnlocked(worldId: WorldId): boolean {
    if (worldId === 'witch_forest') return true;
    if (worldId === 'goblin_caves') {
      return (this.data.worlds.witch_forest.completedMissions || 0) >= 50;
    }
    if (worldId === 'dead_mountain') {
      return (this.data.worlds.goblin_caves.completedMissions || 0) >= 50;
    }
    return false;
  }

  public static isMissionUnlocked(worldId: WorldId, missionNum: number): boolean {
    if (missionNum === 1) return true;
    const world = this.data.worlds[worldId];
    if (!world) return missionNum === 1;
    const completed = Number(world.completedMissions || 0);
    return completed >= missionNum - 1;
  }

  public static completeMission(worldId: WorldId, missionNum: number, starsEarned: number, scoreEarned: number): void {
    let world = this.data.worlds[worldId];
    if (!world) {
      world = { unlocked: true, completedMissions: 0, stars: {} };
      this.data.worlds[worldId] = world;
    }

    world.stars = world.stars || {};
    const prevStars = world.stars[missionNum] || 0;
    if (starsEarned > prevStars) {
      world.stars[missionNum] = starsEarned;
      const newStars = starsEarned - prevStars;
      this.data.crystals += newStars * 25;
    }

    const currentCompleted = Number(world.completedMissions || 0);
    if (missionNum > currentCompleted) {
      world.completedMissions = missionNum;
      this.data.crystals += 50; // Bonus für neue Mission
    }

    this.data.totalScore += scoreEarned;

    // Nach 50 Missionen nächste Welt freischalten
    if (worldId === 'witch_forest' && world.completedMissions >= 50) {
      this.data.worlds.goblin_caves.unlocked = true;
    } else if (worldId === 'goblin_caves' && world.completedMissions >= 50) {
      this.data.worlds.dead_mountain.unlocked = true;
    }

    this.save();
  }

  public static getTowerUpgrade(towerType: string): TowerMetaUpgrade {
    if (!this.data.towerUpgrades[towerType]) {
      this.data.towerUpgrades[towerType] = { damage: 0, frequency: 0, range: 0, speed: 0 };
    }
    return this.data.towerUpgrades[towerType];
  }

  public static getUpgradeCost(currentTier: number): number {
    const costs = [30, 60, 100, 160, 250];
    return costs[currentTier] || 999;
  }

  public static upgradeStat(towerType: string, stat: keyof TowerMetaUpgrade): boolean {
    const up = this.getTowerUpgrade(towerType);
    if (up[stat] >= 5) return false;

    const cost = this.getUpgradeCost(up[stat]);
    if (this.spendCrystals(cost)) {
      up[stat]++;
      this.save();
      return true;
    }
    return false;
  }

  public static resetAllUpgrades(): void {
    let refund = 0;
    Object.values(this.data.towerUpgrades).forEach((up) => {
      (['damage', 'frequency', 'range', 'speed'] as (keyof TowerMetaUpgrade)[]).forEach((s) => {
        for (let i = 0; i < up[s]; i++) {
          refund += this.getUpgradeCost(i);
        }
        up[s] = 0;
      });
    });

    this.data.crystals += refund;
    this.save();
  }

  public static getStatMultipliers(towerType: string) {
    const up = this.getTowerUpgrade(towerType);
    return {
      damageMult: 1.0 + up.damage * 0.12,
      frequencyMult: 1.0 + up.frequency * 0.09,
      rangeMult: 1.0 + up.range * 0.08,
      speedMult: 1.0 + up.speed * 0.15
    };
  }
}
