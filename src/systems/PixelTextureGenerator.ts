import Phaser from 'phaser';

export class PixelTextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    const tm = scene.textures;

    const create = (key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
      if (tm.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx);
        const tex = tm.addCanvas(key, canvas);
        if (tex) {
          tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }
      }
    };

    // ==========================================
    // 1. HUD & SYSTEM ICONS
    // ==========================================
    create('icon_heart', 24, 24, (ctx) => {
      ctx.fillStyle = '#ff3838';
      ctx.beginPath();
      ctx.moveTo(12, 21);
      ctx.bezierCurveTo(3, 14, 2, 5, 7, 4);
      ctx.bezierCurveTo(11, 4, 12, 7, 12, 7);
      ctx.bezierCurveTo(12, 7, 13, 4, 17, 4);
      ctx.bezierCurveTo(22, 5, 21, 14, 12, 21);
      ctx.fill();
      ctx.fillStyle = '#ff9f9f';
      ctx.fillRect(7, 6, 3, 3);
    });

    create('icon_gold', 24, 24, (ctx) => {
      ctx.fillStyle = '#b7791f';
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef160';
      ctx.fillRect(8, 7, 3, 4);
      ctx.fillStyle = '#946014';
      ctx.fillRect(11, 7, 2, 10);
    });

    create('icon_wave', 24, 24, (ctx) => {
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(6, 4, 12, 11);
      ctx.fillRect(8, 15, 8, 5);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(8, 8, 3, 4);
      ctx.fillRect(13, 8, 3, 4);
      ctx.fillRect(10, 16, 1, 4);
      ctx.fillRect(13, 16, 1, 4);
    });

    create('icon_crystal', 24, 24, (ctx) => {
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(21, 10);
      ctx.lineTo(12, 22);
      ctx.lineTo(3, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#be2edd';
      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(19, 10);
      ctx.lineTo(12, 20);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 7, 3, 4);
    });

    create('icon_archer', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#feca57';
      ctx.fillRect(18, 4, 3, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 15, 16, 2);
    });

    create('icon_cannon', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#ee5253';
      ctx.fillRect(8, 10, 16, 12);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(12, 10, 2, 12);
    });

    create('icon_ice', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#48dbfb';
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(26, 16);
      ctx.lineTo(16, 28);
      ctx.lineTo(6, 16);
      ctx.closePath();
      ctx.fill();
    });

    create('icon_poison', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#10ac84';
      ctx.beginPath();
      ctx.arc(16, 18, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(14, 6, 4, 8);
    });

    create('icon_tesla', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#74b9ff';
      ctx.beginPath();
      ctx.arc(16, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(14, 18, 4, 10);
    });

    create('icon_sniper', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#636e72';
      ctx.fillRect(14, 4, 4, 24);
      ctx.fillStyle = '#e84118';
      ctx.fillRect(15, 3, 2, 3);
    });

    // ==========================================
    // 2. KARTEN-TILES (40x40)
    // ==========================================
    create('tile_grass', 40, 40, (ctx) => {
      ctx.fillStyle = '#3f6728';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#518233';
      ctx.fillRect(4, 4, 10, 8);
      ctx.fillRect(20, 20, 14, 10);
      ctx.fillStyle = '#77b244';
      ctx.fillRect(8, 12, 2, 4);
    });

    create('tile_dirt', 40, 40, (ctx) => {
      ctx.fillStyle = '#7e5330';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#654124';
      ctx.fillRect(8, 0, 4, 40);
      ctx.fillRect(28, 0, 4, 40);
    });

    create('tile_ground_witch', 40, 40, (ctx) => {
      // 1. Tiefe Moosbasis mit klarem Kachelrand für perfekte Orientierung
      ctx.fillStyle = '#172b1b';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#213f28';
      ctx.fillRect(1, 1, 38, 38);
      ctx.fillStyle = '#2b5234';
      ctx.fillRect(3, 3, 34, 34);

      // Moos-Textur & Lichtflecken
      ctx.fillStyle = '#376b44';
      ctx.fillRect(5, 5, 8, 7);
      ctx.fillRect(22, 18, 12, 10);
      ctx.fillRect(10, 24, 7, 7);
      ctx.fillStyle = '#488c59';
      ctx.fillRect(7, 6, 3, 3);
      ctx.fillRect(24, 20, 4, 3);

      // Magische Blüten & Leuchtsporen
      ctx.fillStyle = '#9b59b6';
      ctx.fillRect(16, 8, 2, 2);
      ctx.fillRect(30, 28, 2, 2);
      ctx.fillStyle = '#e056fd';
      ctx.fillRect(17, 8, 1, 1);
    });

    create('tile_path_witch', 40, 40, (ctx) => {
      // Magischer Holzbohlenweg mit Steinrand
      ctx.fillStyle = '#2c1e29';
      ctx.fillRect(0, 0, 40, 40);

      // Steineinfassung an den Rändern
      ctx.fillStyle = '#3f2d3d';
      ctx.fillRect(0, 0, 4, 40);
      ctx.fillRect(36, 0, 4, 40);

      // Holzbohlen (horizontal)
      const planks = [1, 11, 21, 31];
      planks.forEach((py) => {
        ctx.fillStyle = '#56384e';
        ctx.fillRect(5, py, 30, 8);
        ctx.fillStyle = '#6b4561';
        ctx.fillRect(6, py + 1, 28, 6);
        ctx.fillStyle = '#825577';
        ctx.fillRect(8, py + 1, 12, 2);
        // Holznägel
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(8, py + 3, 2, 2);
        ctx.fillRect(28, py + 3, 2, 2);
      });
    });

    create('tile_decor_witch', 40, 40, (ctx) => {
      // Leuchtende Hexenpilze mit Biolumineszenz
      ctx.fillStyle = '#f5f0e6';
      ctx.fillRect(18, 20, 5, 14); // Stiel
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath();
      ctx.arc(20, 20, 14, Math.PI, 0); // Kappe
      ctx.fill();
      ctx.fillStyle = '#be2edd';
      ctx.beginPath();
      ctx.arc(20, 18, 11, Math.PI, 0);
      ctx.fill();
      // Leuchtpunkte
      ctx.fillStyle = '#55efc4';
      ctx.fillRect(13, 13, 3, 3);
      ctx.fillRect(22, 11, 4, 3);
      ctx.fillRect(18, 15, 3, 2);
      // Kleiner Nachbarpilz
      ctx.fillStyle = '#e84393';
      ctx.beginPath();
      ctx.arc(10, 28, 6, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f5f0e6';
      ctx.fillRect(9, 28, 3, 6);
    });

    create('tile_ground_cave', 40, 40, (ctx) => {
      // Tiefer Schieferboden mit Kristalladern
      ctx.fillStyle = '#14151b';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#1e212b';
      ctx.fillRect(1, 1, 38, 38);
      ctx.fillStyle = '#262a37';
      ctx.fillRect(3, 3, 34, 34);

      // Steintextur
      ctx.fillStyle = '#34394a';
      ctx.fillRect(4, 4, 14, 12);
      ctx.fillRect(20, 20, 16, 14);

      // Glänzende Golderz- & Azurit-Adern
      ctx.fillStyle = '#00d2d3';
      ctx.fillRect(8, 24, 3, 2);
      ctx.fillRect(11, 26, 4, 2);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(26, 8, 3, 2);
      ctx.fillRect(28, 10, 2, 3);
    });

    create('tile_path_cave', 40, 40, (ctx) => {
      // Unterirdische Lorenschienen auf Schotterbett
      ctx.fillStyle = '#201b17';
      ctx.fillRect(0, 0, 40, 40);

      // Schottersteine
      ctx.fillStyle = '#38312b';
      ctx.fillRect(3, 3, 34, 34);

      // Holzschwellen
      const ties = [2, 12, 22, 32];
      ties.forEach((ty) => {
        ctx.fillStyle = '#4e3a2b';
        ctx.fillRect(4, ty, 32, 6);
        ctx.fillStyle = '#654b38';
        ctx.fillRect(6, ty + 1, 28, 4);
      });

      // Stahlschienen (vertikal verlaufend)
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(10, 0, 4, 40);
      ctx.fillRect(26, 0, 4, 40);
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(11, 0, 2, 40);
      ctx.fillRect(27, 0, 2, 40);
    });

    create('tile_decor_cave', 40, 40, (ctx) => {
      // Leuchtende Höhlen-Kristallformation
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(29, 32);
      ctx.lineTo(11, 32);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(24, 32);
      ctx.lineTo(16, 32);
      ctx.closePath();
      ctx.fill();

      // Kleiner Nebenkristall
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.moveTo(11, 16);
      ctx.lineTo(16, 34);
      ctx.lineTo(6, 34);
      ctx.closePath();
      ctx.fill();
    });

    create('tile_ground_mountain', 40, 40, (ctx) => {
      // Basaltfelsen mit glühenden Magma-Rissen
      ctx.fillStyle = '#140b0d';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#211316';
      ctx.fillRect(1, 1, 38, 38);
      ctx.fillStyle = '#2c191d';
      ctx.fillRect(3, 3, 34, 34);

      // Felsrelief
      ctx.fillStyle = '#3a2026';
      ctx.fillRect(6, 6, 12, 12);
      ctx.fillRect(20, 18, 14, 16);

      // Glühende Lava-Adern
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(4, 24, 8, 2);
      ctx.fillRect(10, 26, 10, 2);
      ctx.fillRect(24, 8, 10, 2);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(6, 24, 4, 1);
      ctx.fillRect(12, 26, 6, 1);
      ctx.fillRect(26, 8, 6, 1);
    });

    create('tile_path_mountain', 40, 40, (ctx) => {
      // Obsidian-Weg mit Magmagraben
      ctx.fillStyle = '#1f0d0d';
      ctx.fillRect(0, 0, 40, 40);

      // Fließende Lava an den Seiten
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(1, 0, 4, 40);
      ctx.fillRect(35, 0, 4, 40);
      ctx.fillStyle = '#ffa502';
      ctx.fillRect(2, 0, 2, 40);
      ctx.fillRect(36, 0, 2, 40);

      // Dunkle Obsidian-Platten
      const slabs = [2, 12, 22, 32];
      slabs.forEach((sy) => {
        ctx.fillStyle = '#331a1f';
        ctx.fillRect(6, sy, 28, 8);
        ctx.fillStyle = '#48252b';
        ctx.fillRect(8, sy + 1, 24, 6);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(14, sy + 3, 2, 2);
      });
    });

    create('tile_decor_mountain', 40, 40, (ctx) => {
      // Rauchender Vulkanschlot
      ctx.fillStyle = '#1a0c0e';
      ctx.beginPath();
      ctx.moveTo(10, 34);
      ctx.lineTo(15, 12);
      ctx.lineTo(25, 12);
      ctx.lineTo(30, 34);
      ctx.closePath();
      ctx.fill();

      // Magmakrater
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(15, 10, 10, 5);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(17, 11, 6, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(19, 12, 2, 1);
    });

    // ==========================================
    // WEHENDES GRAS & AMBIENTE-DEKORATIONEN
    // ==========================================
    create('decor_grass_tuft_1', 24, 24, (ctx) => {
      // Zartes Grasbüschel (Basis bei y=23)
      ctx.fillStyle = '#2ed573';
      // Halm 1 (links)
      ctx.fillRect(6, 12, 2, 11);
      ctx.fillRect(4, 7, 2, 6);
      // Halm 2 (mitte)
      ctx.fillRect(11, 6, 2, 17);
      ctx.fillRect(10, 2, 2, 5);
      // Halm 3 (rechts)
      ctx.fillRect(16, 10, 2, 13);
      ctx.fillRect(18, 5, 2, 6);
      // Glanzlichter
      ctx.fillStyle = '#7bed9f';
      ctx.fillRect(11, 4, 1, 8);
      ctx.fillRect(5, 8, 1, 6);
    });

    create('decor_grass_tuft_2', 24, 24, (ctx) => {
      // Dichtes Gras mit kleiner Berg-Blume
      ctx.fillStyle = '#26af5f';
      ctx.fillRect(4, 10, 2, 13);
      ctx.fillRect(9, 5, 2, 18);
      ctx.fillRect(14, 8, 2, 15);
      ctx.fillRect(18, 12, 2, 11);
      // Blüte
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(13, 3, 4, 4);
      ctx.fillStyle = '#ff3f34';
      ctx.fillRect(14, 4, 2, 2);
    });

    create('decor_grass_tuft_3', 24, 24, (ctx) => {
      // Wilder Busch / Farn
      ctx.fillStyle = '#1e824c';
      ctx.fillRect(3, 14, 3, 9);
      ctx.fillRect(8, 7, 3, 16);
      ctx.fillRect(13, 10, 3, 13);
      ctx.fillRect(18, 16, 3, 7);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(9, 8, 1, 7);
    });

    // ==========================================
    // TITEL-PANORAMA-HINTERGRUND (RETRO FANTASY)
    // ==========================================
    create('bg_menu_panorama', 1280, 720, (ctx) => {
      // 1. Himmel mit stimmungsvollem Farbverlauf
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 720);
      skyGrad.addColorStop(0, '#0a0714');
      skyGrad.addColorStop(0.35, '#15102a');
      skyGrad.addColorStop(0.65, '#28133d');
      skyGrad.addColorStop(0.85, '#4a1d47');
      skyGrad.addColorStop(1.0, '#1d0c24');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // 2. Sterne
      ctx.fillStyle = '#ffffff';
      const starCoords = [
        [120, 45], [240, 80], [380, 35], [510, 110], [640, 60],
        [790, 40], [920, 95], [1050, 50], [1180, 85], [160, 140],
        [310, 160], [450, 190], [700, 170], [860, 150], [1120, 130]
      ];
      starCoords.forEach(([sx, sy]) => {
        ctx.fillRect(sx, sy, 2, 2);
        ctx.fillStyle = 'rgba(255, 235, 167, 0.4)';
        ctx.fillRect(sx - 1, sy, 4, 2);
        ctx.fillRect(sx, sy - 1, 2, 4);
        ctx.fillStyle = '#ffffff';
      });

      // 3. Mystischer Mond
      const moonX = 1040;
      const moonY = 140;
      const moonRadius = 65;
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonRadius);
      moonGrad.addColorStop(0, '#fffbf0');
      moonGrad.addColorStop(0.7, '#f6e58d');
      moonGrad.addColorStop(1, '#eccc68');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Mondkrater
      ctx.fillStyle = 'rgba(214, 162, 59, 0.25)';
      ctx.beginPath();
      ctx.arc(moonX - 20, moonY - 15, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(moonX + 22, moonY + 12, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(moonX - 12, moonY + 28, 12, 0, Math.PI * 2);
      ctx.fill();

      // Mond-Aura
      ctx.strokeStyle = 'rgba(246, 229, 141, 0.2)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius + 8, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Entfernte Bergketten (Parallax-Schichten)
      // Schicht 1 (fern, lila-blau)
      ctx.fillStyle = '#1d1733';
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(180, 360);
      ctx.lineTo(340, 440);
      ctx.lineTo(520, 320);
      ctx.lineTo(740, 460);
      ctx.lineTo(920, 350);
      ctx.lineTo(1120, 440);
      ctx.lineTo(1280, 370);
      ctx.lineTo(1280, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();

      // Schicht 2 (mittlere Gebirgszüge, dunkler)
      ctx.fillStyle = '#171128';
      ctx.beginPath();
      ctx.moveTo(0, 530);
      ctx.lineTo(120, 450);
      ctx.lineTo(280, 520);
      ctx.lineTo(440, 410);
      ctx.lineTo(620, 510);
      ctx.lineTo(840, 420);
      ctx.lineTo(1020, 500);
      ctx.lineTo(1200, 430);
      ctx.lineTo(1280, 490);
      ctx.lineTo(1280, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();

      // 5. Epische Turm-Festung auf einem Felsplateau (links)
      const fortressBaseX = 140;
      const fortressBaseY = 560;

      // Felsklippe
      ctx.fillStyle = '#0f0a1c';
      ctx.beginPath();
      ctx.moveTo(0, 570);
      ctx.lineTo(260, 540);
      ctx.lineTo(320, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();

      // Großer Wehrturm
      ctx.fillStyle = '#1a132c';
      ctx.fillRect(100, 320, 80, 240);
      // Zinnen
      ctx.fillRect(92, 305, 96, 16);
      ctx.fillStyle = '#0f0a1c';
      ctx.fillRect(112, 305, 12, 10);
      ctx.fillRect(144, 305, 12, 10);
      ctx.fillRect(176, 305, 12, 10);
      // Turmspitze (Spitzdach)
      ctx.fillStyle = '#2c1e48';
      ctx.beginPath();
      ctx.moveTo(140, 240);
      ctx.lineTo(190, 305);
      ctx.lineTo(90, 305);
      ctx.closePath();
      ctx.fill();

      // Leuchtender Magiekristall auf der Turmspitze
      ctx.fillStyle = '#55efc4';
      ctx.beginPath();
      ctx.moveTo(140, 215);
      ctx.lineTo(146, 230);
      ctx.lineTo(140, 245);
      ctx.lineTo(134, 230);
      ctx.closePath();
      ctx.fill();

      // Erleuchtete Bogenfenster
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(132, 350, 16, 24);
      ctx.fillRect(132, 410, 16, 24);
      ctx.fillRect(132, 470, 16, 24);

      // 6. Vordergrund-Plateau (unten)
      ctx.fillStyle = '#0d0818';
      ctx.beginPath();
      ctx.moveTo(0, 640);
      ctx.lineTo(400, 610);
      ctx.lineTo(880, 630);
      ctx.lineTo(1280, 600);
      ctx.lineTo(1280, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();

      // Zarte Nebelstreifen über dem Tal
      ctx.fillStyle = 'rgba(74, 29, 71, 0.35)';
      ctx.fillRect(0, 520, 1280, 25);
      ctx.fillStyle = 'rgba(224, 86, 253, 0.12)';
      ctx.fillRect(0, 560, 1280, 30);
    });

    create('tile_runestone', 40, 40, (ctx) => {
      // Magischer Runen-Bauplatz (+20% Reichweite)
      ctx.fillStyle = '#151324';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#28233b';
      ctx.fillRect(4, 4, 32, 32);

      // Leuchtender Runenkreis
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(20, 20, 13, 0, Math.PI * 2);
      ctx.stroke();

      // Zentraler Gold-Fokus
      ctx.fillStyle = '#ffd13b';
      ctx.fillRect(18, 18, 4, 4);

      // 4 Runen-Ecken
      ctx.fillStyle = '#55efc4';
      ctx.fillRect(8, 8, 3, 3);
      ctx.fillRect(29, 8, 3, 3);
      ctx.fillRect(8, 29, 3, 3);
      ctx.fillRect(29, 29, 3, 3);
    });

    create('tile_portal', 40, 40, (ctx) => {
      ctx.fillStyle = '#110b1a';
      ctx.fillRect(2, 2, 36, 36);
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath();
      ctx.arc(20, 20, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 18, 4, 4);
    });

    create('tile_castle', 40, 40, (ctx) => {
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(2, 6, 36, 30);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(6, 0, 6, 6);
      ctx.fillRect(17, 0, 6, 6);
      ctx.fillRect(28, 0, 6, 6);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(16, 16, 8, 10);
    });

    // ==========================================
    // 3. ALLE GEGNER-SPRITES
    // ==========================================
    create('enemy_goblin', 32, 32, (ctx) => {
      ctx.fillStyle = '#4c8c30';
      ctx.fillRect(11, 14, 10, 10);
      ctx.fillStyle = '#5cb038';
      ctx.fillRect(10, 6, 12, 9);
      ctx.fillStyle = '#e53935';
      ctx.fillRect(12, 9, 2, 2);
      ctx.fillRect(18, 9, 2, 2);
    });

    create('enemy_bat', 32, 32, (ctx) => {
      ctx.fillStyle = '#2c1b3d';
      ctx.beginPath();
      ctx.moveTo(14, 14);
      ctx.lineTo(2, 6);
      ctx.lineTo(4, 18);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(18, 14);
      ctx.lineTo(30, 6);
      ctx.lineTo(28, 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1e142b';
      ctx.fillRect(13, 10, 6, 10);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(14, 12, 1, 2);
      ctx.fillRect(17, 12, 1, 2);
    });

    create('enemy_witch', 32, 32, (ctx) => {
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(4, 21, 24, 3);
      ctx.fillStyle = '#6c5ce7';
      ctx.fillRect(10, 10, 12, 12);
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.moveTo(16, 2);
      ctx.lineTo(24, 10);
      ctx.lineTo(8, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#55efc4';
      ctx.fillRect(12, 10, 8, 5);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(14, 11, 2, 2);
      ctx.fillRect(18, 11, 2, 2);
    });

    create('enemy_slime', 32, 32, (ctx) => {
      ctx.fillStyle = '#00b894';
      ctx.beginPath();
      ctx.arc(16, 20, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(6, 20, 20, 6);
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(10, 16, 3, 3);
      ctx.fillRect(19, 16, 3, 3);
    });

    create('enemy_swamp_troll', 32, 32, (ctx) => {
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(7, 10, 18, 15);
      ctx.fillStyle = '#006266';
      ctx.fillRect(9, 12, 14, 12);
      ctx.fillStyle = '#ff7675';
      ctx.fillRect(11, 14, 3, 2);
      ctx.fillRect(18, 14, 3, 2);
    });

    create('enemy_cave_goblin', 32, 32, (ctx) => {
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(10, 12, 12, 10);
      ctx.fillStyle = '#b8e994';
      ctx.fillRect(11, 6, 10, 7);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(10, 4, 12, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 2, 4, 3);
    });

    create('enemy_bomber', 32, 32, (ctx) => {
      ctx.fillStyle = '#636e72';
      ctx.fillRect(11, 14, 10, 9);
      ctx.fillStyle = '#d63031';
      ctx.beginPath();
      ctx.arc(16, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(15, 0, 2, 4);
    });

    create('enemy_orc', 32, 32, (ctx) => {
      ctx.fillStyle = '#4a5438';
      ctx.fillRect(8, 12, 16, 12);
      ctx.fillStyle = '#3a6634';
      ctx.fillRect(10, 4, 12, 9);
      ctx.fillStyle = '#4a4f56';
      ctx.fillRect(9, 3, 14, 4);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(12, 7, 2, 2);
      ctx.fillRect(18, 7, 2, 2);
    });

    create('enemy_armored_troll', 32, 32, (ctx) => {
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(6, 8, 20, 18);
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(10, 12, 12, 8);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(12, 9, 2, 2);
      ctx.fillRect(18, 9, 2, 2);
    });

    create('enemy_golem', 32, 32, (ctx) => {
      ctx.fillStyle = '#4c5057';
      ctx.fillRect(5, 8, 22, 15);
      ctx.fillStyle = '#676c75';
      ctx.fillRect(7, 10, 18, 11);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(12, 5, 2, 2);
      ctx.fillRect(18, 5, 2, 2);
    });

    create('enemy_fire_imp', 32, 32, (ctx) => {
      ctx.fillStyle = '#d63031';
      ctx.fillRect(11, 12, 10, 10);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(9, 4, 4, 6);
      ctx.fillRect(19, 4, 4, 6);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(13, 13, 2, 2);
      ctx.fillRect(17, 13, 2, 2);
    });

    create('enemy_magma_orc', 32, 32, (ctx) => {
      ctx.fillStyle = '#2c0c0c';
      ctx.fillRect(8, 10, 16, 14);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(10, 12, 12, 10);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(12, 14, 8, 4);
    });

    create('enemy_hellhound', 32, 32, (ctx) => {
      ctx.fillStyle = '#1e0505';
      ctx.fillRect(4, 14, 24, 10);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(6, 16, 20, 6);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(20, 13, 3, 2);
    });

    create('enemy_lava_golem', 36, 36, (ctx) => {
      ctx.fillStyle = '#110505';
      ctx.fillRect(4, 8, 28, 20);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(8, 10, 20, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 14, 8, 8);
    });

    create('enemy_boss', 36, 36, (ctx) => {
      ctx.fillStyle = '#3a1f13';
      ctx.fillRect(6, 6, 24, 24);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(9, 10, 18, 14);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(13, 8, 2, 2);
      ctx.fillRect(21, 8, 2, 2);
      ctx.fillStyle = '#e8d8b5';
      ctx.fillRect(4, 2, 4, 6);
      ctx.fillRect(28, 2, 4, 6);
    });

    // ==========================================
    // 4. PROJEKTILE & EFFEKTE
    // ==========================================
    create('proj_arrow', 18, 6, (ctx) => {
      ctx.fillStyle = '#8d5b2d';
      ctx.fillRect(2, 2, 12, 2);
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(14, 1, 4, 4);
      ctx.fillStyle = '#e53935';
      ctx.fillRect(0, 0, 3, 2);
      ctx.fillRect(0, 4, 3, 2);
    });

    create('proj_cannonball', 12, 12, (ctx) => {
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 3, 2, 2);
    });

    create('proj_ice', 14, 14, (ctx) => {
      ctx.fillStyle = '#00bcd4';
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(14, 7);
      ctx.lineTo(7, 14);
      ctx.lineTo(0, 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e0f7fa';
      ctx.fillRect(5, 5, 4, 4);
    });

    create('proj_poison', 12, 12, (ctx) => {
      ctx.fillStyle = '#10ac84';
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1dd1a1';
      ctx.fillRect(4, 4, 3, 3);
    });

    create('proj_tesla', 16, 16, (ctx) => {
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(2, 6, 12, 4);
      ctx.fillStyle = '#74b9ff';
      ctx.fillRect(5, 3, 6, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 5, 2, 6);
    });

    create('proj_sniper', 20, 6, (ctx) => {
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(0, 2, 20, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 1, 4, 4);
    });

    create('effect_hit', 16, 16, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 0, 4, 16);
      ctx.fillRect(0, 6, 16, 4);
    });

    create('effect_explosion', 48, 48, (ctx) => {
      ctx.fillStyle = 'rgba(255, 87, 34, 0.6)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd13b';
      ctx.beginPath();
      ctx.arc(24, 24, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    create('effect_frost', 48, 48, (ctx) => {
      ctx.fillStyle = 'rgba(79, 195, 247, 0.45)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(23, 8, 2, 32);
      ctx.fillRect(8, 23, 32, 2);
    });

    create('effect_poison', 48, 48, (ctx) => {
      ctx.fillStyle = 'rgba(16, 172, 132, 0.45)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1dd1a1';
      ctx.fillRect(18, 18, 12, 12);
    });

    create('effect_lightning', 48, 48, (ctx) => {
      ctx.strokeStyle = '#74b9ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(4, 24);
      ctx.lineTo(24, 10);
      ctx.lineTo(44, 24);
      ctx.stroke();
    });

    // ==========================================
    // 5. TÜRMER-DESIGNS (EXAKT 3 AUSBAUSTUFEN PRO TURM)
    // Stufe 1 = Gelbgold-Akzente
    // Stufe 2 = Orange-Bronze-Akzente
    // Stufe 3 = Rubin-Feuerrot-Akzente
    // Gleiches Grundmodell je Turm!
    // ==========================================
    const towerTypes = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];

    const tierColors: Record<number, { accent: string; highlight: string; baseBorder: string; banner: string }> = {
      1: { accent: '#f1c40f', highlight: '#fef160', baseBorder: '#e67e22', banner: '#f39c12' }, // Stufe 1: Gelb
      2: { accent: '#ff793f', highlight: '#ffb142', baseBorder: '#d35400', banner: '#e55039' }, // Stufe 2: Orange
      3: { accent: '#ff3838', highlight: '#ff7675', baseBorder: '#c0392b', banner: '#d63031' }  // Stufe 3: Rot
    };

    towerTypes.forEach((type) => {
      for (let lvl = 1; lvl <= 3; lvl++) {
        const key = `tower_${type}_${lvl}`;
        const theme = tierColors[lvl];

        create(key, 40, 40, (ctx) => {
          // Solides, edles Stein-Fundament (identisch für alle Stufen)
          ctx.fillStyle = '#1e1c26';
          ctx.fillRect(4, 16, 32, 20);
          ctx.fillStyle = '#2f2b3d';
          ctx.fillRect(6, 18, 28, 16);

          // Stufen-Plakette & Zierstreifen (Gelb -> Orange -> Rot)
          ctx.fillStyle = theme.accent;
          ctx.fillRect(4, 33, 32, 3);
          ctx.fillStyle = theme.highlight;
          ctx.fillRect(8, 33, 24, 1);

          // Stufe 2 & 3 erhalten Eck-Verstärkungen
          if (lvl >= 2) {
            ctx.fillStyle = theme.accent;
            ctx.fillRect(4, 20, 3, 13);
            ctx.fillRect(33, 20, 3, 13);
          }
          if (lvl === 3) {
            ctx.fillStyle = '#ffd13b';
            ctx.fillRect(18, 22, 4, 4); // Zentraler Gold-Inlay
          }

          // Spezifischer Turm-Aufbau (GLEICHES DESIGN, FARBE WANDELT SICH GELB->ORANGE->ROT)
          if (type === 'archer') {
            // Schützen-Brüstung & Bogenschütze
            ctx.fillStyle = '#4a3728';
            ctx.fillRect(12, 10, 16, 12);
            ctx.fillStyle = '#27ae60'; // Grünes Wams
            ctx.fillRect(16, 8, 8, 8);
            ctx.fillStyle = '#f5c398'; // Gesicht
            ctx.fillRect(18, 9, 4, 3);

            // Bogen mit Stufen-Farbe!
            ctx.fillStyle = theme.accent;
            ctx.fillRect(24, 4, 3, 16);
            ctx.fillStyle = theme.highlight;
            ctx.fillRect(23, 6, 1, 12);

            // Zinnen-Krone (Gelb / Orange / Rot)
            ctx.fillStyle = theme.banner;
            ctx.fillRect(10, 8, 4, 5);
            ctx.fillRect(26, 8, 4, 5);
          } else if (type === 'cannon') {
            // Schwere Kanone auf Drehkranz
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(12, 8, 16, 14);

            // Eisenrohr
            ctx.fillStyle = '#1a1a24';
            ctx.fillRect(14, 5, 12, 18);
            ctx.fillStyle = '#34495e';
            ctx.fillRect(15, 6, 4, 16);

            // Mündungs-Ring mit Stufen-Farbe!
            ctx.fillStyle = theme.accent;
            ctx.fillRect(13, 3, 14, 4);
            ctx.fillStyle = theme.highlight;
            ctx.fillRect(14, 4, 12, 2);

            // Nietenband
            ctx.fillStyle = theme.banner;
            ctx.fillRect(14, 12, 12, 2);
          } else if (type === 'ice') {
            // Eiskristall-Obelisk
            ctx.fillStyle = '#0984e3';
            ctx.fillRect(16, 12, 8, 12);

            // Großer schwebender Diamant
            ctx.fillStyle = '#74b9ff';
            ctx.beginPath();
            ctx.moveTo(20, 2);
            ctx.lineTo(29, 14);
            ctx.lineTo(20, 24);
            ctx.lineTo(11, 14);
            ctx.closePath();
            ctx.fill();

            // Kristall-Facette in Stufen-Farbe!
            ctx.fillStyle = theme.accent;
            ctx.fillRect(18, 10, 4, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(19, 11, 2, 4);

            // Halterung
            ctx.fillStyle = theme.banner;
            ctx.fillRect(14, 18, 12, 2);
          } else if (type === 'poison') {
            // Alchemie-Turm mit Glaskolben
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(12, 12, 16, 10);

            // Kolben
            ctx.fillStyle = '#00b894';
            ctx.beginPath();
            ctx.arc(20, 14, 9, 0, Math.PI * 2);
            ctx.fill();

            // Reagenzflüssigkeit in Stufen-Farbe!
            ctx.fillStyle = theme.accent;
            ctx.beginPath();
            ctx.arc(20, 15, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = theme.highlight;
            ctx.fillRect(18, 5, 4, 6); // Schornstein
          } else if (type === 'tesla') {
            // Spulenturm mit Entlade-Sphäre
            ctx.fillStyle = '#2d3436';
            ctx.fillRect(18, 12, 4, 12);

            // Kupferringe
            ctx.fillStyle = '#b33939';
            ctx.fillRect(16, 14, 8, 2);
            ctx.fillRect(16, 18, 8, 2);

            // Entlade-Kugel mit Stufen-Farbe!
            ctx.fillStyle = theme.accent;
            ctx.beginPath();
            ctx.arc(20, 8, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = theme.highlight;
            ctx.fillRect(18, 6, 4, 4);
          } else if (type === 'sniper') {
            // Wehrturm mit Hochpräzisionslauf
            ctx.fillStyle = '#2d3436';
            ctx.fillRect(12, 10, 16, 12);

            // Langer Scharfschützenlauf
            ctx.fillStyle = '#636e72';
            ctx.fillRect(18, 0, 4, 18);

            // Zielvisier-Laser mit Stufen-Farbe!
            ctx.fillStyle = theme.accent;
            ctx.fillRect(17, 0, 6, 3);
            ctx.fillStyle = theme.highlight;
            ctx.fillRect(19, 0, 2, 2);

            // Stabilisator
            ctx.fillStyle = theme.banner;
            ctx.fillRect(14, 14, 12, 2);
          }

          // Stufen-Indikator unten: 1, 2 oder 3 Quadrate
          ctx.fillStyle = theme.accent;
          for (let p = 0; p < lvl; p++) {
            ctx.fillRect(14 + p * 5, 27, 4, 4);
          }
        });
      }

      // Spezielle Stufe-4-Pfade (Pfad A = Smaragd/Cyan, Pfad B = Purpur/Gold)
      const specThemes: Record<'spec_a' | 'spec_b', { accent: string; highlight: string; rune: string; name: string }> = {
        spec_a: { accent: '#00d2d3', highlight: '#55efc4', rune: '#10ac84', name: 'Path A' },
        spec_b: { accent: '#9b59b6', highlight: '#e056fd', rune: '#ffd13b', name: 'Path B' }
      };

      (['spec_a', 'spec_b'] as const).forEach((specKey) => {
        const key = `tower_${type}_${specKey}`;
        const theme = specThemes[specKey];

        create(key, 40, 40, (ctx) => {
          // Fundament mit leuchtenden Meisterrunen
          ctx.fillStyle = '#120f1c';
          ctx.fillRect(4, 16, 32, 20);
          ctx.fillStyle = '#221c33';
          ctx.fillRect(6, 18, 28, 16);

          // Leuchtbänder
          ctx.fillStyle = theme.accent;
          ctx.fillRect(4, 33, 32, 3);
          ctx.fillStyle = theme.highlight;
          ctx.fillRect(6, 33, 28, 1);

          // Eck-Runenpfeiler
          ctx.fillStyle = theme.accent;
          ctx.fillRect(4, 18, 3, 15);
          ctx.fillRect(33, 18, 3, 15);

          // Magische Runenmatrix im Sockel
          ctx.fillStyle = theme.rune;
          ctx.fillRect(14, 23, 12, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(18, 24, 4, 4);

          // Turmaufbau je nach Typ
          if (type === 'archer') {
            ctx.fillStyle = '#3a2719';
            ctx.fillRect(12, 8, 16, 14);
            ctx.fillStyle = theme.accent;
            ctx.fillRect(23, 2, 4, 18); // Doppelsehnen-Bogen
            ctx.fillRect(20, 4, 2, 14);
            ctx.fillStyle = theme.highlight;
            ctx.fillRect(25, 4, 2, 14);
          } else if (type === 'cannon') {
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(10, 6, 20, 16);
            ctx.fillStyle = theme.accent;
            ctx.fillRect(18, 0, 8, 16); // Zwillingslauf
            ctx.fillStyle = theme.highlight;
            ctx.fillRect(20, 0, 4, 4);
          } else if (type === 'ice') {
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(12, 12, 16, 10);
            ctx.fillStyle = theme.accent;
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(28, 14);
            ctx.lineTo(12, 14);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(18, 4, 4, 6);
          } else if (type === 'poison') {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(12, 14, 16, 10);
            ctx.fillStyle = theme.accent;
            ctx.beginPath();
            ctx.arc(20, 10, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(18, 8, 4, 4);
          } else if (type === 'tesla') {
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(16, 10, 8, 14);
            ctx.fillStyle = theme.accent;
            ctx.beginPath();
            ctx.arc(20, 6, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(18, 4, 4, 4);
          } else if (type === 'sniper') {
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(12, 8, 16, 14);
            ctx.fillStyle = theme.accent;
            ctx.fillRect(18, -3, 4, 20); // Extralanger Rail-Lauf
            ctx.fillStyle = theme.highlight;
            ctx.fillRect(17, -3, 6, 4);
          }

          // Spezifisches 4-Punkte-Meister-Emblem
          ctx.fillStyle = theme.highlight;
          ctx.fillRect(13, 30, 3, 3);
          ctx.fillRect(17, 30, 3, 3);
          ctx.fillRect(21, 30, 3, 3);
          ctx.fillRect(25, 30, 3, 3);
        });
      });
    });
  }
}
