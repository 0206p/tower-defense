export type WorldId = 'witch_forest' | 'goblin_caves' | 'dead_mountain';

export interface WorldProgress {
  unlocked: boolean;
  completedMissions: number; // 0 bis 50
  stars: Record<number, number>; // missionNum (1..50) -> 1..3 stars
}

export interface TowerMetaUpgrade {
  damage: number;    // 0..5 (je +10% bis +50%)
  frequency: number; // 0..5 (je +8% bis +40% Angriffsrate)
  range: number;     // 0..5 (je +7% bis +35% Reichweite)
  speed: number;     // 0..5 (je +12% bis +60% Projektiltempo & Spezialeigenschaft)
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
  crystals: 150, // Kleines Startkapital zum Experimentieren im Upgrade-Menü
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

const STORAGE_KEY = 'tower_defense_save_v2';

export class SaveSystem {
  private static data: SaveData = SaveSystem.load();

  public static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
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
      return this.data.worlds.witch_forest.completedMissions >= 50;
    }
    if (worldId === 'dead_mountain') {
      return this.data.worlds.goblin_caves.completedMissions >= 50;
    }
    return false;
  }

  public static completeMission(worldId: WorldId, missionNum: number, starsEarned: number, scoreEarned: number): void {
    const world = this.data.worlds[worldId];
    if (!world) return;

    const prevStars = world.stars[missionNum] || 0;
    if (starsEarned > prevStars) {
      world.stars[missionNum] = starsEarned;
      const newStars = starsEarned - prevStars;
      this.addCrystals(newStars * 25); // 25 Kristalle pro neuem Stern
    }

    if (missionNum > world.completedMissions) {
      world.completedMissions = missionNum;
      this.addCrystals(50); // Bonus für erste Vollendung der Mission
    }

    this.data.totalScore += scoreEarned;

    // Automatische Freischaltung der nächsten Welt nach 50 Missionen
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
    // Stufe 1: 30, Stufe 2: 60, Stufe 3: 100, Stufe 4: 160, Stufe 5: 250 Kristalle
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
    // Erstatte alle investierten Kristalle
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
      damageMult: 1.0 + up.damage * 0.12,        // Bis zu +60% Schaden
      frequencyMult: 1.0 + up.frequency * 0.09,  // Bis zu +45% Kadenz
      rangeMult: 1.0 + up.range * 0.08,          // Bis zu +40% Reichweite
      speedMult: 1.0 + up.speed * 0.15           // Bis zu +75% Geschoss-/Spezialtempo
    };
  }
}
