export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'COMBAT' | 'ECONOMY' | 'WAVE' | 'TOWER';

export interface LogEntry {
  timestamp: number;
  timeStr: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, any>;
}

export class GameLogger {
  private static instance: GameLogger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 5000;
  private readonly STORAGE_KEY = 'td_game_telemetry_logs';
  private autoSaveTimer: number | null = null;

  private constructor() {
    this.loadFromStorage();
    this.hookGlobalErrors();
    this.exposeGlobalHelpers();
  }

  public static getInstance(): GameLogger {
    if (!GameLogger.instance) {
      GameLogger.instance = new GameLogger();
    }
    return GameLogger.instance;
  }

  public log(level: LogLevel, category: string, message: string, data?: Record<string, any>): void {
    const now = Date.now();
    const d = new Date(now);
    const timeStr = `${d.toTimeString().split(' ')[0]}.${d.getMilliseconds().toString().padStart(3, '0')}`;

    const entry: LogEntry = {
      timestamp: now,
      timeStr,
      level,
      category,
      message,
      data
    };

    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Konsolen-Ausgabe für wichtige Ereignisse
    if (level === 'ERROR' || level === 'WARN') {
      console.warn(`[${timeStr}] [${level}] [${category}] ${message}`, data || '');
    }

    this.scheduleSave();
  }

  public info(category: string, message: string, data?: Record<string, any>): void {
    this.log('INFO', category, message, data);
  }

  public warn(category: string, message: string, data?: Record<string, any>): void {
    this.log('WARN', category, message, data);
  }

  public error(category: string, message: string, data?: Record<string, any>): void {
    this.log('ERROR', category, message, data);
  }

  public combat(message: string, data?: Record<string, any>): void {
    this.log('COMBAT', 'Combat', message, data);
  }

  public wave(message: string, data?: Record<string, any>): void {
    this.log('WAVE', 'WaveSystem', message, data);
  }

  public tower(message: string, data?: Record<string, any>): void {
    this.log('TOWER', 'TowerSystem', message, data);
  }

  public economy(message: string, data?: Record<string, any>): void {
    this.log('ECONOMY', 'Economy', message, data);
  }

  /**
   * Gibt alle Logs der letzten N Minuten zurück (Standard: 15 Minuten)
   */
  public getRecentLogs(minutes: number = 15): LogEntry[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.logs.filter((l) => l.timestamp >= cutoff);
  }

  /**
   * Formatiert die Logs der letzten N Minuten als sauberen Text
   */
  public getFormattedLogs(minutes: number = 15): string {
    const recent = this.getRecentLogs(minutes);
    if (recent.length === 0) {
      return `[GameLogger] Keine Einträge in den letzten ${minutes} Minuten.`;
    }

    let out = `=== TOWER DEFENSE GAME LOGS (Letzte ${minutes} Minuten, ${recent.length} Einträge) ===\n`;
    recent.forEach((e) => {
      const dataStr = e.data ? ` | ${JSON.stringify(e.data)}` : '';
      out += `[${e.timeStr}] [${e.level.padEnd(7)}] [${e.category.padEnd(12)}] ${e.message}${dataStr}\n`;
    });
    out += `=== ENDE LOGS ===\n`;
    return out;
  }

  /**
   * Lädt eine Textdatei der Logs herunter
   */
  public downloadLogs(minutes: number = 30): void {
    const text = this.getFormattedLogs(minutes);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `td_debug_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Statistische Zusammenfassung für Balancing & Fehlersuche
   */
  public getTelemetrySummary(minutes: number = 15): Record<string, any> {
    const recent = this.getRecentLogs(minutes);
    const damageByType: Record<string, number> = {};
    const killsByType: Record<string, number> = {};
    let totalDmg = 0;
    let towersPlaced = 0;
    let towersUpgraded = 0;
    let wavesStarted = 0;
    let livesLost = 0;

    recent.forEach((entry) => {
      if (entry.level === 'COMBAT') {
        if (entry.data?.damage && entry.data?.towerType) {
          damageByType[entry.data.towerType] = (damageByType[entry.data.towerType] || 0) + entry.data.damage;
          totalDmg += entry.data.damage;
        }
        if (entry.data?.killed && entry.data?.enemyType) {
          killsByType[entry.data.enemyType] = (killsByType[entry.data.enemyType] || 0) + 1;
        }
      } else if (entry.level === 'TOWER') {
        if (entry.message.includes('platziert')) towersPlaced++;
        if (entry.message.includes('Upgrade') || entry.message.includes('spezialisiert')) towersUpgraded++;
      } else if (entry.level === 'WAVE' && entry.message.includes('gestartet')) {
        wavesStarted++;
      } else if (entry.level === 'ECONOMY' && entry.message.includes('Leben verloren')) {
        livesLost += entry.data?.amount || 1;
      }
    });

    return {
      timeSpanMinutes: minutes,
      entryCount: recent.length,
      totalDamageDealt: Math.round(totalDmg),
      damageByTowerType: damageByType,
      killsByEnemyType: killsByType,
      towersPlaced,
      towersUpgraded,
      wavesStarted,
      livesLost
    };
  }

  private scheduleSave(): void {
    if (this.autoSaveTimer !== null) return;
    this.autoSaveTimer = window.setTimeout(() => {
      this.autoSaveTimer = null;
      this.saveToStorage();
    }, 4000);
  }

  private saveToStorage(): void {
    try {
      // Nur die letzten 800 Einträge im LocalStorage halten, um Quota nicht zu sprengen
      const saveSlice = this.logs.slice(-800);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveSlice));
    } catch {
      // Quota exceeded ignoriert
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed: LogEntry[] = JSON.parse(data);
        const cutoff = Date.now() - 2 * 60 * 60 * 1000; // max 2 Std alt
        this.logs = parsed.filter((l) => l.timestamp >= cutoff);
        this.log('INFO', 'System', `Geladene Logs aus vorheriger Sitzung: ${this.logs.length} Einträge`);
      }
    } catch {
      this.logs = [];
    }
  }

  private hookGlobalErrors(): void {
    window.addEventListener('error', (evt) => {
      this.error('GlobalError', evt.message, {
        filename: evt.filename,
        lineno: evt.lineno,
        colno: evt.colno
      });
    });

    window.addEventListener('unhandledrejection', (evt) => {
      this.error('PromiseRejection', String(evt.reason));
    });
  }

  private exposeGlobalHelpers(): void {
    const g = window as any;
    g.__GAME_LOGGER__ = this;
    g.getRecentLogs = (minutes: number = 15) => this.getFormattedLogs(minutes);
    g.printRecentLogs = (minutes: number = 15) => console.log(this.getFormattedLogs(minutes));
    g.downloadLogs = (minutes: number = 30) => this.downloadLogs(minutes);
    g.getGameStats = (minutes: number = 15) => this.getTelemetrySummary(minutes);
  }
}

export const logger = GameLogger.getInstance();

