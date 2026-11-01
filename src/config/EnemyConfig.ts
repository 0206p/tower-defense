export type EnemyType = 'goblin' | 'orc' | 'bat' | 'golem' | 'boss';

export interface EnemyDefinition {
  type: EnemyType;
  name: string;
  maxHp: number;
  speed: number; // pixels per second along path
  rewardGold: number;
  score: number;
  spriteKey: string;
  radius: number;
  damageToPlayer: number;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyDefinition> = {
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
    speed: 110,
    rewardGold: 16,
    score: 65,
    spriteKey: 'enemy_bat',
    radius: 12,
    damageToPlayer: 1
  },
  orc: {
    type: 'orc',
    name: 'Ork-Krieger',
    maxHp: 110,
    speed: 52,
    rewardGold: 26,
    score: 110,
    spriteKey: 'enemy_orc',
    radius: 16,
    damageToPlayer: 1
  },
  golem: {
    type: 'golem',
    name: 'Fels-Golem',
    maxHp: 320,
    speed: 35,
    rewardGold: 55,
    score: 240,
    spriteKey: 'enemy_golem',
    radius: 18,
    damageToPlayer: 2
  },
  boss: {
    type: 'boss',
    name: 'Dunkler Minotaurus',
    maxHp: 1100,
    speed: 38,
    rewardGold: 220,
    score: 1000,
    spriteKey: 'enemy_boss',
    radius: 22,
    damageToPlayer: 5
  }
};

