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
    name: 'Die Hexenwelt',
    subtitle: 'Verwunschener Sumpf & Hexenwald',
    difficulty: 'NORMAL',
    difficultyColor: '#5cd670',
    themeColor: 0x4a296b,
    textColor: '#c586fa',
    bgHex: '#1b1226',
    description: 'Dichte Nebelwälder voller giftiger Pilze, fliegender Hexen und scheuer Schattenwesen.',
    totalMissions: 30,
    unlockedByDefault: true,
    enemyPool: ['goblin', 'bat', 'witch', 'slime', 'swamp_troll'],
    bossKey: 'boss_witch'
  },
  goblin_caves: {
    id: 'goblin_caves',
    name: 'Die Goblinhöhlen',
    subtitle: 'Unterirdische Minen & Kavernen',
    difficulty: 'SCHWER',
    difficultyColor: '#ffd13b',
    themeColor: 0x6e461f,
    textColor: '#ffb347',
    bgHex: '#1a1410',
    description: 'Tiefste Schächte der Goblin-Horde mit Fackeln, Sprengmeistern und Höhlenschlägern.',
    totalMissions: 30,
    unlockedByDefault: false,
    enemyPool: ['cave_goblin', 'bomber', 'orc', 'armored_troll', 'golem'],
    bossKey: 'boss_goblin_king'
  },
  dead_mountain: {
    id: 'dead_mountain',
    name: 'Der Tote Berg',
    subtitle: 'Gross, Rot & Gnadenlos',
    difficulty: 'EXTREM',
    difficultyColor: '#ff3344',
    themeColor: 0x8a1c1c,
    textColor: '#ff6b6b',
    bgHex: '#240a0a',
    description: 'Brennender Obsidian und fließende Magma. Die Heimat uralter Dämonen und Lavagolems.',
    totalMissions: 30,
    unlockedByDefault: false,
    enemyPool: ['fire_imp', 'magma_orc', 'lava_golem', 'fire_drake', 'hellhound'],
    bossKey: 'boss_mountain_titan'
  },
  dungeon: {
    id: 'dungeon',
    name: 'Das Dungeon-Gewölbe',
    subtitle: 'Katakomben der Verdammnis',
    difficulty: 'MYTHISCH',
    difficultyColor: '#a855f7',
    themeColor: 0x3b1d60,
    textColor: '#d8b4fe',
    bgHex: '#0c0714',
    description: 'Uralte unterirdische Hallen. Finsteres Mauerwerk, Runenfallen und 30 gnadenlose Kammern.',
    totalMissions: 30,
    unlockedByDefault: false,
    enemyPool: ['cave_goblin', 'bomber', 'orc', 'witch', 'armored_troll', 'golem', 'magma_orc', 'lava_golem', 'boss'],
    bossKey: 'boss_dungeon_overlord'
  }
};

