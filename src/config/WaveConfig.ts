import { EnemyType } from './EnemyConfig';

export interface WaveSpawnItem {
  enemyType: EnemyType;
  delayMs: number; // delay before spawning this specific enemy
  hpMultiplier?: number;
}

export interface WaveDefinition {
  waveNumber: number;
  name: string;
  announcement: string;
  spawns: WaveSpawnItem[];
}

export const WAVES_CONFIG: WaveDefinition[] = [
  // Welle 1: Kundschafter-Vorhut
  {
    waveNumber: 1,
    name: 'Goblin-Späher',
    announcement: 'Welle 1: Eine Vorhut aus schnellen Goblins nähert sich!',
    spawns: Array.from({ length: 8 }, () => ({
      enemyType: 'goblin' as EnemyType,
      delayMs: 1100
    }))
  },
  // Welle 2: Fledermäuse & Goblins
  {
    waveNumber: 2,
    name: 'Flatternde Schatten',
    announcement: 'Welle 2: Fledermäuse verstärken die Goblin-Streitmacht!',
    spawns: [
      { enemyType: 'goblin', delayMs: 1000 },
      { enemyType: 'goblin', delayMs: 800 },
      { enemyType: 'bat', delayMs: 700 },
      { enemyType: 'goblin', delayMs: 700 },
      { enemyType: 'bat', delayMs: 600 },
      { enemyType: 'bat', delayMs: 700 },
      { enemyType: 'goblin', delayMs: 800 },
      { enemyType: 'goblin', delayMs: 800 },
      { enemyType: 'bat', delayMs: 700 },
      { enemyType: 'goblin', delayMs: 800 }
    ]
  },
  // Welle 3: Ork-Vorhut
  {
    waveNumber: 3,
    name: 'Ork-Garde',
    announcement: 'Welle 3: Gepanzerte Ork-Krieger rücken vor!',
    spawns: Array.from({ length: 8 }, () => ({
      enemyType: 'orc' as EnemyType,
      delayMs: 1200
    }))
  },
  // Welle 4: Luftangriff
  {
    waveNumber: 4,
    name: 'Schwarm-Alarm',
    announcement: 'Welle 4: Ein ganzer Schwarm schneller Fledermäuse!',
    spawns: Array.from({ length: 14 }, () => ({
      enemyType: 'bat' as EnemyType,
      delayMs: 650
    }))
  },
  // Welle 5: Erste Kolosse
  {
    waveNumber: 5,
    name: 'Felsbrecher',
    announcement: 'Welle 5: Achtung! Ein massiver Fels-Golem führt die Truppe an!',
    spawns: [
      { enemyType: 'golem', delayMs: 1500 },
      { enemyType: 'orc', delayMs: 900 },
      { enemyType: 'orc', delayMs: 900 },
      { enemyType: 'goblin', delayMs: 700 },
      { enemyType: 'goblin', delayMs: 700 },
      { enemyType: 'goblin', delayMs: 700 },
      { enemyType: 'golem', delayMs: 1400 },
      { enemyType: 'orc', delayMs: 900 },
      { enemyType: 'orc', delayMs: 900 }
    ]
  },
  // Welle 6: Gemischter Sturm
  {
    waveNumber: 6,
    name: 'Zangenangriff',
    announcement: 'Welle 6: Schnelle Schwärme und zähe Orks greifen an!',
    spawns: [
      { enemyType: 'orc', delayMs: 1000 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'orc', delayMs: 900 },
      { enemyType: 'orc', delayMs: 900 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'orc', delayMs: 900 },
      { enemyType: 'golem', delayMs: 1200 },
      { enemyType: 'orc', delayMs: 800 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'orc', delayMs: 800 }
    ]
  },
  // Welle 7: Golem-Parade
  {
    waveNumber: 7,
    name: 'Steinlawine',
    announcement: 'Welle 7: Vier Fels-Golems rollen unaufhaltsam vorwärts!',
    spawns: [
      { enemyType: 'golem', delayMs: 1400 },
      { enemyType: 'orc', delayMs: 800 },
      { enemyType: 'golem', delayMs: 1300 },
      { enemyType: 'orc', delayMs: 800 },
      { enemyType: 'golem', delayMs: 1300 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'golem', delayMs: 1400 },
      { enemyType: 'orc', delayMs: 800 },
      { enemyType: 'orc', delayMs: 800 }
    ]
  },
  // Welle 8: Sturmlauf
  {
    waveNumber: 8,
    name: 'Wilde Raserei',
    announcement: 'Welle 8: Große Verbände aller Kreaturen!',
    spawns: [
      { enemyType: 'bat', delayMs: 400 },
      { enemyType: 'bat', delayMs: 400 },
      { enemyType: 'bat', delayMs: 400 },
      { enemyType: 'orc', delayMs: 800 },
      { enemyType: 'orc', delayMs: 800 },
      { enemyType: 'golem', delayMs: 1100, hpMultiplier: 1.2 },
      { enemyType: 'golem', delayMs: 1100, hpMultiplier: 1.2 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'orc', delayMs: 700 },
      { enemyType: 'orc', delayMs: 700 },
      { enemyType: 'golem', delayMs: 1200, hpMultiplier: 1.2 }
    ]
  },
  // Welle 9: Elite-Invasion
  {
    waveNumber: 9,
    name: 'Der Eiserne Wall',
    announcement: 'Welle 9: Letzte Vorhut der Vernichtung! Rüste deine Türme auf!',
    spawns: [
      { enemyType: 'golem', delayMs: 1000, hpMultiplier: 1.3 },
      { enemyType: 'orc', delayMs: 700, hpMultiplier: 1.2 },
      { enemyType: 'orc', delayMs: 700, hpMultiplier: 1.2 },
      { enemyType: 'golem', delayMs: 900, hpMultiplier: 1.3 },
      { enemyType: 'bat', delayMs: 450, hpMultiplier: 1.2 },
      { enemyType: 'bat', delayMs: 450, hpMultiplier: 1.2 },
      { enemyType: 'golem', delayMs: 900, hpMultiplier: 1.3 },
      { enemyType: 'orc', delayMs: 650, hpMultiplier: 1.2 },
      { enemyType: 'golem', delayMs: 900, hpMultiplier: 1.4 },
      { enemyType: 'orc', delayMs: 650, hpMultiplier: 1.2 },
      { enemyType: 'golem', delayMs: 900, hpMultiplier: 1.4 }
    ]
  },
  // Welle 10: Bosskampf
  {
    waveNumber: 10,
    name: 'Dunkler Minotaurus',
    announcement: 'FINAL WELLE 10: Der Dunkle Minotaurus betritt das Schlachtfeld!',
    spawns: [
      { enemyType: 'orc', delayMs: 1000, hpMultiplier: 1.2 },
      { enemyType: 'orc', delayMs: 800, hpMultiplier: 1.2 },
      { enemyType: 'boss', delayMs: 1500 },
      { enemyType: 'bat', delayMs: 600 },
      { enemyType: 'bat', delayMs: 600 },
      { enemyType: 'golem', delayMs: 1200, hpMultiplier: 1.3 },
      { enemyType: 'orc', delayMs: 800 },
      { enemyType: 'golem', delayMs: 1200, hpMultiplier: 1.3 },
      { enemyType: 'bat', delayMs: 500 },
      { enemyType: 'bat', delayMs: 500 }
    ]
  }
];

