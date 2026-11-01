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
    maxHp: 45,
    speed: 70,
    rewardGold: 14,
    score: 50,
    spriteKey: 'enemy_goblin',
    radius: 14,
    damageToPlayer: 1
  },
  bat: {
    type: 'bat',
    name: 'Nachtschwinge',
    maxHp: 32,
    speed: 115,
    rewardGold: 16,
    score: 65,
    spriteKey: 'enemy_bat',
    radius: 12,
    damageToPlayer: 1
  },
  witch: {
    type: 'witch',
    name: 'Sumpf-Hexe',
    maxHp: 85,
    speed: 80,
    rewardGold: 28,
    score: 130,
    spriteKey: 'enemy_witch',
    radius: 15,
    damageToPlayer: 1
  },
  slime: {
    type: 'slime',
    name: 'Gift-Schleim',
    maxHp: 160,
    speed: 45,
    rewardGold: 34,
    score: 150,
    spriteKey: 'enemy_slime',
    radius: 16,
    damageToPlayer: 1
  },
  swamp_troll: {
    type: 'swamp_troll',
    name: 'Sumpftroll',
    maxHp: 380,
    speed: 40,
    rewardGold: 60,
    score: 280,
    spriteKey: 'enemy_swamp_troll',
    radius: 19,
    damageToPlayer: 2
  },

  // --- Goblinhöhlen ---
  cave_goblin: {
    type: 'cave_goblin',
    name: 'Minen-Goblin',
    maxHp: 90,
    speed: 95,
    rewardGold: 22,
    score: 90,
    spriteKey: 'enemy_cave_goblin',
    radius: 14,
    damageToPlayer: 1
  },
  bomber: {
    type: 'bomber',
    name: 'Goblin-Bomber',
    maxHp: 75,
    speed: 105,
    rewardGold: 30,
    score: 120,
    spriteKey: 'enemy_bomber',
    radius: 13,
    damageToPlayer: 2
  },
  orc: {
    type: 'orc',
    name: 'Ork-Krieger',
    maxHp: 170,
    speed: 60,
    rewardGold: 35,
    score: 160,
    spriteKey: 'enemy_orc',
    radius: 16,
    damageToPlayer: 1
  },
  armored_troll: {
    type: 'armored_troll',
    name: 'Panzer-Troll',
    maxHp: 520,
    speed: 42,
    rewardGold: 85,
    score: 420,
    spriteKey: 'enemy_armored_troll',
    radius: 20,
    damageToPlayer: 2
  },
  golem: {
    type: 'golem',
    name: 'Kristall-Golem',
    maxHp: 780,
    speed: 36,
    rewardGold: 110,
    score: 550,
    spriteKey: 'enemy_golem',
    radius: 20,
    damageToPlayer: 3
  },

  // --- Der Tote Berg ---
  fire_imp: {
    type: 'fire_imp',
    name: 'Feuer-Imp',
    maxHp: 140,
    speed: 130,
    rewardGold: 35,
    score: 180,
    spriteKey: 'enemy_fire_imp',
    radius: 13,
    damageToPlayer: 1
  },
  magma_orc: {
    type: 'magma_orc',
    name: 'Magma-Berserker',
    maxHp: 360,
    speed: 75,
    rewardGold: 55,
    score: 300,
    spriteKey: 'enemy_magma_orc',
    radius: 17,
    damageToPlayer: 2
  },
  hellhound: {
    type: 'hellhound',
    name: 'Höllenhund',
    maxHp: 280,
    speed: 120,
    rewardGold: 60,
    score: 340,
    spriteKey: 'enemy_hellhound',
    radius: 15,
    damageToPlayer: 2
  },
  lava_golem: {
    type: 'lava_golem',
    name: 'Obsidian-Koloss',
    maxHp: 1200,
    speed: 32,
    rewardGold: 160,
    score: 750,
    spriteKey: 'enemy_lava_golem',
    radius: 23,
    damageToPlayer: 4
  },

  // Boss
  boss: {
    type: 'boss',
    name: 'Titan der Zerstörung',
    maxHp: 2400,
    speed: 38,
    rewardGold: 350,
    score: 2000,
    spriteKey: 'enemy_boss',
    radius: 24,
    damageToPlayer: 10
  }
};
