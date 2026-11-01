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
  shield?: number;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyDefinition> = {
  // --- Hexenwelt ---
  goblin: {
    type: 'goblin',
    name: 'Wald-Goblin',
    maxHp: 38,
    speed: 70,
    rewardGold: 5,
    score: 50,
    spriteKey: 'enemy_goblin',
    radius: 14,
    damageToPlayer: 1
  },
  bat: {
    type: 'bat',
    name: 'Nachtschwinge',
    maxHp: 24,
    speed: 105,
    rewardGold: 5,
    score: 65,
    spriteKey: 'enemy_bat',
    radius: 12,
    damageToPlayer: 1
  },
  witch: {
    type: 'witch',
    name: 'Sumpf-Hexe',
    maxHp: 75,
    speed: 74,
    rewardGold: 9,
    score: 120,
    spriteKey: 'enemy_witch',
    radius: 15,
    damageToPlayer: 1
  },
  slime: {
    type: 'slime',
    name: 'Gift-Schleim',
    maxHp: 140,
    speed: 46,
    rewardGold: 12,
    score: 150,
    spriteKey: 'enemy_slime',
    radius: 16,
    damageToPlayer: 1
  },
  swamp_troll: {
    type: 'swamp_troll',
    name: 'Sumpftroll',
    maxHp: 280,
    speed: 38,
    rewardGold: 20,
    score: 260,
    spriteKey: 'enemy_swamp_troll',
    radius: 19,
    damageToPlayer: 2
  },

  // --- Goblinhöhlen ---
  cave_goblin: {
    type: 'cave_goblin',
    name: 'Minen-Goblin',
    maxHp: 46,
    speed: 74,
    rewardGold: 6,
    score: 70,
    spriteKey: 'enemy_cave_goblin',
    radius: 14,
    damageToPlayer: 1
  },
  bomber: {
    type: 'bomber',
    name: 'Goblin-Bomber',
    maxHp: 34,
    speed: 110,
    rewardGold: 8,
    score: 85,
    spriteKey: 'enemy_bomber',
    radius: 13,
    damageToPlayer: 2
  },
  orc: {
    type: 'orc',
    name: 'Ork-Krieger',
    maxHp: 160,
    speed: 52,
    rewardGold: 14,
    score: 180,
    spriteKey: 'enemy_orc',
    radius: 16,
    damageToPlayer: 1
  },
  armored_troll: {
    type: 'armored_troll',
    name: 'Panzer-Troll',
    maxHp: 340,
    speed: 36,
    rewardGold: 24,
    score: 300,
    spriteKey: 'enemy_armored_troll',
    radius: 20,
    damageToPlayer: 2,
    shield: 60
  },
  golem: {
    type: 'golem',
    name: 'Kristall-Golem',
    maxHp: 520,
    speed: 30,
    rewardGold: 32,
    score: 420,
    spriteKey: 'enemy_golem',
    radius: 20,
    damageToPlayer: 3,
    shield: 80
  },

  // --- Der Tote Berg ---
  fire_imp: {
    type: 'fire_imp',
    name: 'Feuer-Imp',
    maxHp: 52,
    speed: 80,
    rewardGold: 7,
    score: 95,
    spriteKey: 'enemy_fire_imp',
    radius: 13,
    damageToPlayer: 1
  },
  magma_orc: {
    type: 'magma_orc',
    name: 'Magma-Berserker',
    maxHp: 190,
    speed: 54,
    rewardGold: 16,
    score: 220,
    spriteKey: 'enemy_magma_orc',
    radius: 17,
    damageToPlayer: 2
  },
  hellhound: {
    type: 'hellhound',
    name: 'Höllenhund',
    maxHp: 44,
    speed: 115,
    rewardGold: 9,
    score: 110,
    spriteKey: 'enemy_hellhound',
    radius: 15,
    damageToPlayer: 2
  },
  lava_golem: {
    type: 'lava_golem',
    name: 'Obsidian-Koloss',
    maxHp: 420,
    speed: 34,
    rewardGold: 30,
    score: 380,
    spriteKey: 'enemy_lava_golem',
    radius: 23,
    damageToPlayer: 4,
    shield: 100
  },

  // Boss
  boss: {
    type: 'boss',
    name: 'Titan der Zerstörung',
    maxHp: 750,
    speed: 32,
    rewardGold: 60,
    score: 800,
    spriteKey: 'enemy_boss',
    radius: 24,
    damageToPlayer: 5,
    shield: 140
  }
};
