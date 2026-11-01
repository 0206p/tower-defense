import { TowerType } from '../config/TowerConfig';
import { logger } from './GameLogger';

export interface TowerBalancingData {
  towerType: TowerType;
  towersBuilt: number;
  totalInvestedGold: number;
  totalDamageDealt: number;
  hitCount: number;
  critCount: number;
  kills: number;
}

export interface EnemyBalancingData {
  enemyType: string;
  spawned: number;
  killed: number;
  leaked: number;
  totalDamageTaken: number;
  avgDeathProgress: number; // 0.0 - 1.0 (z.B. 0.35 = 35% des Pfads)
  avgTimeToKillMs: number;
  deathProgressList: number[];
  timeToKillList: number[];
}

export interface WaveBalancingSummary {
  waveNumber: number;
  worldId: string;
  isEndless: boolean;
  startTime: number;
  endTime: number;
  durationMs: number;
  totalWaveDamage: number;
  totalGoldInvested: number;
  towerBreakdown: Record<TowerType, {
    damageDealt: number;
    damageSharePercent: number;
    investedGold: number;
    damagePerGold: number;
    hits: number;
    crits: number;
    kills: number;
  }>;
  enemyBreakdown: Record<string, {
    spawned: number;
    killed: number;
    leaked: number;
    avgDeathProgressPercent: number;
    avgTimeToKillSeconds: number;
  }>;
  alerts: string[];
  recommendations: string[];
}

export const ALL_TOWER_TYPES: TowerType[] = [
  'archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper',
  'flamethrower', 'plasma_pylon', 'orbital_laser', 'chrono_disruptor', 'bio_hive'
];

export class BalancingTelemetry {
  private static instance: BalancingTelemetry;

  private currentWaveNumber: number = 0;
  private currentWorldId: string = 'witch_forest';
  private currentIsEndless: boolean = false;
  private waveStartTime: number = 0;

  // Laufende Investitionen
  private investedGoldByTower: Record<TowerType, number> = {
    archer: 0,
    cannon: 0,
    ice: 0,
    poison: 0,
    tesla: 0,
    sniper: 0,
    flamethrower: 0,
    plasma_pylon: 0,
    orbital_laser: 0,
    chrono_disruptor: 0,
    bio_hive: 0
  };
  private countByTower: Record<TowerType, number> = {
    archer: 0,
    cannon: 0,
    ice: 0,
    poison: 0,
    tesla: 0,
    sniper: 0,
    flamethrower: 0,
    plasma_pylon: 0,
    orbital_laser: 0,
    chrono_disruptor: 0,
    bio_hive: 0
  };

  // Aktuelle Welle
  private waveDamageByTower: Record<TowerType, number> = {
    archer: 0,
    cannon: 0,
    ice: 0,
    poison: 0,
    tesla: 0,
    sniper: 0,
    flamethrower: 0,
    plasma_pylon: 0,
    orbital_laser: 0,
    chrono_disruptor: 0,
    bio_hive: 0
  };
  private waveHitsByTower: Record<TowerType, number> = {
    archer: 0,
    cannon: 0,
    ice: 0,
    poison: 0,
    tesla: 0,
    sniper: 0,
    flamethrower: 0,
    plasma_pylon: 0,
    orbital_laser: 0,
    chrono_disruptor: 0,
    bio_hive: 0
  };
  private waveCritsByTower: Record<TowerType, number> = {
    archer: 0,
    cannon: 0,
    ice: 0,
    poison: 0,
    tesla: 0,
    sniper: 0,
    flamethrower: 0,
    plasma_pylon: 0,
    orbital_laser: 0,
    chrono_disruptor: 0,
    bio_hive: 0
  };
  private waveKillsByTower: Record<TowerType, number> = {
    archer: 0,
    cannon: 0,
    ice: 0,
    poison: 0,
    tesla: 0,
    sniper: 0,
    flamethrower: 0,
    plasma_pylon: 0,
    orbital_laser: 0,
    chrono_disruptor: 0,
    bio_hive: 0
  };

  private waveEnemyData: Map<string, {
    spawned: number;
    killed: number;
    leaked: number;
    damageTaken: number;
    deathPositions: number[];
    survivalTimes: number[];
  }> = new Map();

  // Historie der letzten Wellen
  private waveHistory: WaveBalancingSummary[] = [];

  private constructor() {
    this.exposeGlobalHelpers();
  }

  public static getInstance(): BalancingTelemetry {
    if (!BalancingTelemetry.instance) {
      BalancingTelemetry.instance = new BalancingTelemetry();
    }
    return BalancingTelemetry.instance;
  }

