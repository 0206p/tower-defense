import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GAME_FONT } from '../config/GameConfig';
import { RTSAssetGenerator } from '../systems/RTSAssetGenerator';
import { SoundManager } from '../systems/SoundManager';
import { logger } from '../systems/GameLogger';

interface RTSUnit {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Image;
  hpBarFill: Phaser.GameObjects.Graphics;
  shieldBarFill: Phaser.GameObjects.Graphics;
  type: 'crawler' | 'mech' | 'skimmer';
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  speed: number;
  pathDistance: number;
  altitudeOffset: number;
}

interface RTSTower {
  container: Phaser.GameObjects.Container;
  base: Phaser.GameObjects.Image;
  turret: Phaser.GameObjects.Image;
  core?: Phaser.GameObjects.Image;
  type: 'cannon' | 'tesla' | 'sniper';
  name: string;
  range: number;
  damage: number;
  dps: number;
  target?: RTSUnit | null;
  lastFired: number;
  fireCooldown: number;
  rank: string;
  kills: number;
}

export class StarCraftPrototypeScene extends Phaser.Scene {
  private towers: RTSTower[] = [];
  private units: RTSUnit[] = [];
  private pathCurve!: Phaser.Curves.Path;
  private selectedEntity: RTSTower | RTSUnit | null = null;

  // RTS HUD Elements
  private radarSweepLine!: Phaser.GameObjects.Line;
  private radarBlips: Phaser.GameObjects.Arc[] = [];
  private wireframeNameText!: Phaser.GameObjects.Text;
  private wireframeRankText!: Phaser.GameObjects.Text;
  private wireframeHpText!: Phaser.GameObjects.Text;
  private wireframeShieldText!: Phaser.GameObjects.Text;
  private wireframeWeaponText!: Phaser.GameObjects.Text;
  private wireframeDisplayGfx!: Phaser.GameObjects.Graphics;
  private mineralsText!: Phaser.GameObjects.Text;
  private vespeneText!: Phaser.GameObjects.Text;
  private supplyText!: Phaser.GameObjects.Text;
  private apmText!: Phaser.GameObjects.Text;

  private minerals: number = 450;
  private vespene: number = 180;
  private currentApm: number = 168;

  constructor() {
    super({ key: 'StarCraftPrototypeScene' });
  }

  public create(): void {
    logger.info('StarCraftPrototypeScene', 'StarCraft II 2.5D RTS Prototyp aufgerufen');

    // 1. Assets generieren
    RTSAssetGenerator.generateAll(this);

    // 2. Hintergrund-Terrain rendern
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'rts_terrain_metal_platform').setDepth(0);

    // 3. Taktischer Isometrischer Pfad
    this.setupTacticalPath();

    // 4. StarCraft II 3D-Look Türme platzieren
    this.spawnTowers();

    // 5. RTS Konsole & Command Card
    this.setupRTSConsole();

    // 6. Wellen-Spawner für Prototyp-Gegner
    this.time.addEvent({
      delay: 1400,
      loop: true,
      callback: () => this.spawnRandomUnit()
    });

    // 7. Vergleichs- & Kontroll-Buttons
    this.setupComparisonControls();

