import Phaser from 'phaser';
import { Tower } from '../entities/Tower';
import { EconomySystem } from '../systems/EconomySystem';
import { PALETTE } from '../config/GameConfig';

export class TowerInfoModal extends Phaser.GameObjects.Container {
  private currentTower: Tower | null = null;
  private economy: EconomySystem;

  private titleText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private upgradeInfoText: Phaser.GameObjects.Text;

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
    // Rechts oben platzieren (Breite 280, Höhe 250)
    super(scene, 970, 56);
    this.economy = economy;
    this.onCloseCallback = callbacks.onClose;
    this.onUpgradeCallback = callbacks.onUpgrade;
    this.onSellCallback = callbacks.onSell;

    // Hintergrund-Rahmen
    const bg = scene.add.graphics();
    bg.fillStyle(PALETTE.uiBgDark, 0.95);
    bg.fillRoundedRect(0, 0, 290, 270, 8);
    bg.lineStyle(2, PALETTE.uiBorderHighlight, 1);
    bg.strokeRoundedRect(0, 0, 290, 270, 8);
    this.add(bg);

    // Header-Balken
    const header = scene.add.graphics();
    header.fillStyle(0x282337, 1);
    header.fillRoundedRect(0, 0, 290, 36, { tl: 8, tr: 8, bl: 0, br: 0 });
    this.add(header);

    // Titel
    this.titleText = scene.add.text(12, 10, 'TURM DETAILS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffd13b'
    });
    this.add(this.titleText);

    // Schließen-Button 'X'
    const closeBtn = scene.add.text(268, 10, 'X', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#e84a5f'
    }).setOrigin(0.5);
    closeBtn.setInteractive();
    closeBtn.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.hide();
    });
    this.add(closeBtn);

    // Aktuelle Stats
    this.statsText = scene.add.text(14, 48, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      lineSpacing: 8,
      color: '#f5f0e6'
    });
    this.add(this.statsText);

    // Upgrade-Vorschau
    this.upgradeInfoText = scene.add.text(14, 140, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      lineSpacing: 6,
      color: '#5cd670'
    });
    this.add(this.upgradeInfoText);

    // Upgrade-Button
    this.upgradeBtn = this.createActionButton(14, 195, 262, 30, 'UPGRADE', 0x2d6323, 0x518233, () => {
      if (this.currentTower) {
        this.onUpgradeCallback(this.currentTower);
        this.refresh();
      }
    });
    this.upgradeBtnText = this.upgradeBtn.getAt(1) as Phaser.GameObjects.Text;
    this.add(this.upgradeBtn);

    // Verkaufen-Button
    this.sellBtn = this.createActionButton(14, 230, 262, 28, 'VERKAUFEN', 0x7a2828, 0xa33b3b, () => {
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
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
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

    this.titleText.setText(`${def.name} [Stufe ${tower.currentLevel}/3]`);

    let statsString = `Schaden:     ${stats.damage}\nReichweite:  ${stats.range} px\nKadenz:      ${(1000 / stats.attackCooldown).toFixed(1)}/s`;
    if (stats.splashRadius) {
      statsString += `\nRadius:      ${stats.splashRadius} px`;
    }
    if (stats.slowFactor) {
      statsString += `\nSlow:        ${Math.round(stats.slowFactor * 100)}%`;
    }
    this.statsText.setText(statsString);

    if (nextStats) {
      const upgradeCost = nextStats.cost;
      const canAfford = this.economy.canAfford(upgradeCost);

      let upString = `NÄCHSTE STUFE:\n+${nextStats.damage - stats.damage} Schaden, +${nextStats.range - stats.range} Reichweite`;
      this.upgradeInfoText.setText(upString);

      this.upgradeBtnText.setText(`UPGRADE (${upgradeCost} G)`);
      this.upgradeBtn.setVisible(true);

      const bg = this.upgradeBtn.getAt(0) as Phaser.GameObjects.Graphics;
      bg.clear();
      if (canAfford) {
        this.upgradeBtn.setInteractive();
        bg.fillStyle(0x2d6323, 1);
        bg.fillRoundedRect(0, 0, 262, 30, 4);
        bg.lineStyle(2, 0x518233, 1);
        bg.strokeRoundedRect(0, 0, 262, 30, 4);
        this.upgradeBtnText.setColor('#ffffff');
      } else {
        this.upgradeBtn.disableInteractive();
        bg.fillStyle(0x221f2d, 1);
        bg.fillRoundedRect(0, 0, 262, 30, 4);
        bg.lineStyle(2, 0x3d354a, 1);
        bg.strokeRoundedRect(0, 0, 262, 30, 4);
        this.upgradeBtnText.setColor('#686075');
      }
    } else {
      this.upgradeInfoText.setText('MAXIMALE STUFE ERREICHT!');
      this.upgradeBtn.setVisible(false);
    }

    this.sellBtnText.setText(`VERKAUFEN (+${sellValue} G)`);
  }
}

