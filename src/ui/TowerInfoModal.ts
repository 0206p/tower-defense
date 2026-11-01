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
    super(scene, 940, 48);
    this.economy = economy;
    this.onCloseCallback = callbacks.onClose;
    this.onUpgradeCallback = callbacks.onUpgrade;
    this.onSellCallback = callbacks.onSell;

    const bg = scene.add.graphics();
    bg.fillStyle(PALETTE.uiBgDark, 0.98);
    bg.fillRoundedRect(0, 0, 325, 342, 8);
    bg.lineStyle(2, PALETTE.uiBorderHighlight, 1);
    bg.strokeRoundedRect(0, 0, 325, 342, 8);
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 325, 342), Phaser.Geom.Rectangle.Contains);
    bg.on('pointerdown', (p: Phaser.Input.Pointer) => p.event.stopPropagation());
    this.add(bg);

    const header = scene.add.graphics();
    header.fillStyle(0x282337, 1);
    header.fillRoundedRect(0, 0, 325, 40, { tl: 8, tr: 8, bl: 0, br: 0 });
    this.add(header);

    this.titleText = scene.add.text(14, 10, 'TURM DETAILS', {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.add(this.titleText);

    const closeBtn = scene.add.text(305, 14, 'X', {
      fontFamily: GAME_FONT,
      fontSize: '16px',
      color: '#e84a5f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-15, -15, 30, 30), Phaser.Geom.Rectangle.Contains);
    closeBtn.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.hide();
    });
    this.add(closeBtn);

    // Gut lesbare Stats
    this.statsText = scene.add.text(16, 48, '', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      lineSpacing: 5,
      color: '#f5f0e6',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.add(this.statsText);

    this.upgradeInfoText = scene.add.text(16, 154, '', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      lineSpacing: 4,
      color: '#5cd670',
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: 295 }
    });
    this.add(this.upgradeInfoText);

    // Zielprioritäts-Umschalter
    this.priorityBtn = this.createActionButton(16, 215, 293, 30, '🎯 ZIEL: ERSTER', 0x221f2d, 0x4d4263, () => {
      if (this.currentTower) {
        SoundManager.playClick();
        this.currentTower.cycleTargetPriority();
        this.refresh();
      }
    });
    this.priorityBtnText = this.priorityBtn.getAt(1) as Phaser.GameObjects.Text;
    this.add(this.priorityBtn);

    // Upgrade-Button
    this.upgradeBtn = this.createActionButton(16, 252, 293, 34, 'UPGRADE', 0x2d6323, 0x518233, () => {
      if (this.currentTower) {
        this.onUpgradeCallback(this.currentTower);
        this.refresh();
      }
    });
    this.upgradeBtnText = this.upgradeBtn.getAt(1) as Phaser.GameObjects.Text;
    this.add(this.upgradeBtn);

    // Verkaufen-Button
    this.sellBtn = this.createActionButton(16, 294, 293, 30, 'VERKAUFEN', 0x7a2828, 0xa33b3b, () => {
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
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
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
    if (this.currentTower) {
      this.currentTower.setSelected(false);
      this.currentTower = null;
    }
    this.setVisible(false);
    this.onCloseCallback();
  }

  public refresh(): void {
    if (!this.currentTower) return;

    const tower = this.currentTower;
    const def = tower.getDefinition();
    const stats = tower.getStats();
    const nextStats = tower.getNextLevelStats();
    const sellValue = tower.getSellValue();

    const tierName = tower.currentLevel === 1 ? 'Gelb' : tower.currentLevel === 2 ? 'Orange' : 'Rot';
    this.titleText.setText(`${def.name} [Stufe ${tower.currentLevel}/3 (${tierName})]`);

    let statsString = `⚔️ Schaden:    ${tower.getEffectiveDamage()}\n🎯 Reichweite: ${tower.getEffectiveRange()} px\n⏱️ Kadenz:     ${(1000 / tower.getEffectiveCooldown()).toFixed(1)}/s`;
    if (stats.splashRadius) statsString += `\n💥 Splash:     ${stats.splashRadius} px`;
    if (stats.slowFactor) statsString += `\n❄️ Slow:       ${Math.round(stats.slowFactor * 100)}%`;
    if (stats.dotDamage) statsString += `\n☠️ Gift-DoT:   ${stats.dotDamage}/Tick`;
    if (stats.chainTargets) statsString += `\n⚡ Kettenblitz: ${stats.chainTargets} Feinde`;
    if (stats.critChance) statsString += `\n🎯 Kritisch:   ${Math.round(stats.critChance * 100)}%`;
    this.statsText.setText(statsString);

    if (nextStats) {
      const upgradeCost = nextStats.cost;
      const canAfford = this.economy.canAfford(upgradeCost);
      const nextTierName = tower.currentLevel + 1 === 2 ? 'Orange' : 'Rot';

      let upString = `STUFE ${tower.currentLevel + 1} (${nextTierName}):\n+${nextStats.damage - stats.damage} Schaden, +${nextStats.range - stats.range} Reichweite`;
      this.upgradeInfoText.setText(upString);

      this.upgradeBtnText.setText(`UPGRADE AUF STUFE ${tower.currentLevel + 1} (${upgradeCost} G)`);
      this.upgradeBtn.setVisible(true);

      const bg = this.upgradeBtn.getAt(0) as Phaser.GameObjects.Graphics;
      bg.clear();
      if (canAfford) {
        if (this.upgradeBtn.input) {
          this.upgradeBtn.input.enabled = true;
          this.upgradeBtn.input.cursor = 'pointer';
        }
        bg.fillStyle(0x2d6323, 1);
        bg.fillRoundedRect(0, 0, 293, 34, 4);
        bg.lineStyle(2, 0x518233, 1);
        bg.strokeRoundedRect(0, 0, 293, 34, 4);
        this.upgradeBtnText.setColor('#ffffff');
      } else {
        if (this.upgradeBtn.input) {
          this.upgradeBtn.input.enabled = false;
          this.upgradeBtn.input.cursor = 'default';
        }
        bg.fillStyle(0x221f2d, 1);
        bg.fillRoundedRect(0, 0, 293, 34, 4);
        bg.lineStyle(2, 0x3d354a, 1);
        bg.strokeRoundedRect(0, 0, 293, 34, 4);
        this.upgradeBtnText.setColor('#686075');
      }
    } else {
      this.upgradeInfoText.setText('★ MAXIMALE STUFE 3 ERREICHT!\n(Meisterstufe mit voller Zerstörungskraft)');
      this.upgradeBtn.setVisible(false);
    }

    this.sellBtnText.setText(`VERKAUFEN (+${sellValue} G)`);
    this.priorityBtnText.setText(`🎯 ZIEL: ${TARGET_PRIORITY_LABELS[tower.targetPriority]}`);
  }
}