  public resetAll(): void {
    ALL_TOWER_TYPES.forEach((t) => {
      this.investedGoldByTower[t] = 0;
      this.countByTower[t] = 0;
      this.waveDamageByTower[t] = 0;
      this.waveHitsByTower[t] = 0;
      this.waveCritsByTower[t] = 0;
      this.waveKillsByTower[t] = 0;
    });
    this.waveEnemyData.clear();
    this.waveHistory = [];
  }

  public recordTowerBuild(type: TowerType, cost: number): void {
    if (this.investedGoldByTower[type] !== undefined) {
      this.investedGoldByTower[type] += cost;
      this.countByTower[type]++;
    }
  }

  public recordTowerUpgrade(type: TowerType, cost: number): void {
    if (this.investedGoldByTower[type] !== undefined) {
      this.investedGoldByTower[type] += cost;
    }
  }

  public recordTowerSell(type: TowerType, refund: number): void {
    if (this.investedGoldByTower[type] !== undefined) {
      this.investedGoldByTower[type] = Math.max(0, this.investedGoldByTower[type] - refund);
      this.countByTower[type] = Math.max(0, this.countByTower[type] - 1);
    }
  }

  public startWave(waveNum: number, worldId: string, isEndless: boolean): void {
    this.currentWaveNumber = waveNum;
    this.currentWorldId = worldId;
    this.currentIsEndless = isEndless;
    this.waveStartTime = Date.now();

    ALL_TOWER_TYPES.forEach((t) => {
      this.waveDamageByTower[t] = 0;
      this.waveHitsByTower[t] = 0;
      this.waveCritsByTower[t] = 0;
      this.waveKillsByTower[t] = 0;
    });
    this.waveEnemyData.clear();
  }

  public recordDamage(towerType: TowerType, damage: number, isCrit: boolean, enemyType: string): void {
    if (this.waveDamageByTower[towerType] !== undefined) {
      this.waveDamageByTower[towerType] += damage;
      this.waveHitsByTower[towerType]++;
      if (isCrit) {
        this.waveCritsByTower[towerType]++;
      }
    }

    let eData = this.waveEnemyData.get(enemyType);
    if (!eData) {
      eData = { spawned: 0, killed: 0, leaked: 0, damageTaken: 0, deathPositions: [], survivalTimes: [] };
      this.waveEnemyData.set(enemyType, eData);
    }
    eData.damageTaken += damage;
  }

  public recordEnemySpawn(enemyType: string): void {
    let eData = this.waveEnemyData.get(enemyType);
    if (!eData) {
      eData = { spawned: 0, killed: 0, leaked: 0, damageTaken: 0, deathPositions: [], survivalTimes: [] };
      this.waveEnemyData.set(enemyType, eData);
    }
    eData.spawned++;
  }

  public recordEnemyDeath(enemyType: string, pathProgress: number, timeAliveMs: number, killerTowerType?: TowerType): void {
    let eData = this.waveEnemyData.get(enemyType);
    if (!eData) {
      eData = { spawned: 1, killed: 0, leaked: 0, damageTaken: 0, deathPositions: [], survivalTimes: [] };
      this.waveEnemyData.set(enemyType, eData);
    }
    eData.killed++;
    eData.deathPositions.push(Phaser.Math.Clamp(pathProgress, 0, 1));
    eData.survivalTimes.push(timeAliveMs);

    if (killerTowerType && this.waveKillsByTower[killerTowerType] !== undefined) {
      this.waveKillsByTower[killerTowerType]++;
    }
  }

  public recordEnemyLeak(enemyType: string): void {
    let eData = this.waveEnemyData.get(enemyType);
    if (!eData) {
      eData = { spawned: 1, killed: 0, leaked: 0, damageTaken: 0, deathPositions: [], survivalTimes: [] };
      this.waveEnemyData.set(enemyType, eData);
    }
    eData.leaked++;
  }

