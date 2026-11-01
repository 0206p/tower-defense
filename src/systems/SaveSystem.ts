import { TowerType } from '../config/TowerConfig';

export type WorldId = 'witch_forest' | 'goblin_caves' | 'dead_mountain' | 'dungeon';

export type TowerSkinId = 'default' | 'void' | 'zerg' | 'gold';

export interface SkinDefinition {
  id: TowerSkinId;
  name: string;
  theme: string;
  cost: number;
  themeColor: number;
  glowColor: number;
  tint: number;
  description: string;
}

export const SKINS_CONFIG: Record<TowerSkinId, SkinDefinition> = {
  default: {
    id: 'default',
    name: 'TERRAN VANGUARD',
    theme: 'Militärischer Titan-Stahl',
    cost: 0,
    themeColor: 0x38bdf8,
    glowColor: 0x0284c7,
    tint: 0xffffff,
    description: 'Klassische terranische RTS-Geschütze mit stahlblauer Panzerung & dualer Kadenz.'
  },
  void: {
    id: 'void',
    name: 'VOID PROTOSS',
    theme: 'Obsidian & Plasma-Matrix',
    cost: 120,
    themeColor: 0x38bdf8,
    glowColor: 0x818cf8,
    tint: 0x67e8f9,
    description: 'Außerirdische Obsidian-Geschütze mit pulsierendem Cyan- und Violett-Plasma.'
  },
  zerg: {
    id: 'zerg',
    name: 'ZERG BIO-MUTANT',
    theme: 'Lebende Chitin-Mutation',
    cost: 200,
    themeColor: 0x22c55e,
    glowColor: 0xef4444,
    tint: 0x4ade80,
    description: 'Mutierte biomechanische Chitin-Geschütze mit giftigen Säureadern & Organ-Aura.'
  },
  gold: {
    id: 'gold',
    name: 'CHRONO GOLD',
    theme: 'Kaiserliche Mecha-Elite',
    cost: 350,
    themeColor: 0xfacc15,
    glowColor: 0xeab308,
    tint: 0xfef08a,
    description: 'Prächtige Mecha-Panzerung aus reinem Chrono-Gold mit strahlender Lichtaura.'
  }
};

export interface WorldProgress {
  unlocked: boolean;
  completedMissions: number; // 0 bis 30
  stars: Record<number, number>; // missionNum (1..30) -> 1..3 stars
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
  endlessHighScore: number;
  endlessMaxWave: number;
  dungeonHighScore?: number;
  dungeonMaxWave?: number;
  dungeonUnlocked?: boolean;
  activeSkin?: TowerSkinId;
  unlockedSkins?: TowerSkinId[];
  unlockedTowers?: string[];
  activeTowerDeck?: TowerType[];
  worlds: Record<WorldId, WorldProgress>;
  towerUpgrades: Record<string, TowerMetaUpgrade>;
}

export const DEFAULT_UNLOCKED_TOWERS: TowerType[] = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];

export const TOWER_UNLOCK_COSTS: Record<string, number> = {
  flamethrower: 350,
  plasma_pylon: 500,
  orbital_laser: 650,
  chrono_disruptor: 800,
  bio_hive: 950
};

const DEFAULT_SAVE: SaveData = {
  crystals: 150,
  totalScore: 0,
  selectedWorld: 'witch_forest',
  selectedMission: 1,
  endlessHighScore: 0,
  endlessMaxWave: 0,
  dungeonHighScore: 0,
  dungeonMaxWave: 0,
  dungeonUnlocked: false,
  activeSkin: 'default',
  unlockedSkins: ['default'],
  unlockedTowers: [...DEFAULT_UNLOCKED_TOWERS],
  activeTowerDeck: [...DEFAULT_UNLOCKED_TOWERS],
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
    },
    dungeon: {
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
    sniper: { damage: 0, frequency: 0, range: 0, speed: 0 },
    flamethrower: { damage: 0, frequency: 0, range: 0, speed: 0 },
    plasma_pylon: { damage: 0, frequency: 0, range: 0, speed: 0 },
    orbital_laser: { damage: 0, frequency: 0, range: 0, speed: 0 },
    chrono_disruptor: { damage: 0, frequency: 0, range: 0, speed: 0 },
    bio_hive: { damage: 0, frequency: 0, range: 0, speed: 0 }
  }
};

const STORAGE_KEY = 'tower_defense_save_v3';

export class SaveSystem {
  private static data: SaveData = SaveSystem.load();
  private static adminMode: boolean = (function() {
    try {
      return localStorage.getItem('td_admin_mode') === 'true';
    } catch {
      return false;
    }
  })();

  public static isAdminMode(): boolean {
    return this.adminMode;
  }

