import Phaser from 'phaser';

/**
 * PixelTextureGenerator
 * Erzeugt programmatisch hochwertige 16-Bit-Pixel-Art-Grafiken direkt zur Laufzeit.
 * Vollkommen autark ohne externe Asset-Downloads.
 */
export class PixelTextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    const tm = scene.textures;

    // Helper: neues Canvas erstellen und mit Skalierung zeichnen
    const create = (key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
      if (tm.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx);
        tm.addCanvas(key, canvas);
      }
    };

    // 1. TILES (40x40)
    // Gras-Tile
    create('tile_grass', 40, 40, (ctx) => {
      ctx.fillStyle = '#3f6728';
      ctx.fillRect(0, 0, 40, 40);

      // Gras-Nuancen
      ctx.fillStyle = '#375b22';
      for (let i = 0; i < 40; i += 4) {
        for (let j = 0; j < 40; j += 4) {
          if ((i * 3 + j * 7) % 5 === 0) ctx.fillRect(i, j, 4, 4);
        }
      }

      ctx.fillStyle = '#518233';
      for (let i = 0; i < 40; i += 8) {
        for (let j = 0; j < 40; j += 8) {
          if ((i + j) % 3 === 0) {
            ctx.fillRect(i + 2, j + 2, 2, 4);
            ctx.fillRect(i + 4, j + 4, 2, 2);
          }
        }
      }

      // Grashalme
      ctx.fillStyle = '#77b244';
      const blades = [[4, 6], [18, 12], [28, 6], [10, 24], [22, 30], [34, 22], [8, 36]];
      blades.forEach(([x, y]) => {
        ctx.fillRect(x, y + 2, 2, 4);
        ctx.fillRect(x + 2, y, 2, 6);
        ctx.fillRect(x + 4, y + 3, 2, 3);
      });

      // Winzige Blumen
      ctx.fillStyle = '#fce043';
      ctx.fillRect(14, 16, 2, 2);
      ctx.fillRect(32, 28, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(26, 8, 2, 2);
    });

    // Weg-Tile (Dirt)
    create('tile_dirt', 40, 40, (ctx) => {
      ctx.fillStyle = '#7e5330';
      ctx.fillRect(0, 0, 40, 40);

      // Schattierungen
      ctx.fillStyle = '#654124';
      for (let x = 0; x < 40; x += 4) {
        for (let y = 0; y < 40; y += 4) {
          if ((x * 5 + y * 11) % 4 === 0) ctx.fillRect(x, y, 4, 4);
        }
      }

      // Kieselsteine & Erdkörner
      ctx.fillStyle = '#9b6c43';
      const pebbles = [[6, 8], [14, 22], [28, 14], [22, 32], [34, 26], [10, 36], [2, 18]];
      pebbles.forEach(([x, y]) => {
        ctx.fillRect(x, y, 4, 3);
        ctx.fillStyle = '#b98759';
        ctx.fillRect(x + 1, y, 2, 1);
        ctx.fillStyle = '#4c2e17';
        ctx.fillRect(x, y + 3, 4, 1);
        ctx.fillStyle = '#9b6c43';
      });

      // Rillen / Wegspuren
      ctx.fillStyle = '#56351b';
      ctx.fillRect(8, 0, 3, 40);
      ctx.fillRect(28, 0, 3, 40);
      ctx.fillStyle = '#6d4626';
      ctx.fillRect(11, 0, 2, 40);
      ctx.fillRect(31, 0, 2, 40);
    });

    // Weg-Übergang / Ränder
    create('tile_dirt_edge', 40, 40, (ctx) => {
      ctx.fillStyle = '#3f6728';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#7e5330';
      ctx.fillRect(4, 4, 32, 32);
    });

    // Baum (Dekoration)
    create('tile_tree', 40, 40, (ctx) => {
      // Schatten am Boden
      ctx.fillStyle = 'rgba(20, 35, 12, 0.45)';
      ctx.beginPath();
      ctx.ellipse(20, 36, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stamm
      ctx.fillStyle = '#4a2f1b';
      ctx.fillRect(17, 24, 6, 12);
      ctx.fillStyle = '#674228';
      ctx.fillRect(18, 24, 3, 12);

      // Laubkrone (Schichten für 16-Bit Tiefe)
      ctx.fillStyle = '#1e4318';
      ctx.fillRect(8, 8, 24, 20);
      ctx.fillRect(12, 4, 16, 26);

      ctx.fillStyle = '#2d6323';
      ctx.fillRect(10, 6, 20, 18);
      ctx.fillRect(14, 3, 12, 22);

      ctx.fillStyle = '#418632';
      ctx.fillRect(12, 5, 14, 12);
      ctx.fillRect(8, 12, 8, 8);

      ctx.fillStyle = '#61b349';
      ctx.fillRect(14, 6, 8, 6);
      ctx.fillRect(10, 14, 4, 4);
    });

    // Felsen (Dekoration)
    create('tile_rock', 40, 40, (ctx) => {
      // Schatten
      ctx.fillStyle = 'rgba(20, 35, 12, 0.45)';
      ctx.beginPath();
      ctx.ellipse(20, 34, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Felsenbasis
      ctx.fillStyle = '#3a3a47';
      ctx.fillRect(10, 16, 20, 16);
      ctx.fillRect(14, 12, 12, 22);

      ctx.fillStyle = '#525263';
      ctx.fillRect(12, 14, 16, 16);

      ctx.fillStyle = '#737388';
      ctx.fillRect(14, 14, 10, 10);

      // Glanzkanten
      ctx.fillStyle = '#9e9eb4';
      ctx.fillRect(14, 14, 6, 2);
      ctx.fillRect(14, 16, 2, 4);

      // Moosfleck
      ctx.fillStyle = '#4a782b';
      ctx.fillRect(22, 24, 6, 4);
      ctx.fillRect(24, 22, 4, 2);
    });

    // Start-Portal (Spawn)
    create('tile_portal', 40, 40, (ctx) => {
      ctx.fillStyle = '#1a1426';
      ctx.fillRect(4, 4, 32, 32);

      ctx.fillStyle = '#4a296b';
      ctx.fillRect(6, 6, 28, 28);

      ctx.fillStyle = '#8347b8';
      ctx.fillRect(10, 10, 20, 20);

      ctx.fillStyle = '#c586fa';
      ctx.fillRect(14, 14, 12, 12);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 18, 4, 4);

      // Runen-Ecken
      ctx.fillStyle = '#e8c9ff';
      ctx.fillRect(8, 8, 3, 3);
      ctx.fillRect(29, 8, 3, 3);
      ctx.fillRect(8, 29, 3, 3);
      ctx.fillRect(29, 29, 3, 3);
    });

    // Burgtor / Ziel
    create('tile_castle', 40, 40, (ctx) => {
      // Steinmauer
      ctx.fillStyle = '#3a3f47';
      ctx.fillRect(2, 4, 36, 32);
      ctx.fillStyle = '#555d68';
      ctx.fillRect(4, 6, 32, 28);

      // Zinnen
      ctx.fillStyle = '#6d7785';
      ctx.fillRect(4, 2, 6, 6);
      ctx.fillRect(14, 2, 6, 6);
      ctx.fillRect(24, 2, 6, 6);
      ctx.fillRect(30, 2, 6, 6);

      // Torbogen dunkel
      ctx.fillStyle = '#1b1b22';
      ctx.fillRect(12, 16, 16, 20);
      ctx.beginPath();
      ctx.arc(20, 16, 8, Math.PI, 0);
      ctx.fill();

      // Gitter
      ctx.fillStyle = '#8f683a';
      ctx.fillRect(15, 14, 2, 22);
      ctx.fillRect(19, 12, 2, 24);
      ctx.fillRect(23, 14, 2, 22);
      ctx.fillRect(12, 22, 16, 2);
      ctx.fillRect(12, 28, 16, 2);

      // Rote Banner
      ctx.fillStyle = '#c7243a';
      ctx.fillRect(6, 12, 4, 14);
      ctx.fillRect(30, 12, 4, 14);
      ctx.fillStyle = '#ffd13b';
      ctx.fillRect(7, 16, 2, 4);
      ctx.fillRect(31, 16, 2, 4);
    });

    // 2. TOWERS (40x40)
    // --- ARCHER TOWERS ---
    // Level 1
    create('tower_archer_1', 40, 40, (ctx) => {
      // Holzfundament
      ctx.fillStyle = '#4c2e17';
      ctx.fillRect(6, 14, 28, 22);
      ctx.fillStyle = '#7a4b27';
      ctx.fillRect(8, 16, 24, 18);

      // Pfähle
      ctx.fillStyle = '#372010';
      ctx.fillRect(6, 14, 4, 22);
      ctx.fillRect(30, 14, 4, 22);

      // Plattform / Zinnen
      ctx.fillStyle = '#9b6c43';
      ctx.fillRect(4, 12, 32, 6);
      ctx.fillStyle = '#4c2e17';
      ctx.fillRect(6, 8, 4, 5);
      ctx.fillRect(18, 8, 4, 5);
      ctx.fillRect(30, 8, 4, 5);

      // Bogenschütze
      // Körper (grüner Umhang)
      ctx.fillStyle = '#2f6828';
      ctx.fillRect(17, 10, 6, 8);
      // Kopf / Kapuze
      ctx.fillStyle = '#438739';
      ctx.fillRect(17, 6, 6, 5);
      // Gesicht
      ctx.fillStyle = '#f5c398';
      ctx.fillRect(18, 8, 4, 2);
      // Bogen
      ctx.fillStyle = '#b47b41';
      ctx.fillRect(23, 7, 2, 8);
      ctx.fillRect(24, 6, 2, 2);
      ctx.fillRect(24, 13, 2, 2);
      // Sehne
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(22, 7, 1, 7);
    });

    // Archer Level 2
    create('tower_archer_2', 40, 40, (ctx) => {
      // Steinunterbau
      ctx.fillStyle = '#3a3a47';
      ctx.fillRect(4, 12, 32, 24);
      ctx.fillStyle = '#57576b';
      ctx.fillRect(6, 14, 28, 20);

      // Zinnen
      ctx.fillStyle = '#7a7a94';
      ctx.fillRect(3, 8, 6, 6);
      ctx.fillRect(17, 8, 6, 6);
      ctx.fillRect(31, 8, 6, 6);

      // Blaues Banner
      ctx.fillStyle = '#2b5ea6';
      ctx.fillRect(16, 18, 8, 14);
      ctx.fillStyle = '#ffd13b';
      ctx.fillRect(19, 21, 2, 6);

      // Verbesserter Schütze
      ctx.fillStyle = '#1c4a20';
      ctx.fillRect(16, 8, 8, 9);
      ctx.fillStyle = '#2d7834';
      ctx.fillRect(17, 4, 6, 5);
      ctx.fillStyle = '#f5c398';
      ctx.fillRect(18, 6, 4, 2);

      // Goldener Kompositbogen
      ctx.fillStyle = '#e5a93b';
      ctx.fillRect(23, 5, 3, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(22, 6, 1, 8);
    });

    // Archer Level 3
    create('tower_archer_3', 40, 40, (ctx) => {
      // Dunkler Prunkstein mit Goldverzierungen
      ctx.fillStyle = '#262438';
      ctx.fillRect(4, 10, 32, 26);
      ctx.fillStyle = '#443f60';
      ctx.fillRect(6, 12, 28, 22);

      // Goldakzente
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(4, 22, 32, 3);
      ctx.fillRect(4, 32, 32, 3);

      // Wehrturm-Zinnen mit Goldspitzen
      ctx.fillStyle = '#655e8c';
      ctx.fillRect(3, 6, 7, 6);
      ctx.fillRect(16, 6, 8, 6);
      ctx.fillRect(30, 6, 7, 6);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(5, 4, 3, 3);
      ctx.fillRect(19, 4, 2, 3);
      ctx.fillRect(32, 4, 3, 3);

      // Meisterschütze mit Falkenfeder
      ctx.fillStyle = '#133516';
      ctx.fillRect(16, 6, 8, 10);
      ctx.fillStyle = '#255e2a';
      ctx.fillRect(17, 2, 6, 5);
      ctx.fillStyle = '#e63946'; // Rote Feder am Hut
      ctx.fillRect(15, 1, 4, 2);
      ctx.fillStyle = '#f5c398';
      ctx.fillRect(18, 4, 4, 2);

      // Mystischer Bogen mit Leuchten
      ctx.fillStyle = '#5eead4';
      ctx.fillRect(24, 3, 3, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(23, 4, 1, 10);
    });

    // --- CANNON TOWERS ---
    // Level 1
    create('tower_cannon_1', 40, 40, (ctx) => {
      // Runde Steinplattform
      ctx.fillStyle = '#3a3942';
      ctx.fillRect(6, 16, 28, 20);
      ctx.fillStyle = '#5c5969';
      ctx.fillRect(8, 18, 24, 16);

      // Drehteller aus Holz/Eisen
      ctx.fillStyle = '#2f2e36';
      ctx.fillRect(12, 14, 16, 6);

      // Eisernes Kanonenrohr
      ctx.fillStyle = '#222329';
      ctx.fillRect(14, 8, 12, 18);
      ctx.fillStyle = '#424552';
      ctx.fillRect(15, 8, 5, 18);
      // Mündung
      ctx.fillStyle = '#15161a';
      ctx.fillRect(13, 6, 14, 4);
      // Nieten & Beschläge
      ctx.fillStyle = '#9e9eb0';
      ctx.fillRect(14, 14, 2, 2);
      ctx.fillRect(24, 14, 2, 2);
    });

    // Cannon Level 2
    create('tower_cannon_2', 40, 40, (ctx) => {
      // Verstärkte Festungsplattform
      ctx.fillStyle = '#2d2b38';
      ctx.fillRect(4, 14, 32, 22);
      ctx.fillStyle = '#4d495e';
      ctx.fillRect(6, 16, 28, 18);

      // Bronze-Beschlag
      ctx.fillStyle = '#a66a38';
      ctx.fillRect(4, 24, 32, 4);

      // Doppelter Drehkranz
      ctx.fillStyle = '#1e1c26';
      ctx.fillRect(10, 12, 20, 6);

      // Schweres Bronzerohr
      ctx.fillStyle = '#7a4b22';
      ctx.fillRect(13, 6, 14, 20);
      ctx.fillStyle = '#c48547';
      ctx.fillRect(15, 6, 6, 20);
      // Mündung
      ctx.fillStyle = '#2e1908';
      ctx.fillRect(12, 4, 16, 4);
      // Ringe
      ctx.fillStyle = '#ffd13b';
      ctx.fillRect(13, 10, 14, 2);
      ctx.fillRect(13, 16, 14, 2);
    });

    // Cannon Level 3 (Belagerungsmörser)
    create('tower_cannon_3', 40, 40, (ctx) => {
      // Obsidian- und Eisenbasis
      ctx.fillStyle = '#181724';
      ctx.fillRect(3, 12, 34, 24);
      ctx.fillStyle = '#312e47';
      ctx.fillRect(5, 14, 30, 20);

      // Glühende Magma-Runen auf der Basis
      ctx.fillStyle = '#ff4d2e';
      ctx.fillRect(8, 22, 4, 8);
      ctx.fillRect(28, 22, 4, 8);
      ctx.fillStyle = '#ffd13b';
      ctx.fillRect(9, 24, 2, 4);
      ctx.fillRect(29, 24, 2, 4);

      // Gewaltiges Mörserrohr
      ctx.fillStyle = '#1e1c28';
      ctx.fillRect(11, 4, 18, 22);
      ctx.fillStyle = '#4f4968';
      ctx.fillRect(13, 4, 8, 22);
      // Mündung & Magmaglut
      ctx.fillStyle = '#ff5722';
      ctx.fillRect(10, 2, 20, 4);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(13, 3, 14, 2);
      // Stacheln an den Flanken
      ctx.fillStyle = '#8f88ab';
      ctx.fillRect(8, 12, 3, 4);
      ctx.fillRect(29, 12, 3, 4);
    });

    // --- ICE TOWERS ---
    // Level 1
    create('tower_ice_1', 40, 40, (ctx) => {
      // Magischer Runen-Steinsockel
      ctx.fillStyle = '#263445';
      ctx.fillRect(6, 20, 28, 16);
      ctx.fillStyle = '#3a4f69';
      ctx.fillRect(8, 22, 24, 12);

      // Schwebender Eiskristall (Rhombus)
      ctx.fillStyle = '#3a8fb7';
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(28, 16);
      ctx.lineTo(20, 26);
      ctx.lineTo(12, 16);
      ctx.closePath();
      ctx.fill();

      // Kristall-Lichtfacetten
      ctx.fillStyle = '#7de8f7';
      ctx.beginPath();
      ctx.moveTo(20, 5);
      ctx.lineTo(26, 16);
      ctx.lineTo(20, 24);
      ctx.lineTo(18, 16);
      ctx.closePath();
      ctx.fill();

      // Weißer Kern
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 13, 4, 6);

      // Frost-Partikel am Sockel
      ctx.fillStyle = '#b6f5ff';
      ctx.fillRect(10, 24, 2, 2);
      ctx.fillRect(28, 24, 2, 2);
      ctx.fillRect(19, 28, 2, 2);
    });

    // Ice Level 2
    create('tower_ice_2', 40, 40, (ctx) => {
      // Dunklerer Sockel mit Frostspitzen
      ctx.fillStyle = '#1e2b3c';
      ctx.fillRect(4, 18, 32, 18);
      ctx.fillStyle = '#2f4b68';
      ctx.fillRect(6, 20, 28, 14);

      // Eiszapfen am Sockel
      ctx.fillStyle = '#84dbee';
      ctx.fillRect(6, 32, 3, 5);
      ctx.fillRect(14, 33, 2, 4);
      ctx.fillRect(24, 33, 2, 4);
      ctx.fillRect(31, 32, 3, 5);

      // Größerer Doppelkristall
      ctx.fillStyle = '#267399';
      ctx.beginPath();
      ctx.moveTo(20, 2);
      ctx.lineTo(31, 15);
      ctx.lineTo(20, 25);
      ctx.lineTo(9, 15);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#5eead4';
      ctx.beginPath();
      ctx.moveTo(20, 3);
      ctx.lineTo(28, 15);
      ctx.lineTo(20, 23);
      ctx.lineTo(16, 15);
      ctx.closePath();
      ctx.fill();

      // Gleißendes Glühen
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(17, 10, 6, 8);

      // 2 kleine Nebenkristalle
      ctx.fillStyle = '#7de8f7';
      ctx.fillRect(8, 10, 3, 5);
      ctx.fillRect(29, 10, 3, 5);
    });

    // Ice Level 3 (Gletscher-Zitadelle)
    create('tower_ice_3', 40, 40, (ctx) => {
      // Frostsockel mit Runenkreis
      ctx.fillStyle = '#131f2d';
      ctx.fillRect(3, 16, 34, 20);
      ctx.fillStyle = '#23415c';
      ctx.fillRect(5, 18, 30, 16);

      // Mystische Eisrunen
      ctx.fillStyle = '#4ff8d2';
      ctx.fillRect(8, 22, 6, 2);
      ctx.fillRect(11, 20, 2, 6);
      ctx.fillRect(26, 22, 6, 2);
      ctx.fillRect(29, 20, 2, 6);

      // Riesiger Blizzard-Sternkristall
      ctx.fillStyle = '#1d6085';
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(33, 14);
      ctx.lineTo(20, 26);
      ctx.lineTo(7, 14);
      ctx.closePath();
      ctx.fill();

      // Facette 2
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(20, 1);
      ctx.lineTo(30, 14);
      ctx.lineTo(20, 24);
      ctx.lineTo(14, 14);
      ctx.closePath();
      ctx.fill();

      // Reines Astral-Weiß
      ctx.fillStyle = '#f0fdff';
      ctx.fillRect(16, 8, 8, 10);

      // 4 rotierende Kristallscherben um den Kern
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(5, 6, 4, 6);
      ctx.fillRect(31, 6, 4, 6);
      ctx.fillRect(9, 20, 3, 4);
      ctx.fillRect(28, 20, 3, 4);
    });

    // 3. ENEMIES (32x32)
    // Goblin (schnell, klein, grün)
    create('enemy_goblin', 32, 32, (ctx) => {
      // Schatten
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Beine / Füße
      ctx.fillStyle = '#386b24';
      ctx.fillRect(11, 23, 3, 5);
      ctx.fillRect(18, 23, 3, 5);

      // Körper (Lendenschurz aus Leder)
      ctx.fillStyle = '#4c8c30';
      ctx.fillRect(11, 14, 10, 10);
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(10, 19, 12, 5);

      // Kopf & spitze Ohren
      ctx.fillStyle = '#5cb038';
      ctx.fillRect(10, 6, 12, 9);
      // Lange Ohren
      ctx.fillRect(6, 7, 4, 3);
      ctx.fillRect(22, 7, 4, 3);
      ctx.fillStyle = '#386b24';
      ctx.fillRect(7, 8, 2, 2);
      ctx.fillRect(23, 8, 2, 2);

      // Rote fiese Augen
      ctx.fillStyle = '#e53935';
      ctx.fillRect(12, 9, 2, 2);
      ctx.fillRect(18, 9, 2, 2);

      // Winziger Dolch in der Hand
      ctx.fillStyle = '#b0bec5';
      ctx.fillRect(22, 16, 2, 6);
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(21, 20, 4, 2);
    });

    // Bat (schnell, flatternd)
    create('enemy_bat', 32, 32, (ctx) => {
      // Schatten
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flügel
      ctx.fillStyle = '#2c1b3d';
      // Linker Flügel
      ctx.beginPath();
      ctx.moveTo(14, 14);
      ctx.lineTo(2, 6);
      ctx.lineTo(4, 16);
      ctx.lineTo(10, 18);
      ctx.closePath();
      ctx.fill();

      // Rechter Flügel
      ctx.beginPath();
      ctx.moveTo(18, 14);
      ctx.lineTo(30, 6);
      ctx.lineTo(28, 16);
      ctx.lineTo(22, 18);
      ctx.closePath();
      ctx.fill();

      // Flügelhäute
      ctx.fillStyle = '#4d2d68';
      ctx.fillRect(5, 10, 7, 6);
      ctx.fillRect(20, 10, 7, 6);

      // Körper & Kopf
      ctx.fillStyle = '#1e142b';
      ctx.fillRect(13, 10, 6, 10);
      // Ohren
      ctx.fillRect(13, 7, 2, 3);
      ctx.fillRect(17, 7, 2, 3);

      // Rote Vampiraugen
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(14, 12, 1, 2);
      ctx.fillRect(17, 12, 1, 2);
    });

    // Ork (kräftig, zäh)
    create('enemy_orc', 32, 32, (ctx) => {
      // Schatten
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(16, 29, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Schwere Stiefel
      ctx.fillStyle = '#2b1d14';
      ctx.fillRect(9, 23, 5, 6);
      ctx.fillRect(18, 23, 5, 6);

      // Rüstung / Wams
      ctx.fillStyle = '#4a5438';
      ctx.fillRect(8, 12, 16, 12);
      ctx.fillStyle = '#784e2d';
      ctx.fillRect(10, 14, 12, 10);

      // Kopf (dunkelgrün)
      ctx.fillStyle = '#3a6634';
      ctx.fillRect(10, 4, 12, 9);

      // Helm aus Eisen
      ctx.fillStyle = '#4a4f56';
      ctx.fillRect(9, 3, 14, 5);
      ctx.fillStyle = '#8f97a3';
      ctx.fillRect(11, 4, 10, 2);

      // Stoßzähne
      ctx.fillStyle = '#fff8e7';
      ctx.fillRect(11, 10, 2, 3);
      ctx.fillRect(19, 10, 2, 3);

      // Gelbe böse Augen
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(12, 7, 2, 2);
      ctx.fillRect(18, 7, 2, 2);

      // Streitaxt
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(25, 8, 2, 18);
      ctx.fillStyle = '#788496';
      ctx.fillRect(24, 7, 6, 7);
      ctx.fillStyle = '#c5d1e0';
      ctx.fillRect(28, 8, 2, 5);
    });

    // Golem (massiv, Stein, Moos)
    create('enemy_golem', 32, 32, (ctx) => {
      // Schatten
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(16, 30, 13, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Schwere Felsenbeine
      ctx.fillStyle = '#383b40';
      ctx.fillRect(7, 22, 7, 8);
      ctx.fillRect(18, 22, 7, 8);

      // Massiver Steintorso
      ctx.fillStyle = '#4c5057';
      ctx.fillRect(5, 8, 22, 15);
      ctx.fillStyle = '#676c75';
      ctx.fillRect(7, 10, 18, 11);

      // Moosbewuchs
      ctx.fillStyle = '#437a2f';
      ctx.fillRect(6, 9, 6, 5);
      ctx.fillRect(19, 16, 7, 4);

      // Felsenkopf
      ctx.fillStyle = '#383b40';
      ctx.fillRect(10, 2, 12, 8);
      ctx.fillStyle = '#595e66';
      ctx.fillRect(11, 3, 10, 6);

      // Leuchtende magische Cyan-Augen
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(12, 5, 2, 2);
      ctx.fillRect(18, 5, 2, 2);

      // Risse mit Glühen
      ctx.fillStyle = '#00bcd4';
      ctx.fillRect(15, 12, 2, 5);
      ctx.fillRect(13, 15, 5, 2);
    });

    // Boss (Minotaurus / Dämon)
    create('enemy_boss', 36, 36, (ctx) => {
      // Schatten
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(18, 33, 15, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hufe & kräftige Beine
      ctx.fillStyle = '#211714';
      ctx.fillRect(9, 24, 7, 9);
      ctx.fillRect(20, 24, 7, 9);

      // Rumpf & Rüstung
      ctx.fillStyle = '#4a2818';
      ctx.fillRect(7, 10, 22, 15);
      ctx.fillStyle = '#b8860b'; // Goldene Rüstung
      ctx.fillRect(9, 12, 18, 10);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(11, 14, 14, 6);

      // Kopf
      ctx.fillStyle = '#3a1f13';
      ctx.fillRect(11, 4, 14, 9);
      // Schnauze mit Nasenring
      ctx.fillStyle = '#21120a';
      ctx.fillRect(13, 9, 10, 5);
      ctx.fillStyle = '#ffd700'; // Goldener Ring
      ctx.fillRect(17, 12, 2, 3);

      // Mächtige gebogene Hörner
      ctx.fillStyle = '#e8d8b5';
      ctx.fillRect(6, 1, 5, 4);
      ctx.fillRect(25, 1, 5, 4);
      ctx.fillRect(4, 3, 3, 5);
      ctx.fillRect(29, 3, 3, 5);

      // Brennende rote Augen
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(13, 6, 2, 2);
      ctx.fillRect(21, 6, 2, 2);

      // Riesige Kriegsaxt
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(29, 4, 3, 26);
      ctx.fillStyle = '#90a4ae';
      ctx.fillRect(27, 2, 9, 8);
      ctx.fillStyle = '#ff5722'; // Glühende Schneide
      ctx.fillRect(35, 3, 2, 6);
    });

    // 4. PROJECTILES & EFFECTS
    // Pfeil
    create('proj_arrow', 18, 6, (ctx) => {
      // Holzschaft
      ctx.fillStyle = '#8d5b2d';
      ctx.fillRect(2, 2, 12, 2);
      // Eisenspitze
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(14, 1, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(17, 2, 1, 2);
      // Befiederung
      ctx.fillStyle = '#e53935';
      ctx.fillRect(0, 0, 3, 2);
      ctx.fillRect(0, 4, 3, 2);
    });

    // Kanonenkugel
    create('proj_cannonball', 12, 12, (ctx) => {
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      // Glanzpunkt
      ctx.fillStyle = '#9e9e9e';
      ctx.fillRect(4, 3, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 4, 1, 1);
    });

    // Eisprojektil
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

    // Treffereffekt (Flash)
    create('effect_hit', 16, 16, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 0, 4, 16);
      ctx.fillRect(0, 6, 16, 4);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(4, 4, 8, 8);
    });

    // Explosions-Effekt (Cannon AoE)
    create('effect_explosion', 48, 48, (ctx) => {
      ctx.fillStyle = 'rgba(255, 87, 34, 0.6)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 193, 7, 0.85)';
      ctx.beginPath();
      ctx.arc(24, 24, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(24, 24, 7, 0, Math.PI * 2);
      ctx.fill();

      // Pixelige Rauch- und Feuerpartikel
      ctx.fillStyle = '#ff5722';
      ctx.fillRect(6, 10, 4, 4);
      ctx.fillRect(36, 12, 5, 5);
      ctx.fillRect(10, 34, 4, 4);
      ctx.fillRect(32, 32, 6, 6);
    });

    // Frost-Aura Effekt (Ice AoE)
    create('effect_frost', 48, 48, (ctx) => {
      ctx.fillStyle = 'rgba(79, 195, 247, 0.45)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#b3e5fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Schneeflocke / Eiskristall
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(23, 8, 2, 32);
      ctx.fillRect(8, 23, 32, 2);
      ctx.fillRect(14, 14, 20, 20);
    });

    // 5. UI ICONS
    // Goldmünze
    create('icon_gold', 24, 24, (ctx) => {
      ctx.fillStyle = '#c79218';
      ctx.beginPath();
      ctx.arc(12, 12, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd13b';
      ctx.beginPath();
      ctx.arc(12, 12, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff4a3';
      ctx.fillRect(9, 7, 3, 4);

      ctx.fillStyle = '#996f0e';
      ctx.fillRect(11, 8, 2, 8);
    });

    // Herz (Leben)
    create('icon_heart', 24, 24, (ctx) => {
      ctx.fillStyle = '#e84a5f';
      ctx.beginPath();
      ctx.moveTo(12, 20);
      ctx.bezierCurveTo(4, 14, 3, 6, 8, 5);
      ctx.bezierCurveTo(11, 5, 12, 8, 12, 8);
      ctx.bezierCurveTo(12, 8, 13, 5, 16, 5);
      ctx.bezierCurveTo(21, 6, 20, 14, 12, 20);
      ctx.fill();

      // Glanzpunkt
      ctx.fillStyle = '#ff8fa3';
      ctx.fillRect(8, 7, 2, 3);
    });

    // Welle (Totenkopf / Flagge)
    create('icon_wave', 24, 24, (ctx) => {
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(6, 4, 12, 10);
      ctx.fillRect(8, 14, 8, 5);

      ctx.fillStyle = '#212121';
      ctx.fillRect(8, 7, 3, 4);
      ctx.fillRect(13, 7, 3, 4);
      ctx.fillRect(10, 15, 1, 4);
      ctx.fillRect(13, 15, 1, 4);
    });

    // Tower Selection Icons (32x32)
    create('icon_archer', 32, 32, (ctx) => {
      ctx.fillStyle = '#252131';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#5a5472';
      ctx.strokeRect(1, 1, 30, 30);

      // Bogen-Grafik
      ctx.fillStyle = '#b47b41';
      ctx.fillRect(18, 5, 3, 22);
      ctx.fillRect(20, 8, 2, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 6, 2, 20);
      // Pfeil
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(6, 15, 18, 2);
      ctx.fillStyle = '#e53935';
      ctx.fillRect(5, 13, 2, 6);
    });

    create('icon_cannon', 32, 32, (ctx) => {
      ctx.fillStyle = '#252131';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#5a5472';
      ctx.strokeRect(1, 1, 30, 30);

      // Kanone
      ctx.fillStyle = '#424552';
      ctx.fillRect(8, 10, 16, 12);
      ctx.fillStyle = '#15161a';
      ctx.fillRect(22, 11, 4, 10);
      ctx.fillStyle = '#8d5b2d';
      ctx.fillRect(8, 19, 14, 7);
      ctx.fillStyle = '#ffd13b';
      ctx.fillRect(12, 10, 2, 12);
    });

    create('icon_ice', 32, 32, (ctx) => {
      ctx.fillStyle = '#252131';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#5a5472';
      ctx.strokeRect(1, 1, 30, 30);

      // Eiskristall
      ctx.fillStyle = '#00bcd4';
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(26, 16);
      ctx.lineTo(16, 28);
      ctx.lineTo(6, 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#e0f7fa';
      ctx.fillRect(13, 13, 6, 6);
    });
  }
}

