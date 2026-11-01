import { WorldId } from '../systems/SaveSystem';

export interface WorldDefinition {
  id: WorldId;
  name: string;
  subtitle: string;
  difficulty: string;
  difficultyColor: string;
  themeColor: number;
  textColor: string;
  bgHex: string;
  description: string;
  totalMissions: number;
  unlockedByDefault: boolean;
  enemyPool: string[];
  bossKey: string;
}

export const WORLDS_CONFIG: Record<WorldId, WorldDefinition> = {
  witch_forest: {
    id: 'witch_forest',
    name: 'XENO-BIOM (ZERUS)',
    subtitle: 'Zergling-Dschungel & Sporen-Nester',
    difficulty: 'NORMAL',
    difficultyColor: '#5cd670',
    themeColor: 0x166534,
    textColor: '#86efac',
    bgHex: '#052e16',
    description: 'Dichter Xeno-Dschungel auf Exoplanet Zerus. Heimat agiler Zergling-Horden, Säurespucker und fliegender Mutalisken.',
    totalMissions: 30,
    unlockedByDefault: true,
    enemyPool: ['goblin', 'bat', 'witch', 'slime', 'swamp_troll'],
    bossKey: 'boss_witch'
  },
  goblin_caves: {
    id: 'goblin_caves',
    name: 'MECH-KOLONIE (KORHAL)',
    subtitle: 'Asteroiden-Schächte & Cyber-Mechs',
    difficulty: 'SCHWER',
    difficultyColor: '#38bdf8',
    themeColor: 0x1e3a8a,
    textColor: '#60a5fa',
    bgHex: '#0c1d37',
    description: 'Tiefste Erzstollen im Asteroidengürtel von Korhal. Maschinelle Mech-Krieger, Baneling-Sprengdrohnen und schwer gepanzerte Goliaths.',
    totalMissions: 30,
    unlockedByDefault: false,
    enemyPool: ['cave_goblin', 'bomber', 'orc', 'armored_troll', 'golem'],
    bossKey: 'boss_goblin_king'
  },
  dead_mountain: {
    id: 'dead_mountain',
    name: 'VULKAN-SEKTOR (CHAR)',
    subtitle: 'Obsidian-Krater & Magma-Titanen',
    difficulty: 'EXTREM',
    difficultyColor: '#ff3344',
    themeColor: 0x881337,
    textColor: '#fda4af',
    bgHex: '#260711',
    description: 'Glühende Schluchten auf dem feindlichen Vulkanplaneten Char. Brutstätte brennender Xeno-Hunde und gigantischer Obsidian-Ultralisken.',
    totalMissions: 30,
    unlockedByDefault: false,
    enemyPool: ['fire_imp', 'magma_orc', 'lava_golem', 'hellhound'],
    bossKey: 'boss_mountain_titan'
  },
  dungeon: {
    id: 'dungeon',
    name: 'PROTOSS-TEMPEL (VOID)',
    subtitle: 'Uralte Kammern der Schatten-Templer',
    difficulty: 'MYTHISCH',
    difficultyColor: '#c084fc',
    themeColor: 0x4c1d95,
    textColor: '#e9d5ff',
    bgHex: '#130826',
    description: 'Vergessene Tempelruinen im Herz der Leere. 30 gnadenlose Kammern voller psionischer Archons, Schattenläufer und des Void-Overlords.',
    totalMissions: 30,
    unlockedByDefault: false,
    enemyPool: ['cave_goblin', 'bomber', 'orc', 'witch', 'armored_troll', 'golem', 'magma_orc', 'lava_golem', 'boss'],
    bossKey: 'boss_dungeon_overlord'
  }
};