  public static setAdminMode(enabled: boolean): void {
    this.adminMode = enabled;
    try {
      localStorage.setItem('td_admin_mode', enabled ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  public static toggleAdminMode(): boolean {
    this.setAdminMode(!this.adminMode);
    return this.adminMode;
  }

  public static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const data: SaveData = {
          ...DEFAULT_SAVE,
          ...parsed,
          activeSkin: parsed.activeSkin || 'default',
          unlockedSkins: parsed.unlockedSkins && parsed.unlockedSkins.length > 0 ? parsed.unlockedSkins : ['default'],
          unlockedTowers: parsed.unlockedTowers && parsed.unlockedTowers.length > 0 ? Array.from(new Set([...DEFAULT_UNLOCKED_TOWERS, ...parsed.unlockedTowers])) : [...DEFAULT_UNLOCKED_TOWERS],
          activeTowerDeck: (parsed.activeTowerDeck && Array.isArray(parsed.activeTowerDeck) && parsed.activeTowerDeck.length > 0)
            ? parsed.activeTowerDeck.slice(0, 6)
            : [...DEFAULT_UNLOCKED_TOWERS],
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
        (['witch_forest', 'goblin_caves', 'dead_mountain', 'dungeon'] as WorldId[]).forEach((wId) => {
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
    if (this.adminMode) {
      return 9999999999;
    }
    return this.data.crystals;
  }

  public static addCrystals(amount: number): void {
    this.data.crystals += amount;
    this.save();
  }

  public static spendCrystals(amount: number): boolean {
    if (this.adminMode) {
      return true;
    }
    if (this.data.crystals >= amount) {
      this.data.crystals -= amount;
      this.save();
      return true;
    }
    return false;
  }

  public static isTowerUnlocked(towerType: TowerType): boolean {
    if (this.adminMode) return true;
    if (DEFAULT_UNLOCKED_TOWERS.includes(towerType)) return true;
    const list = (this.data.unlockedTowers || DEFAULT_UNLOCKED_TOWERS) as TowerType[];
    return list.includes(towerType);
  }

  public static unlockTower(towerType: TowerType, cost: number): boolean {
    if (this.isTowerUnlocked(towerType)) return true;
    if (this.spendCrystals(cost)) {
      if (!this.data.unlockedTowers) {
        this.data.unlockedTowers = [...DEFAULT_UNLOCKED_TOWERS];
      }
      if (!this.data.unlockedTowers.includes(towerType)) {
        this.data.unlockedTowers.push(towerType);
      }
      this.save();
      return true;
    }
    return false;
  }

  public static getUnlockedTowers(): TowerType[] {
    if (this.adminMode) {
      return [...DEFAULT_UNLOCKED_TOWERS, ...(Object.keys(TOWER_UNLOCK_COSTS) as TowerType[])];
    }
    return (this.data.unlockedTowers || [...DEFAULT_UNLOCKED_TOWERS]) as TowerType[];
  }

  // =========================================================================
  // 6ER-TURM-DECK (EINSATZ-LOADOUT FÜR GEFECHTE)
  // =========================================================================
  public static getActiveTowerDeck(): TowerType[] {
    if (!this.data.activeTowerDeck || !Array.isArray(this.data.activeTowerDeck) || this.data.activeTowerDeck.length === 0) {
      this.data.activeTowerDeck = [...DEFAULT_UNLOCKED_TOWERS];
    }
    const unlocked = this.getUnlockedTowers();
    const valid = this.data.activeTowerDeck.filter((t) => unlocked.includes(t));
    if (valid.length === 0) {
      this.data.activeTowerDeck = [...DEFAULT_UNLOCKED_TOWERS];
    } else {
      this.data.activeTowerDeck = valid.slice(0, 6);
    }
    return this.data.activeTowerDeck;
  }

  public static isTowerInDeck(towerType: TowerType): boolean {
    return this.getActiveTowerDeck().includes(towerType);
  }

  public static toggleTowerInDeck(towerType: TowerType): { success: boolean; action: 'added' | 'removed' | 'full' } {
    const deck = [...this.getActiveTowerDeck()];
    const index = deck.indexOf(towerType);
    if (index >= 0) {
      if (deck.length <= 1) {
        return { success: false, action: 'removed' };
      }
      deck.splice(index, 1);
      this.data.activeTowerDeck = deck;
      this.save();
      return { success: true, action: 'removed' };
    } else {
      if (deck.length >= 6) {
        return { success: false, action: 'full' };
      }
      deck.push(towerType);
      this.data.activeTowerDeck = deck;
      this.save();
      return { success: true, action: 'added' };
    }
  }

  public static swapTowerInDeck(slotIndex: number, newType: TowerType): boolean {
    const deck = [...this.getActiveTowerDeck()];
    if (slotIndex >= 0 && slotIndex < 6 && this.isTowerUnlocked(newType)) {
      // Wenn der Turm schon an anderer Stelle im Deck ist, tauschen
      const existingIdx = deck.indexOf(newType);
      if (existingIdx >= 0) {
        deck[existingIdx] = deck[slotIndex];
      }
      deck[slotIndex] = newType;
      this.data.activeTowerDeck = deck;
      this.save();
      return true;
    }
    return false;
  }

  public static setTowerDeck(deck: TowerType[]): void {
    if (deck.length > 0 && deck.length <= 6) {
      this.data.activeTowerDeck = [...deck];
      this.save();
    }
  }

  public static isWorldUnlocked(worldId: WorldId): boolean {
    if (this.adminMode) return true;
    if (worldId === 'witch_forest') return true;
    if (worldId === 'goblin_caves') {
      return (this.data.worlds.witch_forest.completedMissions || 0) >= 15;
    }
    if (worldId === 'dead_mountain') {
      return (this.data.worlds.goblin_caves.completedMissions || 0) >= 15;
    }
    if (worldId === 'dungeon') {
      return this.isDungeonUnlocked();
    }
    return false;
  }

  public static isDungeonUnlocked(): boolean {
    if (this.adminMode) return true;
    if (this.data.dungeonUnlocked) return true;
    const dm = this.data.worlds.dead_mountain;
    return !!dm && Number(dm.completedMissions || 0) >= 15;
  }

  public static isMissionUnlocked(worldId: WorldId, missionNum: number): boolean {
    if (this.adminMode) return true;
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

    // Nach 15 Missionen jeweils die nächste Welt oder Dungeon freischalten
    if (worldId === 'witch_forest' && world.completedMissions >= 15) {
      this.data.worlds.goblin_caves.unlocked = true;
    } else if (worldId === 'goblin_caves' && world.completedMissions >= 15) {
      this.data.worlds.dead_mountain.unlocked = true;
    } else if (worldId === 'dead_mountain' && world.completedMissions >= 15) {
      this.data.dungeonUnlocked = true;
    }

    this.save();
  }

  public static getDungeonHighScore(): number {
    return this.data.dungeonHighScore || 0;
  }

  public static getDungeonMaxWave(): number {
    return this.data.dungeonMaxWave || 0;
  }

  public static completeDungeon(score: number): void {
    this.data.crystals += 1000;
    this.data.totalScore += score;
    this.data.dungeonMaxWave = 30;
    if (score > (this.data.dungeonHighScore || 0)) {
      this.data.dungeonHighScore = score;
    }
    this.save();
  }

  public static saveDungeonResult(wave: number, score: number): { isNewWaveRecord: boolean; isNewScoreRecord: boolean } {
    let isNewWaveRecord = false;
    let isNewScoreRecord = false;

    if (wave > (this.data.dungeonMaxWave || 0)) {
      this.data.dungeonMaxWave = wave;
      isNewWaveRecord = true;
    }

    if (score > (this.data.dungeonHighScore || 0)) {
      this.data.dungeonHighScore = score;
      isNewScoreRecord = true;
    }

    this.data.totalScore += score;
    this.data.crystals += Math.max(15, wave * 20);
    this.save();
    return { isNewWaveRecord, isNewScoreRecord };
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
      damageMult: 1.0 + up.damage * 0.16,
      frequencyMult: 1.0 + up.frequency * 0.12,
      rangeMult: 1.0 + up.range * 0.10,
      speedMult: 1.0 + up.speed * 0.16
    };
  }

  public static getEndlessHighScore(): number {
    return this.data.endlessHighScore || 0;
  }

  public static getEndlessMaxWave(): number {
    return this.data.endlessMaxWave || 0;
  }

  public static saveEndlessResult(wave: number, score: number): { isNewWaveRecord: boolean; isNewScoreRecord: boolean } {
    let isNewWaveRecord = false;
    let isNewScoreRecord = false;

    if (wave > (this.data.endlessMaxWave || 0)) {
      this.data.endlessMaxWave = wave;
      isNewWaveRecord = true;
    }

    if (score > (this.data.endlessHighScore || 0)) {
      this.data.endlessHighScore = score;
      isNewScoreRecord = true;
    }

    this.save();
    return { isNewWaveRecord, isNewScoreRecord };
  }

  // --- TURM-SKIN MANAGEMENT ---
  public static getActiveSkin(): TowerSkinId {
    return this.data.activeSkin || 'default';
  }

  public static getUnlockedSkins(): TowerSkinId[] {
    if (!this.data.unlockedSkins || this.data.unlockedSkins.length === 0) {
      this.data.unlockedSkins = ['default'];
    }
    return this.data.unlockedSkins;
  }

  public static isSkinUnlocked(skinId: TowerSkinId): boolean {
    if (this.adminMode || skinId === 'default') return true;
    return this.getUnlockedSkins().includes(skinId);
  }

  public static unlockSkin(skinId: TowerSkinId, cost: number): boolean {
    if (this.isSkinUnlocked(skinId)) return true;
    if (this.data.crystals >= cost) {
      this.data.crystals -= cost;
      if (!this.data.unlockedSkins) this.data.unlockedSkins = ['default'];
      if (!this.data.unlockedSkins.includes(skinId)) {
        this.data.unlockedSkins.push(skinId);
      }
      this.data.activeSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  public static setActiveSkin(skinId: TowerSkinId): boolean {
    if (this.isSkinUnlocked(skinId)) {
      this.data.activeSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }
}
