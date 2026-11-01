import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { TOWER_CONFIGS, TowerType } from '../config/TowerConfig';
import { EconomySystem } from '../systems/EconomySystem';
import { SoundManager } from '../systems/SoundManager';
import { Tower, TARGET_PRIORITY_LABELS } from '../entities/Tower';

export interface RTSCommandConsoleCallbacks {
  onSelectBuildType: (type: TowerType | null) => void;
  onStartDragBuildType: (type: TowerType, pointer: Phaser.Input.Pointer) => void;
  onUpgradeTower: (tower: Tower) => void;
  onSellTower: (tower: Tower) => void;
  onDeselectTower: () => void;
  onNextWaveClicked?: () => void;
}

export class RTSCommandConsole extends Phaser.GameObjects.Container {
  private economy: EconomySystem;
  private callbacks: RTSCommandConsoleCallbacks;
  private selectedBuildType: TowerType | null = null;
  private selectedTower: Tower | null = null;
  private buildEnabled: boolean = true;

  // Zwei Haupt-Container: Baumodus (6 Türme zentriert) & Turm-Verwaltung (Inspektor + Aktionen)
  private buildModeContainer!: Phaser.GameObjects.Container;
  private selectionModeContainer!: Phaser.GameObjects.Container;

  // Build Mode Elements (Großzügig, ungeschnitten & voll lesbar)
  private buildCardContainers: Map<TowerType, {
    container: Phaser.GameObjects.Container;
    bg: Phaser.GameObjects.Graphics;
    nameText: Phaser.GameObjects.Text;
    costText: Phaser.GameObjects.Text;
  }> = new Map();

  // Selected Tower Inspector Elements
  private inspectorIcon!: Phaser.GameObjects.Sprite;
  private inspectorTitleText!: Phaser.GameObjects.Text;
  private inspectorStatsText!: Phaser.GameObjects.Text;
  private inspectorDetailsText!: Phaser.GameObjects.Text;
  private actionButtonContainers: Phaser.GameObjects.Container[] = [];

  constructor(
    scene: Phaser.Scene,
    economy: EconomySystem,
    callbacks: RTSCommandConsoleCallbacks
  ) {
    // Höhe: 80px am unteren Bildschirmrand
    super(scene, 0, GAME_HEIGHT - 80);
    this.economy = economy;
    this.callbacks = callbacks;

    // 1. Konsolen-Hauptrahmen (Dunkles Neosteel/Titan mit Cyan-Führungskante)
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0e17, 0.98);
    bg.fillRect(0, 0, GAME_WIDTH, 80);

    // Obere Kantenfase
    bg.lineStyle(2, 0x0284c7, 0.9);
    bg.lineBetween(0, 0, GAME_WIDTH, 0);
    this.add(bg);

    // 2. Baumodus-Container (Standard: 6 Bauturm-Karten zentriert über die volle Breite)
    this.setupBuildModeCards();

    // 3. Auswahlmodus-Container (Wird aktiv, sobald ein Turm im Spielfeld angeklickt wird)
    this.setupSelectionModePanel();