    // Standard-Auswahl auf Belagerungsturm setzen
    if (this.towers.length > 0) {
      this.selectEntity(this.towers[0]);
    }
  }

  private setupTacticalPath(): void {
    // Isometrischer Weg über die Plattform
    const pathPoints = [
      { x: 80, y: 140 },
      { x: 380, y: 140 },
      { x: 380, y: 320 },
      { x: 820, y: 320 },
      { x: 820, y: 180 },
      { x: 1160, y: 180 }
    ];

    this.pathCurve = this.add.path(pathPoints[0].x, pathPoints[0].y);
    const cr = 24;

    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const cur = pathPoints[i];
      const next = i < pathPoints.length - 1 ? pathPoints[i + 1] : null;

      if (!next) {
        this.pathCurve.lineTo(cur.x, cur.y);
      } else {
        const dx1 = Math.sign(cur.x - prev.x);
        const dy1 = Math.sign(cur.y - prev.y);
        const dx2 = Math.sign(next.x - cur.x);
        const dy2 = Math.sign(next.y - cur.y);

        if (dx1 !== dx2 || dy1 !== dy2) {
          this.pathCurve.lineTo(cur.x - dx1 * cr, cur.y - dy1 * cr);
          this.pathCurve.quadraticBezierTo(cur.x + dx2 * cr, cur.y + dy2 * cr, cur.x, cur.y);
        } else {
          this.pathCurve.lineTo(cur.x, cur.y);
        }
      }
    }

    // Pfad-Optik auf dem Metallboden
    const pathGfx = this.add.graphics().setDepth(2);
    // Tiefenschatten
    pathGfx.lineStyle(38, 0x07090e, 0.7);
    this.pathCurve.draw(pathGfx);

    // Hauptstraße mit Stahlplatten-Look
    pathGfx.lineStyle(28, 0x1f2735, 0.95);
    this.pathCurve.draw(pathGfx);

    // Cyan Führungslinie
    pathGfx.lineStyle(2, 0x00d2ff, 0.5);
    this.pathCurve.draw(pathGfx);
  }

  private spawnTowers(): void {
    // Turm 1: Siege Gauss Cannon (Terran Artillery)
    this.createRTSTower(260, 230, 'cannon', 'SIEGE GAUSS CANNON', 210, 340, 280, 'RANG 3 - VETERAN');

    // Turm 2: Photon Plasma Pylon (Protoss Energy)
    this.createRTSTower(600, 230, 'tesla', 'PHOTON PLASMA PYLON', 230, 220, 310, 'PROTOSS PHALANX');

    // Turm 3: Sentry Gatling Bunker (Terran Defense)
    this.createRTSTower(960, 260, 'sniper', 'SENTRY RAILGUN BUNKER', 250, 480, 240, 'ELITE SNIPER');
  }

  private createRTSTower(
    x: number,
    y: number,
    type: 'cannon' | 'tesla' | 'sniper',
    name: string,
    range: number,
    damage: number,
    dps: number,
    rank: string
  ): void {
    const container = this.add.container(x, y).setDepth(15);

    // Reichweiten-Indikator (beim Anklicken)
    const rangeCircle = this.add.graphics();
    rangeCircle.lineStyle(2, 0x00d2ff, 0.45);
    rangeCircle.strokeCircle(0, 0, range);
    rangeCircle.fillStyle(0x00d2ff, 0.08);
    rangeCircle.fillCircle(0, 0, range);
    rangeCircle.setVisible(false);
    container.add(rangeCircle);

    // Basis mit vorberechnetem Bodenschatten
    const base = this.add.image(0, 0, `rts_tower_${type}_base`);
    container.add(base);

    // Drehbares Geschütz / Pylon
    let turret: Phaser.GameObjects.Image;
    let core: Phaser.GameObjects.Image | undefined;

    if (type === 'tesla') {
      turret = this.add.image(0, -6, 'rts_tower_tesla_base');
      turret.setVisible(false); // Die Basis hat bereits Pylonen

      // Schwebender Plasma-Kern
      core = this.add.image(0, -18, 'rts_tower_tesla_core');
      container.add(core);

      // Sanftes Schweben
      this.tweens.add({
        targets: core,
        y: -24,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      turret = this.add.image(0, -4, `rts_tower_${type}_turret`);
      container.add(turret);
    }

    container.setSize(76, 76);
    container.setInteractive(new Phaser.Geom.Rectangle(-38, -38, 76, 76), Phaser.Geom.Rectangle.Contains);

    const towerObj: RTSTower = {
      container,
      base,
      turret,
      core,
      type,
      name,
      range,
      damage,
      dps,
      lastFired: 0,
      fireCooldown: type === 'cannon' ? 1200 : (type === 'tesla' ? 700 : 900),
      rank,
      kills: Phaser.Math.Between(12, 48)
    };

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      SoundManager.playClick();
      this.selectEntity(towerObj);
      rangeCircle.setVisible(true);
      this.time.delayedCall(2500, () => rangeCircle.setVisible(false));
    });

    this.towers.push(towerObj);
  }

  private spawnRandomUnit(): void {
    if (this.units.length >= 14) return;

    const unitTypes: ('crawler' | 'mech' | 'skimmer')[] = ['crawler', 'mech', 'skimmer'];
    const type = unitTypes[Phaser.Math.Between(0, 2)];

    let name = 'SWARM CRAWLER';
    let hp = 1400;
    let shield = 200;
    let speed = 75;
    let altitudeOffset = 0;

    if (type === 'mech') {
      name = 'GOLIATH ASSAULT MECH';
      hp = 3800;
      shield = 1200;
      speed = 48;
    } else if (type === 'skimmer') {
      name = 'VOID SKIMMER (HOVER)';
      hp = 2200;
      shield = 600;
      speed = 95;
      altitudeOffset = -12; // Schwebt 12px über dem Schatten
    }

    const container = this.add.container(0, 0).setDepth(20);

    // Echter dynamischer Bodenschatten
    const shadow = this.add.image(0, 8, `rts_unit_${type}`);
    shadow.setTint(0x000000);
    shadow.setAlpha(0.45);
    shadow.setScale(1.0, 0.55); // Isometrische Stauchung
    container.add(shadow);

    // Einheitensprite
    const sprite = this.add.image(0, altitudeOffset, `rts_unit_${type}`);
    container.add(sprite);

    // StarCraft II Schild- & Lebensbalken über der Einheit
    const barWidth = 36;
    const hpBarFill = this.add.graphics();
    const shieldBarFill = this.add.graphics();
    container.add([shieldBarFill, hpBarFill]);

    container.setSize(48, 48);
    container.setInteractive(new Phaser.Geom.Rectangle(-24, -24, 48, 48), Phaser.Geom.Rectangle.Contains);

    const unitObj: RTSUnit = {
      container,
      sprite,
      shadow,
      hpBarFill,
      shieldBarFill,
      type,
      name,
      hp,
      maxHp: hp,
      shield,
      maxShield: shield,
      speed,
      pathDistance: 0,
      altitudeOffset
    };

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      SoundManager.playClick();
      this.selectEntity(unitObj);
    });

    this.units.push(unitObj);
  }

  private setupRTSConsole(): void {
    // StarCraft II Bottom Console Panel
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'rts_console_bottom_panel').setDepth(50);

    // Radar-Sweep-Linie
    this.radarSweepLine = this.add.line(0, 0, 159, 80, 159 + 42, 80, 0x38bdf8).setDepth(52);
    this.radarSweepLine.setPosition(0, GAME_HEIGHT - 160);

    // Center Panel: Holografisches Drahtgitter-Display
    this.wireframeDisplayGfx = this.add.graphics().setDepth(52);
    this.wireframeDisplayGfx.setPosition(332, GAME_HEIGHT - 138);

    this.wireframeNameText = this.add.text(465, GAME_HEIGHT - 138, 'TERRAN SIEGE TANK', {
      fontFamily: GAME_FONT,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(52);

    this.wireframeRankText = this.add.text(465, GAME_HEIGHT - 116, 'RANG 3 - VETERAN | KLASSE: ARTILLERIE', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      color: '#94a3b8'
    }).setDepth(52);

    this.wireframeShieldText = this.add.text(465, GAME_HEIGHT - 94, 'SCHILD: 1.200 / 1.200 (100%)', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setDepth(52);

    this.wireframeHpText = this.add.text(465, GAME_HEIGHT - 74, 'PANZERUNG: 4.800 / 4.800 (100%)', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#22c55e'
    }).setDepth(52);

    this.wireframeWeaponText = this.add.text(465, GAME_HEIGHT - 54, 'HAUPTWAFFE: 2x 120mm Shock-Gauss (340 DMG | 280 DPS)', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      color: '#facc15'
    }).setDepth(52);

    // Right Panel: 3x3 Befehlskarten-Buttons (Command Card)
    const commands = [
      { key: 'Q', label: 'ATTACK' }, { key: 'W', label: 'SIEGE' }, { key: 'E', label: 'OVERLOAD' },
      { key: 'A', label: 'REPAIR' }, { key: 'S', label: 'HOLD' }, { key: 'D', label: 'RADAR' },
      { key: 'Z', label: 'UPGRADE' }, { key: 'X', label: 'SPECIAL' }, { key: 'C', label: 'RETIRE' }
    ];

    commands.forEach((cmd, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const bx = 952 + col * 102 + 47;
      const by = GAME_HEIGHT - 160 + 22 + row * 40 + 17;

      const txt = this.add.text(bx, by, `[${cmd.key}] ${cmd.label}`, {
        fontFamily: GAME_FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#e2e8f0'
      }).setOrigin(0.5).setDepth(52);

      const hitArea = this.add.zone(bx, by, 94, 34).setInteractive({ cursor: 'pointer' }).setDepth(53);
      hitArea.on('pointerdown', () => {
        SoundManager.playClick();
        this.minerals += 25;
        this.mineralsText.setText(`${this.minerals}`);
        this.cameras.main.flash(80, 56, 189, 248, false);
      });
      hitArea.on('pointerover', () => txt.setColor('#38bdf8'));
      hitArea.on('pointerout', () => txt.setColor('#e2e8f0'));
    });

    // Top Resource Bar (StarCraft II Style: Minerals, Vespene, Supply, APM)
    const topBar = this.add.graphics().setDepth(50);
    topBar.fillStyle(0x0a0e17, 0.92);
    topBar.fillRect(0, 0, GAME_WIDTH, 38);
    topBar.lineStyle(2, 0x334155, 1);
    topBar.lineBetween(0, 38, GAME_WIDTH, 38);

    this.add.text(35, 11, '⛏️ MINERALIEN:', { fontFamily: GAME_FONT, fontSize: '13px', fontStyle: 'bold', color: '#38bdf8' }).setDepth(51);
    this.mineralsText = this.add.text(145, 11, `${this.minerals}`, { fontFamily: GAME_FONT, fontSize: '14px', fontStyle: 'bold', color: '#ffffff' }).setDepth(51);

    this.add.text(220, 11, '🧪 VESPENE-GAS:', { fontFamily: GAME_FONT, fontSize: '13px', fontStyle: 'bold', color: '#22c55e' }).setDepth(51);
    this.vespeneText = this.add.text(350, 11, `${this.vespene}`, { fontFamily: GAME_FONT, fontSize: '14px', fontStyle: 'bold', color: '#ffffff' }).setDepth(51);

    this.add.text(425, 11, '👥 VERSORGUNG:', { fontFamily: GAME_FONT, fontSize: '13px', fontStyle: 'bold', color: '#facc15' }).setDepth(51);
    this.supplyText = this.add.text(545, 11, '32 / 200', { fontFamily: GAME_FONT, fontSize: '14px', fontStyle: 'bold', color: '#ffffff' }).setDepth(51);

    this.add.text(640, 11, '⚡ APM:', { fontFamily: GAME_FONT, fontSize: '13px', fontStyle: 'bold', color: '#ec4899' }).setDepth(51);
    this.apmText = this.add.text(700, 11, `${this.currentApm}`, { fontFamily: GAME_FONT, fontSize: '14px', fontStyle: 'bold', color: '#ffffff' }).setDepth(51);
  }

  private selectEntity(entity: RTSTower | RTSUnit): void {
    this.selectedEntity = entity;

    // Center Panel mit echten RTS-Informationen aktualisieren
    this.wireframeNameText.setText(entity.name);

    if ('range' in entity) {
      // Es ist ein Turm
      const t = entity as RTSTower;
      this.wireframeRankText.setText(`${t.rank} • ABSCHÜSSE: ${t.kills}`);
      this.wireframeShieldText.setText('STATUS: AKTIV • SCHUSSBEREIT');
      this.wireframeShieldText.setColor('#38bdf8');
      this.wireframeHpText.setText(`REICHWEITE: ${t.range}m • NACHLADEZEIT: ${t.fireCooldown}ms`);
      this.wireframeHpText.setColor('#22c55e');
      this.wireframeWeaponText.setText(`PRIMÄR-WAFFE: ${t.name} (${t.damage} DMG | ${t.dps} DPS)`);
    } else {
      // Es ist eine Einheit
      const u = entity as RTSUnit;
      this.wireframeRankText.setText(`EINHEIT: ${u.type.toUpperCase()} • GESCHWINDIGKEIT: ${u.speed}`);
      this.wireframeShieldText.setText(`PLASMASCHILD: ${u.shield} / ${u.maxShield}`);
      this.wireframeShieldText.setColor('#38bdf8');
      this.wireframeHpText.setText(`STRUKTUR / HP: ${u.hp} / ${u.maxHp}`);
      this.wireframeHpText.setColor('#22c55e');
      this.wireframeWeaponText.setText(`BEDROHUNGSSTUFE: HOCH • RÜSTUNGSTYP: ${u.type === 'mech' ? 'SCHWER' : 'LEICHT'}`);
    }

    // Hologramm-Drahtgitter zeichnen
    this.wireframeDisplayGfx.clear();
    this.wireframeDisplayGfx.lineStyle(1.5, 0x38bdf8, 0.85);
    this.wireframeDisplayGfx.strokeCircle(58, 58, 40);
    this.wireframeDisplayGfx.lineStyle(1, 0x38bdf8, 0.45);
    this.wireframeDisplayGfx.strokeRect(26, 26, 64, 64);
    this.wireframeDisplayGfx.strokeLineShape(new Phaser.Geom.Line(18, 58, 98, 58));
    this.wireframeDisplayGfx.strokeLineShape(new Phaser.Geom.Line(58, 18, 58, 98));
  }

  private setupComparisonControls(): void {
    // 1. Zurück zum Menü
    const backBtn = this.add.container(1210, 19).setDepth(60);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x334155, 1);
    backBg.fillRoundedRect(-50, -12, 100, 24, 4);
    backBtn.add(backBg);
    const backTxt = this.add.text(0, 0, '< MENÜ', { fontFamily: GAME_FONT, fontSize: '11px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    backBtn.add(backTxt);
    backBtn.setSize(100, 24);
    backBtn.setInteractive(new Phaser.Geom.Rectangle(-50, -12, 100, 24), Phaser.Geom.Rectangle.Contains);
    backBtn.on('pointerdown', () => {
      SoundManager.playClick();
      this.scene.start('MenuScene');
    });

    // 2. Ansichts-Wechsler Button (Vergleich mit Classic View)
    const toggleBtn = this.add.container(990, 19).setDepth(60);
    const toggleBg = this.add.graphics();
    toggleBg.fillStyle(0x0284c7, 1);
    toggleBg.fillRoundedRect(-140, -12, 280, 24, 4);
    toggleBtn.add(toggleBg);
    const toggleTxt = this.add.text(0, 0, '🔄 ZURÜCK ZUR KLASSISCHEN ANSICHT', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    toggleBtn.add(toggleTxt);
    toggleBtn.setSize(280, 24);
    toggleBtn.setInteractive(new Phaser.Geom.Rectangle(-140, -12, 280, 24), Phaser.Geom.Rectangle.Contains);
    toggleBtn.on('pointerdown', () => {
      SoundManager.playClick();
      this.scene.start('GameScene', { worldId: 'witch_forest', missionNumber: 1 });
    });

    // 3. Info-Pill: RTS 2.5D Prototyp
    this.add.text(GAME_WIDTH / 2, 54, '⭐ STARCRAFT II RTS PROTOTYP • 2.5D ISOMETRIE • 60 FPS ⭐', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(45);
  }

  public update(time: number, delta: number): void {
    // 1. Radar-Abtastlinie rotieren
    if (this.radarSweepLine) {
      const angle = (time / 1000) * 2;
      const rx = 159;
      const ry = GAME_HEIGHT - 160 + 80;
      this.radarSweepLine.setTo(rx, ry, rx + Math.cos(angle) * 44, ry + Math.sin(angle) * 44);
    }

    // 2. Einheiten auf Pfad bewegen & Schilde aktualisieren
    for (let i = this.units.length - 1; i >= 0; i--) {
      const u = this.units[i];
      u.pathDistance += (u.speed * (delta / 1000)) / this.pathCurve.getLength();

      if (u.pathDistance >= 1) {
        u.container.destroy();
        this.units.splice(i, 1);
        continue;
      }

      const pos = this.pathCurve.getPoint(u.pathDistance);
      u.container.setPosition(pos.x, pos.y);
      u.container.setDepth(20 + Math.floor(pos.y / 10));

      // Schwebende Einheiten sanft wippen lassen
      if (u.type === 'skimmer') {
        const bob = Math.sin(time / 200 + i) * 3;
        u.sprite.setY(u.altitudeOffset + bob);
      }

      // StarCraft II Schild- (Cyan) & HP-Balken (Grün)
      u.shieldBarFill.clear();
      u.hpBarFill.clear();
      const bw = 32;
      const bh = 3;
      const by = u.altitudeOffset - 22;

      // Schild
      if (u.maxShield > 0) {
        const sRatio = Phaser.Math.Clamp(u.shield / u.maxShield, 0, 1);
        u.shieldBarFill.fillStyle(0x000000, 0.7);
        u.shieldBarFill.fillRect(-bw / 2 - 1, by - 4, bw + 2, bh + 1);
        u.shieldBarFill.fillStyle(0x38bdf8, 1);
        u.shieldBarFill.fillRect(-bw / 2, by - 3, bw * sRatio, bh - 1);
      }

      // HP
      const hpRatio = Phaser.Math.Clamp(u.hp / u.maxHp, 0, 1);
      u.hpBarFill.fillStyle(0x000000, 0.7);
      u.hpBarFill.fillRect(-bw / 2 - 1, by, bw + 2, bh + 1);
      const hpColor = hpRatio > 0.5 ? 0x22c55e : (hpRatio > 0.25 ? 0xeab308 : 0xef4444);
      u.hpBarFill.fillStyle(hpColor, 1);
      u.hpBarFill.fillRect(-bw / 2, by + 1, bw * hpRatio, bh - 1);
    }

    // 3. Turm-Zielerfassung & 3D-Drehung
    for (const t of this.towers) {
      let target: RTSUnit | null = null;
      let closestDist = t.range;

      for (const u of this.units) {
        const d = Math.hypot(u.container.x - t.container.x, u.container.y - t.container.y);
        if (d < closestDist) {
          closestDist = d;
          target = u;
        }
      }

      t.target = target;

      if (target) {
        // Turm sanft in Richtung Ziel drehen
        const angle = Phaser.Math.Angle.Between(t.container.x, t.container.y, target.container.x, target.container.y);
        t.turret.setRotation(angle);

        // Schießen
        if (time - t.lastFired >= t.fireCooldown) {
          t.lastFired = time;
          this.fireRTSTower(t, target);
        }
      }
    }
  }

  private fireRTSTower(tower: RTSTower, target: RTSUnit): void {
    tower.kills++;

    if (tower.type === 'cannon') {
      // 1. Gauss-Artillerie: Doppelrohr-Rückstoß & Mündungsrauch
      this.tweens.add({
        targets: tower.turret,
        x: -Math.cos(tower.turret.rotation) * 6,
        y: -Math.sin(tower.turret.rotation) * 6,
        duration: 80,
        yoyo: true
      });

      // Fliegendes Plasma-Geschoss
      const bullet = this.add.circle(tower.container.x, tower.container.y - 6, 4, 0xf97316).setDepth(28);
      this.tweens.add({
        targets: bullet,
        x: target.container.x,
        y: target.container.y,
        duration: 220,
        onComplete: () => {
          bullet.destroy();
          this.spawnRTSExplosion(target.container.x, target.container.y);
          this.applyRTSDamage(target, tower.damage);
        }
      });
    } else if (tower.type === 'tesla') {
      // 2. Plasma-Pylon: Lichtbogen-Laser
      const beam = this.add.graphics().setDepth(30);
      beam.lineStyle(3, 0x38bdf8, 1);
      beam.lineBetween(tower.container.x, tower.container.y - 18, target.container.x, target.container.y);
      beam.lineStyle(1.5, 0xffffff, 1);
      beam.lineBetween(tower.container.x, tower.container.y - 18, target.container.x, target.container.y);

      this.tweens.add({
        targets: beam,
        alpha: 0,
        duration: 160,
        onComplete: () => beam.destroy()
      });

      this.applyRTSDamage(target, tower.damage);
    } else if (tower.type === 'sniper') {
      // 3. Sentry Railgun: Zielerfassungs-Tracer
      const tracer = this.add.line(0, 0, tower.container.x, tower.container.y - 4, target.container.x, target.container.y, 0xef4444).setDepth(30);
      tracer.setLineWidth(2);
      this.tweens.add({
        targets: tracer,
        alpha: 0,
        duration: 100,
        onComplete: () => tracer.destroy()
      });

      this.applyRTSDamage(target, tower.damage);
    }
  }

  private applyRTSDamage(target: RTSUnit, amount: number): void {
    let dmg = amount;
    if (target.shield > 0) {
      if (target.shield >= dmg) {
        target.shield -= dmg;
        dmg = 0;
      } else {
        dmg -= target.shield;
        target.shield = 0;
      }
    }
    target.hp -= dmg;

    // Aufblitzen
    this.tweens.add({
      targets: target.sprite,
      alpha: 0.25,
      duration: 60,
      yoyo: true
    });

    if (target.hp <= 0) {
      const idx = this.units.indexOf(target);
      if (idx !== -1) {
        this.units.splice(idx, 1);
      }
      this.spawnRTSExplosion(target.container.x, target.container.y);
      target.container.destroy();
      this.minerals += 15;
      this.mineralsText.setText(`${this.minerals}`);
    }
  }

  private spawnRTSExplosion(x: number, y: number): void {
    // Stoßwellen-Ring
    const ring = this.add.circle(x, y, 6, 0xffffff, 0).setDepth(32);
    ring.setStrokeStyle(3, 0xf97316);
    this.tweens.add({
      targets: ring,
      scaleX: 3.5,
      scaleY: 3.5,
      alpha: 0,
      duration: 300,
      onComplete: () => ring.destroy()
    });

    // Funkenpartikel
    for (let i = 0; i < 6; i++) {
      const spark = this.add.circle(x, y, 2.5, 0xfde047, 1).setDepth(33);
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-25, 25),
        y: y + Phaser.Math.Between(-25, 25),
        alpha: 0,
        duration: 350,
        onComplete: () => spark.destroy()
      });
    }
  }
}