  public finalizeWave(waveNum: number): WaveBalancingSummary {
    const endTime = Date.now();
    const durationMs = Math.max(1000, endTime - this.waveStartTime);

    let totalWaveDamage = 0;
    ALL_TOWER_TYPES.forEach((t) => {
      totalWaveDamage += this.waveDamageByTower[t];
    });

    let totalInvestedGold = 0;
    ALL_TOWER_TYPES.forEach((t) => {
      totalInvestedGold += this.investedGoldByTower[t];
    });

    const towerBreakdown: any = {};
    const alerts: string[] = [];
    const recommendations: string[] = [];

    // Turm-Analyse
    ALL_TOWER_TYPES.forEach((t) => {
      const dmg = Math.round(this.waveDamageByTower[t]);
      const invested = this.investedGoldByTower[t];
      const count = this.countByTower[t];
      const share = totalWaveDamage > 0 ? (dmg / totalWaveDamage) * 100 : 0;
      const dmgPerGold = invested > 0 ? (dmg / invested) : 0;

      towerBreakdown[t] = {
        damageDealt: dmg,
        damageSharePercent: Math.round(share * 10) / 10,
        investedGold: invested,
        damagePerGold: Math.round(dmgPerGold * 10) / 10,
        hits: this.waveHitsByTower[t],
        crits: this.waveCritsByTower[t],
        kills: this.waveKillsByTower[t]
      };

      // Balancing-Warnungen
      if (count > 0 && share > 50 && totalWaveDamage > 100) {
        alerts.push(`🚨 OVERPOWERED: '${t.toUpperCase()}' macht ${Math.round(share)}% des gesamten Wellenschadens!`);
        recommendations.push(`Turm '${t}': Basisschaden oder Kadenz um 10-15% verringern.`);
      }

      if (invested >= 300 && share < 6 && totalWaveDamage > 200) {
        alerts.push(`⚠️ UNDERPOWERED: In '${t.toUpperCase()}' wurden ${invested}G investiert, liefert aber nur ${Math.round(share)}% Schaden.`);
        recommendations.push(`Turm '${t}': Schaden, Reichweite oder Statuseffekte leicht buffen.`);
      }
    });

    // Gegner- und Pfad-Analyse
    const enemyBreakdown: any = {};
    let totalKills = 0;
    let totalLeaks = 0;
    let sumDeathPos = 0;

    this.waveEnemyData.forEach((data, type) => {
      const avgPos = data.deathPositions.length > 0
        ? data.deathPositions.reduce((a, b) => a + b, 0) / data.deathPositions.length
        : 0;
      const avgTtk = data.survivalTimes.length > 0
        ? (data.survivalTimes.reduce((a, b) => a + b, 0) / data.survivalTimes.length) / 1000
        : 0;

      enemyBreakdown[type] = {
        spawned: data.spawned,
        killed: data.killed,
        leaked: data.leaked,
        avgDeathProgressPercent: Math.round(avgPos * 1000) / 10,
        avgTimeToKillSeconds: Math.round(avgTtk * 10) / 10
      };

      totalKills += data.killed;
      totalLeaks += data.leaked;
      sumDeathPos += avgPos * data.killed;
    });

    const globalAvgDeathProgress = totalKills > 0 ? (sumDeathPos / totalKills) : 0;

    if (totalKills > 0 && globalAvgDeathProgress < 0.25 && totalLeaks === 0) {
      alerts.push(`⚡ STEAMROLL: Gegner sterben im Schnitt bereits nach ${Math.round(globalAvgDeathProgress * 100)}% des Pfades.`);
      recommendations.push(`Welle ${waveNum} ist zu einfach: Gegner-HP um +15% oder Spawntempo anziehen.`);
    } else if (globalAvgDeathProgress > 0.82) {
      alerts.push(`🔥 KNAPPE VERTEIDIGUNG: Gegner sterben erst nach ${Math.round(globalAvgDeathProgress * 100)}% des Pfades nahe der Basis!`);
    }

    if (totalLeaks > 0) {
      alerts.push(`💀 VERLUSTE: ${totalLeaks} Gegner sind durchgebrochen!`);
      recommendations.push(`Prüfe Turmplatzierung oder baue mehr Verlangsamung (Eis/Gift).`);
    }

    const summary: WaveBalancingSummary = {
      waveNumber: waveNum,
      worldId: this.currentWorldId,
      isEndless: this.currentIsEndless,
      startTime: this.waveStartTime,
      endTime,
      durationMs,
      totalWaveDamage: Math.round(totalWaveDamage),
      totalGoldInvested: totalInvestedGold,
      towerBreakdown,
      enemyBreakdown,
      alerts,
      recommendations
    };

    this.waveHistory.push(summary);
    if (this.waveHistory.length > 50) {
      this.waveHistory.shift();
    }

    // In GameLogger speichern
    logger.log('BALANCING', 'BalancingTelemetry', `Welle ${waveNum} Balancing-Report: ${summary.totalWaveDamage} Dmg, ${alerts.length} Warnungen`, {
      wave: waveNum,
      durationSec: Math.round(durationMs / 1000),
      alerts,
      towerBreakdown
    });

    // In Entwickler-Konsole formatiert ausgeben
    this.printWaveConsoleLog(summary);

    return summary;
  }