    this.setDepth(140);
    scene.add.existing(this);
    this.refresh();
  }

  // =========================================================================
  // 1. BAUMODUS: 6 GERÄUMIGE TÜRME MIT VOLLEN, UNGESCHNITTENEN NAMEN
  // =========================================================================
  private setupBuildModeCards(): void {
    this.buildModeContainer = this.scene.add.container(0, 0);
    this.add(this.buildModeContainer);

    const towerTypes: TowerType[] = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];
    const hotkeys = ['1', '2', '3', '4', '5', '6'];

    // Großzügige Kantenbreite: 175px pro Karte (volle Namen haben reichlich Platz!)
    const cardW = 175;
    const cardH = 64;
    const gap = 16;
    const totalW = towerTypes.length * cardW + (towerTypes.length - 1) * gap; // 1130px
    const startX = Math.round((GAME_WIDTH - totalW) / 2); // 75px -> perfekt zentriert!

    towerTypes.forEach((type, index) => {
      const x = startX + index * (cardW + gap);
      const cardContainer = this.scene.add.container(x, 8);

      const bg = this.scene.add.graphics();
      cardContainer.add(bg);

      // Turm-Sprite links auf der Karte
      const icon = this.scene.add.sprite(30, cardH / 2, `tower_${type}_1`).setDisplaySize(42, 42);
      cardContainer.add(icon);

      // Hotkey-Badge oben rechts
      const hkText = this.scene.add.text(cardW - 8, 7, `[${hotkeys[index]}]`, {
        fontFamily: GAME_FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#38bdf8'
      }).setOrigin(1.0, 0);
      cardContainer.add(hkText);

      // VOLLSTÄNDIGER Turm-Name (nicht abgeschnitten!)
      const def = TOWER_CONFIGS[type];
      const nameText = this.scene.add.text(58, 22, def.name, {
        fontFamily: GAME_FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0, 0.5);
      cardContainer.add(nameText);

      // Gold-Kosten
      const costText = this.scene.add.text(58, 44, `${def.baseCost} 💰`, {
        fontFamily: GAME_FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#facc15'
      }).setOrigin(0, 0.5);
      cardContainer.add(costText);

      // Dedizierte Hit-Zone mit Handcursor & direktem Klick-Feedback
      const hitZone = this.scene.add.zone(cardW / 2, cardH / 2, cardW, cardH)
        .setInteractive({ useHandCursor: true });
      cardContainer.add(hitZone);

      hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        if (!this.buildEnabled) {
          SoundManager.playDeny();
          return;
        }
        if (!this.economy.canAfford(def.baseCost)) {
          SoundManager.playDeny();
          return;
        }
        SoundManager.playClick();
        cardContainer.setScale(0.93);
        const nextType = this.selectedBuildType === type ? null : type;
        this.selectBuildType(nextType);
        if (nextType) {
          this.callbacks.onStartDragBuildType(type, pointer);
        }
      });

      hitZone.on('pointerup', () => {
        cardContainer.setScale(1.0);
      });

      hitZone.on('pointerout', () => {
        cardContainer.setScale(1.0);
      });

      this.buildCardContainers.set(type, { container: cardContainer, bg, nameText, costText });
      this.buildModeContainer.add(cardContainer);
    });

    this.renderBuildCards();
  }

  private renderBuildCards(): void {
    const cardW = 175;
    const cardH = 64;

    this.buildCardContainers.forEach((card, type) => {
      const def = TOWER_CONFIGS[type];
      const canAfford = this.economy.canAfford(def.baseCost);
      const isSelected = this.selectedBuildType === type;

      card.bg.clear();
      if (isSelected) {
        card.bg.fillStyle(0x0284c7, 0.95);
        card.bg.fillRoundedRect(0, 0, cardW, cardH, 6);
        card.bg.lineStyle(2, 0x38bdf8, 1);
        card.bg.strokeRoundedRect(0, 0, cardW, cardH, 6);
      } else if (canAfford && this.buildEnabled) {
        card.bg.fillStyle(0x0f172a, 0.9);
        card.bg.fillRoundedRect(0, 0, cardW, cardH, 6);
        card.bg.lineStyle(1.5, 0x334155, 1);
        card.bg.strokeRoundedRect(0, 0, cardW, cardH, 6);
      } else {
        card.bg.fillStyle(0x080c14, 0.85);
        card.bg.fillRoundedRect(0, 0, cardW, cardH, 6);
        card.bg.lineStyle(1, 0x1e293b, 0.6);
        card.bg.strokeRoundedRect(0, 0, cardW, cardH, 6);
      }

      card.costText.setColor(canAfford ? '#facc15' : '#ef4444');
      card.nameText.setColor(canAfford ? '#ffffff' : '#64748b');
    });
  }

  // =========================================================================
  // 2. AUSWAHLMODUS: TURM-INSPEKTOR LINKS & BEFEHLE RECHTS (WENN TURM GEWÄHLT)
  // =========================================================================
  private setupSelectionModePanel(): void {
    this.selectionModeContainer = this.scene.add.container(0, 0);
    this.selectionModeContainer.setVisible(false);
    this.add(this.selectionModeContainer);

    // Inspektor-Rahmen links & Mitte (x: 40 bis 680)
    const inspBg = this.scene.add.graphics();
    inspBg.fillStyle(0x050811, 0.92);
    inspBg.fillRoundedRect(40, 8, 630, 64, 6);
    inspBg.lineStyle(1.5, 0x1e293b, 1);
    inspBg.strokeRoundedRect(40, 8, 630, 64, 6);
    this.selectionModeContainer.add(inspBg);

    // Turm-Vorschau-Icon
    this.inspectorIcon = this.scene.add.sprite(78, 40, 'tower_cannon_1');
    this.inspectorIcon.setDisplaySize(46, 46);
    this.selectionModeContainer.add(this.inspectorIcon);

    // Titel mit Stufe
    this.inspectorTitleText = this.scene.add.text(118, 14, '', {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#38bdf8'
    });
    this.selectionModeContainer.add(this.inspectorTitleText);

    // Kampfwert-Details
    this.inspectorStatsText = this.scene.add.text(118, 33, '', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      color: '#f1f5f9'
    });
    this.selectionModeContainer.add(this.inspectorStatsText);

    // Spezial-Effekte & Priorität
    this.inspectorDetailsText = this.scene.add.text(118, 51, '', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      color: '#94a3b8'
    });
    this.selectionModeContainer.add(this.inspectorDetailsText);
  }

  public setSelectedTower(tower: Tower | null): void {
    this.selectedTower = tower;
    if (tower) {
      this.selectedBuildType = null;
      this.callbacks.onSelectBuildType(null);
    }
    this.refresh();
  }

  public refresh(): void {
    if (this.selectedTower) {
      // 1. Baumodus ausblenden
      this.buildModeContainer.setVisible(false);

      // 2. Turm-Inspektor & Aktions-Buttons anzeigen
      this.selectionModeContainer.setVisible(true);
      this.renderTowerInspector(this.selectedTower);
      this.renderTowerActionButtons(this.selectedTower);
    } else {
      // Baumodus aktiv (alle 6 Baukarten voll sichtbar)
      this.selectionModeContainer.setVisible(false);
      this.actionButtonContainers.forEach((b) => b.destroy());
      this.actionButtonContainers = [];

      this.buildModeContainer.setVisible(true);
      this.renderBuildCards();
    }
  }

  private renderTowerInspector(tower: Tower): void {
    const def = tower.getDefinition();
    const stats = tower.getStats();

    const textureKey = `tower_${tower.towerType}_${tower.specialization ? (tower.specialization === 'path_a' ? 'spec_a' : 'spec_b') : tower.currentLevel}`;
    if (this.scene.textures.exists(textureKey)) {
      this.inspectorIcon.setTexture(textureKey);
    }

    // Titel mit Stufe
    if (tower.specializationDef) {
      this.inspectorTitleText.setText(`${def.name.toUpperCase()} [MEISTER: ${tower.specializationDef.name.toUpperCase()}]`);
      this.inspectorTitleText.setColor('#c084fc');
    } else {
      const tierNames = ['STUFE 1', 'STUFE 2 (VETERAN)', 'STUFE 3 (ELITE)'];
      this.inspectorTitleText.setText(`${def.name.toUpperCase()} [${tierNames[tower.currentLevel - 1] || 'MAX'}]`);
      this.inspectorTitleText.setColor('#38bdf8');
    }

    // Stats
    const dmg = tower.getEffectiveDamage();
    const rng = tower.getEffectiveRange();
    const cdSec = (tower.getEffectiveCooldown() / 1000).toFixed(2);
    const dps = Math.round(dmg / (tower.getEffectiveCooldown() / 1000));
    this.inspectorStatsText.setText(`⚔️ Schaden: ${dmg}   🎯 Reichweite: ${rng} px   ⏱️ Kadenz: ${cdSec}s   ⚡ DPS: ${dps}`);

    // Details & Priorität
    const prioLabel = TARGET_PRIORITY_LABELS[tower.targetPriority] || 'ERSTER';
    let eff = '';
    if (stats.splashRadius) eff += `💥 Splash: ${stats.splashRadius}px  `;
    if (stats.slowFactor) eff += `❄️ Slow: ${Math.round(stats.slowFactor * 100)}%  `;
    if (stats.chainTargets) eff += `⚡ Ketten: ${stats.chainTargets}  `;
    if (stats.dotDamage) eff += `☠️ Gift-DoT: ${stats.dotDamage}/s  `;

    this.inspectorDetailsText.setText(`🎯 Ziel: [${prioLabel}]   •   💰 Verkauf: +${tower.getSellValue()}G   •   ${eff || 'Kinetisch'}`);
  }

  private renderTowerActionButtons(tower: Tower): void {
    this.actionButtonContainers.forEach((b) => b.destroy());
    this.actionButtonContainers = [];

    const actions: {
      label: string;
      sub: string;
      bgColor: number;
      borderColor: number;
      enabled: boolean;
      onClick: () => void;
    }[] = [];

    // 1. UPGRADE / SPEZIALISIERUNG
    const canUpgrade = tower.canUpgrade();
    const upgradeCost = tower.getUpgradeCost();
    const canAffordUpgrade = this.economy.canAfford(upgradeCost);

    if (canUpgrade) {
      actions.push({
        label: `[U] UPGRADE`,
        sub: `${upgradeCost} 💰`,
        bgColor: canAffordUpgrade ? 0x166534 : 0x1c1917,
        borderColor: canAffordUpgrade ? 0x22c55e : 0x44403c,
        enabled: canAffordUpgrade,
        onClick: () => {
          if (!canAffordUpgrade) {
            SoundManager.playDeny();
            return;
          }
          this.callbacks.onUpgradeTower(tower);
          this.refresh();
        }
      });
    } else if (tower.canSpecialize()) {
      const def = tower.getDefinition();
      const specA = def.specializations.path_a;
      const specB = def.specializations.path_b;
      const canAffordA = this.economy.canAfford(specA.cost);
      const canAffordB = this.economy.canAfford(specB.cost);

      actions.push({
        label: `[A] ${specA.shortName}`,
        sub: `${specA.cost} 💰`,
        bgColor: canAffordA ? 0x0e7490 : 0x1c1917,
        borderColor: canAffordA ? 0x06b6d4 : 0x44403c,
        enabled: canAffordA,
        onClick: () => {
          if (!canAffordA) {
            SoundManager.playDeny();
            return;
          }
          tower.specialize('path_a');
          SoundManager.playUpgrade();
          this.refresh();
        }
      });

      actions.push({
        label: `[B] ${specB.shortName}`,
        sub: `${specB.cost} 💰`,
        bgColor: canAffordB ? 0x6b21a8 : 0x1c1917,
        borderColor: canAffordB ? 0xa855f7 : 0x44403c,
        enabled: canAffordB,
        onClick: () => {
          if (!canAffordB) {
            SoundManager.playDeny();
            return;
          }
          tower.specialize('path_b');
          SoundManager.playUpgrade();
          this.refresh();
        }
      });
    } else {
      actions.push({
        label: `MAXIMAL`,
        sub: `Stufe Max`,
        bgColor: 0x1e293b,
        borderColor: 0x475569,
        enabled: false,
        onClick: () => {}
      });
    }

    // 2. ZIELPRIORITÄT
    const prioName = TARGET_PRIORITY_LABELS[tower.targetPriority] || 'ERSTER';
    actions.push({
      label: `[P] ZIEL`,
      sub: prioName,
      bgColor: 0x1e3a8a,
      borderColor: 0x3b82f6,
      enabled: true,
      onClick: () => {
        SoundManager.playClick();
        tower.cycleTargetPriority();
        this.refresh();
      }
    });

    // 3. VERKAUFEN
    const sellValue = tower.getSellValue();
    actions.push({
      label: `[V] VERKAUF`,
      sub: `+${sellValue} 💰`,
      bgColor: 0x991b1b,
      borderColor: 0xef4444,
      enabled: true,
      onClick: () => {
        this.callbacks.onSellTower(tower);
        this.setSelectedTower(null);
      }
    });

    // 4. ABWÄHLEN (SCHLIESSEN)
    actions.push({
      label: `[ESC]`,
      sub: `ZURÜCK`,
      bgColor: 0x334155,
      borderColor: 0x64748b,
      enabled: true,
      onClick: () => {
        SoundManager.playClick();
        this.callbacks.onDeselectTower();
      }
    });

    // Großzügige Aktions-Buttons rechts (x: 695 bis 1245)
    const btnW = 125;
    const btnH = 64;
    const gap = 12;
    const startX = 695;

    actions.forEach((act, idx) => {
      const x = startX + idx * (btnW + gap);
      const container = this.scene.add.container(x, 8);

      const bg = this.scene.add.graphics();
      bg.fillStyle(act.bgColor, act.enabled ? 0.95 : 0.6);
      bg.fillRoundedRect(0, 0, btnW, btnH, 6);
      bg.lineStyle(1.5, act.borderColor, act.enabled ? 1 : 0.5);
      bg.strokeRoundedRect(0, 0, btnW, btnH, 6);
      container.add(bg);

      const txtTitle = this.scene.add.text(btnW / 2, 21, act.label, {
        fontFamily: GAME_FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: act.enabled ? '#ffffff' : '#94a3b8'
      }).setOrigin(0.5);
      container.add(txtTitle);

      const txtSub = this.scene.add.text(btnW / 2, 43, act.sub, {
        fontFamily: GAME_FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: act.enabled ? '#facc15' : '#64748b'
      }).setOrigin(0.5);
      container.add(txtSub);

      if (act.enabled) {
        const hitZone = this.scene.add.zone(btnW / 2, btnH / 2, btnW, btnH)
          .setInteractive({ useHandCursor: true });
        container.add(hitZone);

        hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          pointer.event.stopPropagation();
          container.setScale(0.92);
          SoundManager.playClick();
          act.onClick();
        });

        hitZone.on('pointerup', () => {
          container.setScale(1.0);
        });

        hitZone.on('pointerout', () => {
          container.setScale(1.0);
          bg.clear();
          bg.fillStyle(act.bgColor, 0.95);
          bg.fillRoundedRect(0, 0, btnW, btnH, 6);
          bg.lineStyle(1.5, act.borderColor, 1);
          bg.strokeRoundedRect(0, 0, btnW, btnH, 6);
        });

        hitZone.on('pointerover', () => {
          bg.clear();
          bg.fillStyle(act.borderColor, 0.4);
          bg.fillRoundedRect(0, 0, btnW, btnH, 6);
          bg.lineStyle(2, 0xffffff, 1);
          bg.strokeRoundedRect(0, 0, btnW, btnH, 6);
        });
      }

      this.actionButtonContainers.push(container);
      this.selectionModeContainer.add(container);
    });
  }

  // =========================================================================
  // PUBLIC API FÜR GAMESCENE
  // =========================================================================
  public selectBuildType(type: TowerType | null): void {
    this.selectedBuildType = type;
    this.renderBuildCards();
    this.callbacks.onSelectBuildType(type);
  }

  public clearSelection(): void {
    this.selectedBuildType = null;
    this.selectedTower = null;
    this.refresh();
  }

  public updateAffordability(): void {
    this.renderBuildCards();
    if (this.selectedTower) {
      this.refresh();
    }
  }

  public setBuildEnabled(enabled: boolean): void {
    this.buildEnabled = enabled;
    this.renderBuildCards();
  }

  public updateWave(_current: number, _total: number): void {
    // Unnötiges linkes Radar-Zeug entfernt: Welle wird bereits sauber im oberen HUD angezeigt!
  }
}
