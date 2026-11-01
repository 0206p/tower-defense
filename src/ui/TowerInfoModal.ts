import Phaser from 'phaser';
import { Tower, TARGET_PRIORITY_LABELS } from '../entities/Tower';
import { EconomySystem } from '../systems/EconomySystem';
import { SoundManager } from '../systems/SoundManager';
import { GAME_FONT, PALETTE } from '../config/GameConfig';

export class TowerInfoModal extends Phaser.GameObjects.Container {
  private currentTower: Tower | null = null;
  private economy: EconomySystem;

  private titleText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private upgradeInfoText: Phaser.GameObjects.Text;

  private priorityBtn: Phaser.GameObjects.Container;
  private priorityBtnText: Phaser.GameObjects.Text;
  private upgradeBtn: Phaser.GameObjects.Container;
  private upgradeBtnText: Phaser.GameObjects.Text;
  private specBtnA: Phaser.GameObjects.Container;
  private specBtnAText: Phaser.GameObjects.Text;
  private specBtnB: Phaser.GameObjects.Container;
  private specBtnBText: Phaser.GameObjects.Text;
  private sellBtn: Phaser.GameObjects.Container;
  private sellBtnText: Phaser.GameObjects.Text;

  private onCloseCallback: () => void;
  private onUpgradeCallback: (tower: Tower) => void;
  private onSellCallback: (tower: Tower) => void;