  private printWaveConsoleLog(s: WaveBalancingSummary): void {
    console.groupCollapsed(`%c[BALANCING LOG] Welle ${s.waveNumber} (${s.isEndless ? 'Endlos' : s.worldId}) - ${s.totalWaveDamage} Gesamtschaden`, 'color: #ffd13b; font-weight: bold;');
    console.table(s.towerBreakdown);
    console.table(s.enemyBreakdown);
    if (s.alerts.length > 0) {
      console.warn('Balancing Warnungen:', s.alerts.join(' | '));
    }
    if (s.recommendations.length > 0) {
      console.info('Balancing Empfehlungen:', s.recommendations.join(' | '));
    }
    console.groupEnd();
  }

  /**
   * Erzeugt einen lesbaren Balancing-Report für die letzten N Minuten
   */
  public getBalancingReport(minutes: number = 15): string {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const waves = this.waveHistory.filter((w) => w.endTime >= cutoff);

    if (waves.length === 0) {
      return `[BALANCING REPORT] Keine abgeschlossenen Wellen in den letzten ${minutes} Minuten aufgezeichnet.\nStarte eine Welle, um automatische Schadens- & Balancing-Metriken zu erhalten.`;
    }

    let out = `========================================================================================\n`;
    out += `          TOWER DEFENSE - BALANCING & DAMAGE REGULATION REPORT (${minutes} MIN)          \n`;
    out += `========================================================================================\n\n`;

    // Gesamtschaden über alle Wellen aggregieren
    const totalDmgByTower: Record<TowerType, number> = {} as Record<TowerType, number>;
    ALL_TOWER_TYPES.forEach((t) => {
      totalDmgByTower[t] = 0;
    });
    let grandTotalDmg = 0;

    waves.forEach((w) => {
      Object.keys(w.towerBreakdown).forEach((t) => {
        const type = t as TowerType;
        const d = w.towerBreakdown[type].damageDealt;
        totalDmgByTower[type] += d;
        grandTotalDmg += d;
      });
    });

    out += `📊 SCHADENSVERTEILUNG DER TÜRME (Letzte ${waves.length} Wellen):\n`;
    out += `----------------------------------------------------------------------------------------\n`;
    out += ` Turm      | Gesamtschaden | Anteil % | Inv. Gold | Dmg / Gold | Kills | Status\n`;
    out += `----------------------------------------------------------------------------------------\n`;

    ALL_TOWER_TYPES.forEach((t) => {
      const dmg = totalDmgByTower[t];
      const share = grandTotalDmg > 0 ? (dmg / grandTotalDmg) * 100 : 0;
      const inv = this.investedGoldByTower[t];
      const efficiency = inv > 0 ? (dmg / inv) : 0;
      
      let status = 'Ausgeglichen';
      if (share > 50) status = '🚨 Stark Dominant (OP)';
      else if (share > 35) status = '⚡ Hoher Nutzen';
      else if (inv > 250 && share < 6) status = '⚠️ Schwach / UP';
      else if (inv === 0) status = 'Nicht gebaut';

      out += ` ${t.padEnd(9)} | ${dmg.toString().padStart(13)} | ${share.toFixed(1).padStart(7)}% | ${inv.toString().padStart(9)}G | ${efficiency.toFixed(1).padStart(10)} | ${status}\n`;
    });
    out += `----------------------------------------------------------------------------------------\n\n`;

    out += `📌 ZUSAMMENFASSUNG NACH WELLEN:\n`;
    waves.forEach((w) => {
      out += `▶ Welle ${w.waveNumber.toString().padStart(2)} (${(w.durationMs / 1000).toFixed(1)}s): ${w.totalWaveDamage} Schaden`;
      if (w.alerts.length > 0) {
        out += `  -> ⚠️  ${w.alerts.join(' | ')}`;
      }
      out += `\n`;
    });

    out += `\n========================================================================================\n`;
    out += `💡 HINWEIS: Befehle in der Konsole:\n`;
    out += `  - window.printBalancingReport()     -> Schöne formatierte Tabelle\n`;
    out += `  - window.getBalancingReport()       -> Als Text ausgeben / kopieren\n`;
    out += `  - window.tdBalancing                -> Direktes Telemetrie-Objekt\n`;
    out += `========================================================================================\n`;

    return out;
  }

  public printBalancingReport(minutes: number = 15): void {
    console.log(this.getBalancingReport(minutes));
  }

  public getRawData(): WaveBalancingSummary[] {
    return this.waveHistory;
  }

  private exposeGlobalHelpers(): void {
    const g = window as any;
    g.tdBalancing = this;
    g.getBalancingReport = (minutes: number = 15) => this.getBalancingReport(minutes);
    g.printBalancingReport = (minutes: number = 15) => this.printBalancingReport(minutes);
  }
}

export const balancing = BalancingTelemetry.getInstance();
