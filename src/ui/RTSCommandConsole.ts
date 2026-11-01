import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { TOWER_CONFIGS, TowerType } from '../config/TowerConfig';
import { EconomySystem } from '../systems/EconomySystem';
import { SoundManager } from '../systems/SoundManager';
import { SaveSystem } from '../systems/SaveSystem';
import { Tower, TARGET_PRIORITY_LABELS, TargetPriority } from '../entities/Tower';

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

  // UI Container & Panels
  private leftStatusPanel!: Phaser.GameObjects.Container;
  private centerInspectorPanel!: Phaser.GameObjects.Container;
  private rightCommandPanel!: Phaser.GameObjects.Container;

  // Inspector Elements (Mitte)
  private inspectorIcon!: Phaser.GameObjects.Sprite;
  private inspectorTitleText!: Phaser.GameObjects.Text;
  private inspectorStatsText!: Phaser.GameObjects.Text;
  private inspectorEffectText!: Phaser.GameObjects.Text;
  private inspectorExtraText!: Phaser.GameObjects.Text;

  // Build Mode Elements (Rechts)
  private buildCardContainers: Map<TowerType, {
    container: Phaser.GameObjects.Container;
    bg: Phaser.GameObjects.Graphics;
    nameText: Phaser.GameObjects.Text;
    costText: Phaser.GameObjects.Text;
  }> = new Map();

  // Action Buttons Elements (Rechts - Wenn Turm gewählt)
  private actionButtonContainers: Phaser.GameObjects.Container[] = [];

  constructor(
    scene: Phaser.Scene,
    economy: EconomySystem,
    callbacks: RTSCommandConsoleCallbacks
  ) {
    // Höhe: 84px am unteren Bildschirmrand (y = 636 bis 720)
    super(scene, 0, GAME_HEIGHT - 84);
    this.economy = economy;
    this.callbacks = callbacks;

    // 1. Konsolen-Hauptrahmen (Dunkles Neosteel/Titan mit Cyan-Führungskante)
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0e17, 0.98);
    bg.fillRect(0, 0, GAME_WIDTH, 84);

    // Obere Kantenfase
    bg.lineStyle(2, 0x0284c7, 0.9);
    bg.lineBetween(0, 0, GAME_WIDTH, 0);

    // Panel-Trennlinien
    bg.lineStyle(1.5, 0x1e293b, 0.8);
    bg.lineBetween(235, 6, 235, 78);
    bg.lineBetween(775, 6, 775, 78);
    this.add(bg);

    // 2. Linkes Panel: Taktischer Status (x: 10 bis 230)
    this.setupLeftStatusPanel();

    // 3. Mittleres Panel: Turm- & Einheiten-Inspektor (x: 245 bis 765)
    this.setupCenterInspectorPanel();

    // 4. Rechtes Panel: Befehlskarte / Command Card (x: 785 bis 1270)
    this.setupRightCommandPanel();

    this.setDepth(140);
    scene.add.existing(this);
  }

  // =========================================================================
  // 1. LINKES PANEL: Taktischer Status & Wellen-Info
  // =========================================================================
  private waveLabelText!: Phaser.GameObjects.Text;
  private waveStatusText!: Phaser.GameObjects.Text;

  private setupLeftStatusPanel(): void {
    this.leftStatusPanel = this.scene.add.container(14, 8);
    this.add(this.leftStatusPanel);

    // Radar/Taktik-Rahmen
    const frame = this.scene.add.graphics();
    frame.fillStyle(0x060911, 0.9);
    frame.fillRoundedRect(0, 0, 210, 68, 5);
    frame.lineStyle(1.5, 0x1e293b, 1);
    frame.strokeRoundedRect(0, 0, 210, 68, 5);
    this.leftStatusPanel.add(frame);

    // Mini-Radar-Fadenkreuz
    const cross = this.scene.add.graphics();
    cross.lineStyle(1, 0x0284c7, 0.35);
    cross.strokeCircle(36, 34, 22);
    cross.strokeCircle(36, 34, 12);
    cross.strokeLineShape(new Phaser.Geom.Line(10, 34, 62, 34));
    cross.strokeLineShape(new Phaser.Geom.Line(36, 8, 36, 60));
    this.leftStatusPanel.add(cross);

    // Text-Labels
    this.waveLabelText = this.scene.add.text(76, 12, 'WELLE: 1 / 10', {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 1.5
    });
    this.leftStatusPanel.add(this.waveLabelText);

    this.waveStatusText = this.scene.add.text(76, 32, 'STATUS: BEREIT', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#22c55e',
      stroke: '#000000',
      strokeThickness: 1
    });
    this.leftStatusPanel.add(this.waveStatusText);

    const subText = this.scene.add.text(76, 48, 'DECKUNG: 100%', {
      fontFamily: GAME_FONT,
      fontSize: '10px',
      color: '#94a3b8'
    });
    this.leftStatusPanel.add(subText);
  }

  // =========================================================================
  // 2. MITTLERES PANEL: Turm- & Einheiten-Inspektor
  // =========================================================================
  private setupCenterInspectorPanel(): void {
    this.centerInspectorPanel = this.scene.add.container(245, 8);
    this.add(this.centerInspectorPanel);

    // Hintergrundrahmen
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x050811, 0.9);
    bg.fillRoundedRect(0, 0, 520, 68, 5);
    bg.lineStyle(1.5, 0x1e293b, 1);
    bg.strokeRoundedRect(0, 0, 520, 68, 5);
    this.centerInspectorPanel.add(bg);

    // Turm-Vorschau-Icon (Links im Inspektor)
    this.inspectorIcon = this.scene.add.sprite(36, 34, 'tower_cannon_1');
    this.inspectorIcon.setDisplaySize(44, 44);
    this.inspectorIcon.setVisible(false);
    this.centerInspectorPanel.add(this.inspectorIcon);

    // Textfelder
    this.inspectorTitleText = this.scene.add.text(72, 8, '🛡️ TAKTISCHE VERTEIDIGUNGS-KONSOLE', {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 1.5
    });
    this.centerInspectorPanel.add(this.inspectorTitleText);

    this.inspectorStatsText = this.scene.add.text(72, 27, 'Klicke einen Turm auf dem Spielfeld zum Verwalten & Upgraden.', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      color: '#cbd5e1'
    });
    this.centerInspectorPanel.add(this.inspectorStatsText);

    this.inspectorEffectText = this.scene.add.text(72, 43, 'Oder wähle rechts einen Turm zum Bauen. Tastenkürzel: [1] bis [6].', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      color: '#94a3b8'
    });
    this.centerInspectorPanel.add(this.inspectorEffectText);

    this.inspectorExtraText = this.scene.add.text(72, 57, '', {
      fontFamily: GAME_FONT,
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#eab308'
    });
    this.centerInspectorPanel.add(this.inspectorExtraText);
  }

  // =========================================================================
  // 3. RECHTES PANEL: Befehlskarte (Command Card)
  // =========================================================================
  private setupRightCommandPanel(): void {
    this.rightCommandPanel = this.scene.add.container(785, 8);
    this.add(this.rightCommandPanel);

    // 6 Bauturm-Karten (3 Spalten x 2 Zeilen oder 6 nebeneinander)
    // Platz: 485px breit, 68px hoch -> 6 Karten nebeneinander (je 76px breit, 64px hoch)
    const towerTypes: TowerType[] = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];
    const hotkeys = ['1', '2', '3', '4', '5', '6'];
    const cardW = 76;
    const cardH = 68;
    const gap = 5;

    towerTypes.forEach((type, index) => {
      const x = index * (cardW + gap);
      const cardContainer = this.scene.add.container(x, 0);

      const bg = this.scene.add.graphics();
      cardContainer.add(bg);

      // Turm-Sprite
      const icon = this.scene.add.sprite(cardW / 2, 22, `tower_${type}_1`).setDisplaySize(32, 32);
      cardContainer.add(icon);

      // Hotkey Badge
      const hkText = this.scene.add.text(6, 4, `[${hotkeys[index]}]`, {
        fontFamily: GAME_FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#38bdf8'
      });
      cardContainer.add(hkText);

      // Name & Kosten
      const def = TOWER_CONFIGS[type];
      const nameText = this.scene.add.text(cardW / 2, 42, def.name.substring(0, 8), {
        fontFamily: GAME_FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      cardContainer.add(nameText);

      const costText = this.scene.add.text(cardW / 2, 55, `${def.baseCost} 💰`, {
        fontFamily: GAME_FONT,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#facc15'
      }).setOrigin(0.5);
      cardContainer.add(costText);

      // Interaktivität mit dedizierter Hit-Zone & sofortiger taktiler Rückmeldung
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
        cardContainer.setScale(0.92);
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
      this.rightCommandPanel.add(cardContainer);
    });

    this.renderBuildCards();
  }

  // =========================================================================
  // RENDER-LOGIK FÜR BAUKARTEN (Wenn kein Turm selektiert)
  // =========================================================================
  private renderBuildCards(): void {
    const cardW = 76;
    const cardH = 68;

    this.buildCardContainers.forEach((card, type) => {
      const def = TOWER_CONFIGS[type];
      const canAfford = this.economy.canAfford(def.baseCost);
      const isSelected = this.selectedBuildType === type;

      card.bg.clear();
      if (isSelected) {
        card.bg.fillStyle(0x0284c7, 0.95);
        card.bg.fillRoundedRect(0, 0, cardW, cardH, 5);
        card.bg.lineStyle(2, 0x38bdf8, 1);
        card.bg.strokeRoundedRect(0, 0, cardW, cardH, 5);
      } else if (canAfford && this.buildEnabled) {
        card.bg.fillStyle(0x0f172a, 0.9);
        card.bg.fillRoundedRect(0, 0, cardW, cardH, 5);
        card.bg.lineStyle(1.5, 0x334155, 1);
        card.bg.strokeRoundedRect(0, 0, cardW, cardH, 5);
      } else {
        card.bg.fillStyle(0x080c14, 0.85);
        card.bg.fillRoundedRect(0, 0, cardW, cardH, 5);
        card.bg.lineStyle(1, 0x1e293b, 0.6);
        card.bg.strokeRoundedRect(0, 0, cardW, cardH, 5);
      }

      card.costText.setColor(canAfford ? '#facc15' : '#ef4444');
      card.nameText.setColor(canAfford ? '#ffffff' : '#64748b');
    });
  }

  // =========================================================================
  // AKTIONEN FÜR AUSGEWÄHLTEN TURM (UPGRADE, ZIEL, VERKAUFEN, SPEZIALISIEREN)
  // =========================================================================
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
      // 1. Baumodus-Karten ausblenden
      this.buildCardContainers.forEach((c) => c.container.setVisible(false));

      // 2. Aktions-Buttons einblenden & aktualisieren
      this.renderTowerActionButtons(this.selectedTower);

      // 3. Inspektor mit echten Turm-Werten füllen
      this.renderTowerInspector(this.selectedTower);
    } else {
      // Baumodus aktiv
      this.actionButtonContainers.forEach((b) => b.destroy());
      this.actionButtonContainers = [];
      this.buildCardContainers.forEach((c) => c.container.setVisible(true));
      this.renderBuildCards();

      // Standard-Inspektor
      this.inspectorIcon.setVisible(false);
      this.inspectorTitleText.setText('🛡️ TAKTISCHE VERTEIDIGUNGS-KONSOLE');
      this.inspectorStatsText.setText('Klicke einen Turm auf dem Spielfeld zum Verwalten & Upgraden.');
      this.inspectorEffectText.setText('Oder wähle rechts einen Turm zum Bauen. Tastenkürzel: [1] bis [6].');
      this.inspectorExtraText.setText('');
    }
  }

  private renderTowerInspector(tower: Tower): void {
    const def = tower.getDefinition();
    const stats = tower.getStats();

    this.inspectorIcon.setVisible(true);
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

    // Spezial-Effekte
    let eff = '';
    if (stats.splashRadius) eff += `💥 Splash: ${stats.splashRadius}px  `;
    if (stats.slowFactor) eff += `❄️ Verlangsamung: ${Math.round(stats.slowFactor * 100)}%  `;
    if (stats.chainTargets) eff += `⚡ Kettenblitz: ${stats.chainTargets} Ziele  `;
    if (stats.dotDamage) eff += `☠️ Gift-DoT: ${stats.dotDamage}/s  `;
    if (tower.isRuneEmpowered) eff += `💎 Runenstein-Bonus (+20%)`;
    this.inspectorEffectText.setText(eff || 'Direktschaden-Projektil');

    // Extra: Ziel & Wert
    const prioLabel = TARGET_PRIORITY_LABELS[tower.targetPriority] || 'ERSTER';
    this.inspectorExtraText.setText(`🎯 Zielpriorität: [${prioLabel}]   •   💰 Verkaufswert: ${tower.getSellValue()} Gold`);
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

    // 1. UPGRADE-BUTTON
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
      // Spezialisierung verfügbar
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

    // 2. ZIELPRIORITÄTS-BUTTON (Zyklisch umschalten)
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

    // 3. VERKAUFEN-BUTTON
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

    // Buttons anordnen (je 90px breit, 68px hoch)
    const btnW = 90;
    const btnH = 68;
    const gap = 6;

    actions.forEach((act, idx) => {
      const x = idx * (btnW + gap);
      const container = this.scene.add.container(x, 0);

      const bg = this.scene.add.graphics();
      bg.fillStyle(act.bgColor, act.enabled ? 0.95 : 0.6);
      bg.fillRoundedRect(0, 0, btnW, btnH, 5);
      bg.lineStyle(1.5, act.borderColor, act.enabled ? 1 : 0.5);
      bg.strokeRoundedRect(0, 0, btnW, btnH, 5);
      container.add(bg);

      const txtTitle = this.scene.add.text(btnW / 2, 22, act.label, {
        fontFamily: GAME_FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: act.enabled ? '#ffffff' : '#94a3b8'
      }).setOrigin(0.5);
      container.add(txtTitle);

      const txtSub = this.scene.add.text(btnW / 2, 44, act.sub, {
        fontFamily: GAME_FONT,
        fontSize: '11px',
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

        hitZone.on('pointerover', () => {
          bg.clear();
          bg.fillStyle(act.borderColor, 0.4);
          bg.fillRoundedRect(0, 0, btnW, btnH, 5);
          bg.lineStyle(2, 0xffffff, 1);
          bg.strokeRoundedRect(0, 0, btnW, btnH, 5);
        });

        hitZone.on('pointerout', () => {
          container.setScale(1.0);
          bg.clear();
          bg.fillStyle(act.bgColor, 0.95);
          bg.fillRoundedRect(0, 0, btnW, btnH, 5);
          bg.lineStyle(1.5, act.borderColor, 1);
          bg.strokeRoundedRect(0, 0, btnW, btnH, 5);
        });
      }

      this.actionButtonContainers.push(container);
      this.rightCommandPanel.add(container);
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
    this.renderBuildCards();
  }

  public updateAffordability(): void {
    this.renderBuildCards();
    if (this.selectedTower) {
      this.refresh();
    }
  }

  public setBuildEnabled(enabled: boolean): void {
    this.buildEnabled = enabled;
    this.waveStatusText.setText(enabled ? 'STATUS: BEREIT' : 'STATUS: KAMPF');
    this.waveStatusText.setColor(enabled ? '#22c55e' : '#ef4444');
    this.renderBuildCards();
  }

  public updateWave(current: number, total: number): void {
    if (total === 30) {
      this.waveLabelText.setText(`KAMMER: ${current} / 30`);
    } else if (total === 0 || total > 100) {
      this.waveLabelText.setText(`WELLE: ${current} / ∞`);
    } else {
      this.waveLabelText.setText(`WELLE: ${current} / ${total}`);
    }
  }
}