  constructor(
    scene: Phaser.Scene,
    economy: EconomySystem,
    callbacks: {
      onClose: () => void;
      onUpgrade: (tower: Tower) => void;
      onSell: (tower: Tower) => void;
    }
  ) {
    super(scene, 940, 42);
    this.economy = economy;
    this.onCloseCallback = callbacks.onClose;
    this.onUpgradeCallback = callbacks.onUpgrade;
    this.onSellCallback = callbacks.onSell;

    const bg = scene.add.graphics();
    bg.fillStyle(PALETTE.uiBgDark, 0.98);
    bg.fillRoundedRect(0, 0, 325, 360, 8);
    bg.lineStyle(2, PALETTE.uiBorderHighlight, 1);
    bg.strokeRoundedRect(0, 0, 325, 360, 8);
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 325, 360), Phaser.Geom.Rectangle.Contains);
    bg.on('pointerdown', (p: Phaser.Input.Pointer) => p.event.stopPropagation());
    this.add(bg);

    const header = scene.add.graphics();
    header.fillStyle(0x282337, 1);
    header.fillRoundedRect(0, 0, 325, 40, { tl: 8, tr: 8, bl: 0, br: 0 });
    this.add(header);

    this.titleText = scene.add.text(14, 10, 'TURM DETAILS', {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 1.5
    });
    this.add(this.titleText);

    const closeBtn = scene.add.text(305, 14, '✕', {
      fontFamily: GAME_FONT,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e84a5f',
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-15, -15, 30, 30), Phaser.Geom.Rectangle.Contains);
    closeBtn.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.hide();
    });
    this.add(closeBtn);

    // Gut lesbare Stats
    this.statsText = scene.add.text(16, 46, '', {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      fontStyle: '500',
      lineSpacing: 5,
      color: '#f5f0e6',
      stroke: '#000000',
      strokeThickness: 1
    });
    this.add(this.statsText);

    this.upgradeInfoText = scene.add.text(16, 150, '', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: '500',
      lineSpacing: 4,
      color: '#5cd670',
      stroke: '#000000',
      strokeThickness: 1,
      wordWrap: { width: 295 }
    });
    this.add(this.upgradeInfoText);

    // Zielprioritäts-Umschalter
    this.priorityBtn = this.createActionButton(16, 210, 293, 28, '🎯 ZIEL: ERSTER', 0x221f2d, 0x4d4263, () => {
      if (this.currentTower) {
        SoundManager.playClick();
        this.currentTower.cycleTargetPriority();
        this.refresh();
      }
    });
    this.priorityBtnText = this.priorityBtn.getAt(1) as Phaser.GameObjects.Text;
    this.add(this.priorityBtn);

    // Standard Upgrade-Button (Stufe 1 -> 2 -> 3)
    this.upgradeBtn = this.createActionButton(16, 244, 293, 34, 'UPGRADE', 0x2d6323, 0x518233, () => {
      if (this.currentTower) {
        this.onUpgradeCallback(this.currentTower);
        this.refresh();
      }
    });
    this.upgradeBtnText = this.upgradeBtn.getAt(1) as Phaser.GameObjects.Text;
    this.add(this.upgradeBtn);

    // Spezialisierung A
    this.specBtnA = this.createActionButton(16, 244, 293, 32, '✦ PFAD A', 0x133833, 0x16a085, () => {
      if (this.currentTower) {
        const success = this.currentTower.specialize('path_a');
        if (success) {
          SoundManager.playUpgrade();
          this.refresh();
        }
      }
    });
    this.specBtnAText = this.specBtnA.getAt(1) as Phaser.GameObjects.Text;
    this.specBtnA.setVisible(false);
    this.add(this.specBtnA);

    // Spezialisierung B
    this.specBtnB = this.createActionButton(16, 280, 293, 32, '✦ PFAD B', 0x301934, 0x8e44ad, () => {
      if (this.currentTower) {
        const success = this.currentTower.specialize('path_b');
        if (success) {
          SoundManager.playUpgrade();
          this.refresh();
        }
      }
    });
    this.specBtnBText = this.specBtnB.getAt(1) as Phaser.GameObjects.Text;
    this.specBtnB.setVisible(false);
    this.add(this.specBtnB);

    // Verkaufen-Button
    this.sellBtn = this.createActionButton(16, 318, 293, 28, 'VERKAUFEN', 0x7a2828, 0xa33b3b, () => {
      if (this.currentTower) {
        this.onSellCallback(this.currentTower);
        this.hide();
      }
    });
    this.sellBtnText = this.sellBtn.getAt(1) as Phaser.GameObjects.Text;
    this.add(this.sellBtn);

    this.setDepth(150);
    this.setVisible(false);
    scene.add.existing(this);
  }

  private createActionButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    bgColor: number,
    borderColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(0, 0, w, h, 4);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(0, 0, w, h, 4);
    container.add(bg);

    const text = this.scene.add.text(w / 2, h / 2, label, {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      if (!container.input?.enabled) return;
      onClick();
    });

    return container;
  }

  public show(tower: Tower): void {
    this.currentTower = tower;
    this.setVisible(true);
    this.refresh();
  }

  public hide(): void {
    if (!this.visible && !this.currentTower) return;
    this.setVisible(false);
    if (this.currentTower) {
      const tower = this.currentTower;
      this.currentTower = null;
      tower.setSelected(false);
    }
    this.onCloseCallback();
  }

  public refresh(): void {
    if (!this.currentTower) return;

    const tower = this.currentTower;
    const def = tower.getDefinition();
    const stats = tower.getStats();
    const nextStats = tower.getNextLevelStats();
    const sellValue = tower.getSellValue();

    if (tower.specializationDef) {
      this.titleText.setText(`${def.name} [MEISTER: ${tower.specializationDef.shortName.toUpperCase()}]`);
    } else {
      const tierName = tower.currentLevel === 1 ? 'Gelb' : tower.currentLevel === 2 ? 'Orange' : 'Rot';
      this.titleText.setText(`${def.name} [Stufe ${tower.currentLevel}/3 (${tierName})]`);
    }

    let statsString = `⚔️ Schaden:    ${tower.getEffectiveDamage()}\n🎯 Reichweite: ${tower.getEffectiveRange()} px\n⏱️ Kadenz:     ${(1000 / tower.getEffectiveCooldown()).toFixed(1)}/s`;
    if (stats.splashRadius) statsString += `\n💥 Splash:     ${stats.splashRadius} px`;
    if (stats.slowFactor) statsString += `\n❄️ Slow:       ${Math.round(stats.slowFactor * 100)}%`;
    if (stats.dotDamage) statsString += `\n☠️ Gift-DoT:   ${stats.dotDamage}/Tick`;
    if (stats.chainTargets) statsString += `\n⚡ Kettenblitz: ${stats.chainTargets} Feinde`;
    if (stats.critChance) statsString += `\n🎯 Kritisch:   ${Math.round(stats.critChance * 100)}%`;
    this.statsText.setText(statsString);

    // Standard Upgrade (Stufe 1 & 2)
    if (nextStats) {
      const upgradeCost = nextStats.cost;
      const canAfford = this.economy.canAfford(upgradeCost);
      const nextTierName = tower.currentLevel + 1 === 2 ? 'Orange' : 'Rot';

      this.upgradeInfoText.setText(`NÄCHSTE STUFE (${nextTierName}):\n+${nextStats.damage - stats.damage} Schaden, +${nextStats.range - stats.range} Reichweite`);
      this.upgradeBtnText.setText(`UPGRADE AUF STUFE ${tower.currentLevel + 1} (${upgradeCost} G)`);
      this.upgradeBtn.setVisible(true);
      this.specBtnA.setVisible(false);
      this.specBtnB.setVisible(false);
      this.sellBtn.setPosition(16, 284);

      const bg = this.upgradeBtn.getAt(0) as Phaser.GameObjects.Graphics;
      bg.clear();
      if (canAfford) {
        if (this.upgradeBtn.input) this.upgradeBtn.input.enabled = true;
        bg.fillStyle(0x2d6323, 1);
        bg.fillRoundedRect(0, 0, 293, 34, 4);
        bg.lineStyle(2, 0x518233, 1);
        bg.strokeRoundedRect(0, 0, 293, 34, 4);
        this.upgradeBtnText.setColor('#ffffff');
      } else {
        if (this.upgradeBtn.input) this.upgradeBtn.input.enabled = false;
        bg.fillStyle(0x221f2d, 1);
        bg.fillRoundedRect(0, 0, 293, 34, 4);
        bg.lineStyle(2, 0x3d354a, 1);
        bg.strokeRoundedRect(0, 0, 293, 34, 4);
        this.upgradeBtnText.setColor('#686075');
      }
    } else if (tower.canSpecialize()) {
      // Stufe 3 erreicht -> Spezialisierungen freigeschaltet!
      this.upgradeBtn.setVisible(false);
      this.specBtnA.setVisible(true);
      this.specBtnB.setVisible(true);
      this.sellBtn.setPosition(16, 318);

      const specA = def.specializations.path_a;
      const specB = def.specializations.path_b;

      this.upgradeInfoText.setText(`★ MEISTER-SPEZIALISIERUNG WÄHLEN:\n${specA.name} ODER ${specB.name}!`);

      // Button A
      const canAffordA = this.economy.canAfford(specA.cost);
      this.specBtnAText.setText(`✦ ${specA.name.toUpperCase()} (${specA.cost}G)`);
      const bgA = this.specBtnA.getAt(0) as Phaser.GameObjects.Graphics;
      bgA.clear();
      bgA.fillStyle(canAffordA ? 0x133833 : 0x1a2123, 1);
      bgA.fillRoundedRect(0, 0, 293, 32, 4);
      bgA.lineStyle(2, canAffordA ? 0x16a085 : 0x34495e, 1);
      bgA.strokeRoundedRect(0, 0, 293, 32, 4);
      if (this.specBtnA.input) this.specBtnA.input.enabled = canAffordA;
      this.specBtnAText.setColor(canAffordA ? '#55efc4' : '#636e72');

      // Button B
      const canAffordB = this.economy.canAfford(specB.cost);
      this.specBtnBText.setText(`✦ ${specB.name.toUpperCase()} (${specB.cost}G)`);
      const bgB = this.specBtnB.getAt(0) as Phaser.GameObjects.Graphics;
      bgB.clear();
      bgB.fillStyle(canAffordB ? 0x301934 : 0x221a28, 1);
      bgB.fillRoundedRect(0, 0, 293, 32, 4);
      bgB.lineStyle(2, canAffordB ? 0x8e44ad : 0x483453, 1);
      bgB.strokeRoundedRect(0, 0, 293, 32, 4);
      if (this.specBtnB.input) this.specBtnB.input.enabled = canAffordB;
      this.specBtnBText.setColor(canAffordB ? '#e056fd' : '#636e72');
    } else {
      // Meisterstufe bereits gewählt
      this.upgradeBtn.setVisible(false);
      this.specBtnA.setVisible(false);
      this.specBtnB.setVisible(false);
      this.sellBtn.setPosition(16, 252);
      this.upgradeInfoText.setText(`★ MEISTER-SPEZIALISIERUNG AKTIV:\n${tower.specializationDef?.description}`);
    }

    this.sellBtnText.setText(`VERKAUFEN (+${sellValue} G)`);
    this.priorityBtnText.setText(`🎯 ZIEL: ${TARGET_PRIORITY_LABELS[tower.targetPriority]}`);
  }
}
