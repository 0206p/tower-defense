export type EnemyType =
  | 'goblin'
  | 'bat'
  | 'witch'
  | 'slime'
  | 'swamp_troll'
  | 'cave_goblin'
  | 'bomber'
  | 'orc'
  | 'armored_troll'
  | 'golem'
  | 'fire_imp'
  | 'magma_orc'
  | 'lava_golem'
  | 'hellhound'
  | 'boss';

export interface EnemyDefinition {
  type: EnemyType;
  name: string;
  maxHp: number;
  speed: number;
  rewardGold: number;
  score: number;
  spriteKey: string;
  radius: number;
  damageToPlayer: number;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyDefinition> = {
  // --- Hexenwelt ---
  goblin: {
    type: 'goblin',
    name: 'Wald-Goblin',
    maxHp: 32,
    speed: 72,
    rewardGold: 14,
    score: 50,
    spriteKey: 'enemy_goblin',
    radius: 14,
    damageToPlayer: 1
  },
  bat: {
    type: 'bat',
    name: 'Nachtschwinge',
    maxHp: 20,
    speed: 105,
    rewardGold: 16,
    score: 65,
    spriteKey: 'enemy_bat',
    radius: 12,
    damageToPlayer: 1
  },
  witch: {
    type: 'witch',
    name: 'Sumpf-Hexe',
    maxHp: 60,
    speed: 76,
    rewardGold: 26,
    score: 120,
    spriteKey: 'enemy_witch',
    radius: 15,
    damageToPlayer: 1
  },
  slime: {
    type: 'slime',
    name: 'Gift-Schleim',
    maxHp: 100,
    speed: 46,
    rewardGold: 32,
    score: 150,
    spriteKey: 'enemy_slime',
    radius: 16,
    damageToPlayer: 1
  },
  swamp_troll: {
    type: 'swamp_troll',
    name: 'Sumpftroll',
    maxHp: 200,
    speed: 38,
    rewardGold: 55,
    score: 260,
    spriteKey: 'enemy_swamp_troll',
    radius: 19,
    damageToPlayer: 2
  },

  // --- Goblinhöhlen ---
  cave_goblin: {
    type: 'cave_goblin',
    name: 'Minen-Goblin',
    maxHp: 52,
    speed: 92,
    rewardGold: 20,
    score: 85,
    spriteKey: 'enemy_cave_goblin',
    radius: 14,
    damageToPlayer: 1
  },
  bomber: {
    type: 'bomber',
    name: 'Goblin-Bomber',
    maxHp: 48,
    speed: 102,
    rewardGold: 26,
    score: 110,
    spriteKey: 'enemy_bomber',
    radius: 13,
    damageToPlayer: 2
  },
  orc: {
    type: 'orc',
    name: 'Ork-Krieger',
    maxHp: 125,
    speed: 58,
    rewardGold: 32,
    score: 150,
    spriteKey: 'enemy_orc',
    radius: 16,
    damageToPlayer: 1
  },
  armored_troll: {
    type: 'armored_troll',
    name: 'Panzer-Troll',
    maxHp: 290,
    speed: 40,
    rewardGold: 68,
    score: 360,
    spriteKey: 'enemy_armored_troll',
    radius: 20,
    damageToPlayer: 2
  },
  golem: {
    type: 'golem',
    name: 'Kristall-Golem',
    maxHp: 440,
    speed: 34,
    rewardGold: 95,
    score: 480,
    spriteKey: 'enemy_golem',
    radius: 20,
    damageToPlayer: 3
  },

  // --- Der Tote Berg ---
  fire_imp: {
    type: 'fire_imp',
    name: 'Feuer-Imp',
    maxHp: 75,
    speed: 125,
    rewardGold: 28,
    score: 140,
    spriteKey: 'enemy_fire_imp',
    radius: 13,
    damageToPlayer: 1
  },
  magma_orc: {
    type: 'magma_orc',
    name: 'Magma-Berserker',
    maxHp: 195,
    speed: 72,
    rewardGold: 48,
    score: 250,
    spriteKey: 'enemy_magma_orc',
    radius: 17,
    damageToPlayer: 2
  },
  hellhound: {
    type: 'hellhound',
    name: 'Höllenhund',
    maxHp: 160,
    speed: 115,
    rewardGold: 50,
    score: 280,
    spriteKey: 'enemy_hellhound',
    radius: 15,
    damageToPlayer: 2
  },
  lava_golem: {
    type: 'lava_golem',
    name: 'Obsidian-Koloss',
    maxHp: 580,
    speed: 30,
    rewardGold: 130,
    score: 600,
    spriteKey: 'enemy_lava_golem',
    radius: 23,
    damageToPlayer: 4
  },

  // Boss
  boss: {
    type: 'boss',
    name: 'Titan der Zerstörung',
    maxHp: 1450,
    speed: 36,
    rewardGold: 300,
    score: 1500,
    spriteKey: 'enemy_boss',
    radius: 24,
    damageToPlayer: 10
  }
};
