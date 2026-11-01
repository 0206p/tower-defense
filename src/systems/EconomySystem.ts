import { INITIAL_GOLD, INITIAL_LIVES } from '../config/GameConfig';
import { logger } from './GameLogger';

export class EconomySystem {
  private gold: number;
  private lives: number;
  private score: number;
  private onGoldChanged?: (gold: number) => void;
  private onLivesChanged?: (lives: number) => void;
  private onScoreChanged?: (score: number) => void;
  private onGameOver?: () => void;

  constructor(
    callbacks: {
      onGoldChanged?: (gold: number) => void;
      onLivesChanged?: (lives: number) => void;
      onScoreChanged?: (score: number) => void;
      onGameOver?: () => void;
    } = {}
  ) {
    this.gold = INITIAL_GOLD;
    this.lives = INITIAL_LIVES;
    this.score = 0;
    this.onGoldChanged = callbacks.onGoldChanged;
    this.onLivesChanged = callbacks.onLivesChanged;
    this.onScoreChanged = callbacks.onScoreChanged;
    this.onGameOver = callbacks.onGameOver;
    logger.economy('Spielwirtschaft initialisiert', { gold: this.gold, lives: this.lives });
  }

  public getGold(): number {
    return this.gold;
  }

  public getLives(): number {
    return this.lives;
  }

  public getScore(): number {
    return this.score;
  }

  public addGold(amount: number): void {
    this.gold += amount;
    logger.economy(`Gold erhalten: +${amount}`, { neu: this.gold });
    this.onGoldChanged?.(this.gold);
  }

  public spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      logger.economy(`Gold ausgegeben: -${amount}`, { verbleibend: this.gold });
      this.onGoldChanged?.(this.gold);
      return true;
    }
    return false;
  }

  public addScore(amount: number): void {
    this.score += amount;
    this.onScoreChanged?.(this.score);
  }

  public loseLives(amount: number): void {
    this.lives = Math.max(0, this.lives - amount);
    logger.economy(`Leben verloren: -${amount}`, { verbleibend: this.lives });
    this.onLivesChanged?.(this.lives);

    if (this.lives <= 0) {
      logger.warn('System', 'Alle Leben verloren -> Game Over!');
      this.onGameOver?.();
    }
  }

  public canAfford(cost: number): boolean {
    return this.gold >= cost;
  }
}

