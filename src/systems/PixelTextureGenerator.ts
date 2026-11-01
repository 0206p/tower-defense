import Phaser from 'phaser';

export class PixelTextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    const tm = scene.textures;

    // Moderner Vektor- & Digital-Art Renderer (Vollständige Kantenglättung & Antialiasing)
    const create = (key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
      if (tm.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        drawFn(ctx);
        const tex = tm.addCanvas(key, canvas);
        if (tex) {
          tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
      }
    };

    // ==========================================
    // 1. MODERNE HUD & SYSTEM ICONS
    // ==========================================
    create('icon_heart', 28, 28, (ctx) => {
      // 3D-Rubinherz mit Glanzreflex
      const grad = ctx.createRadialGradient(11, 10, 2, 14, 14, 14);
      grad.addColorStop(0, '#ff6b81');
      grad.addColorStop(0.5, '#ee5253');
      grad.addColorStop(1, '#a31728');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(14, 25);
      ctx.bezierCurveTo(2, 16, 1, 5, 8, 4);
      ctx.bezierCurveTo(12, 4, 14, 8, 14, 8);
      ctx.bezierCurveTo(14, 8, 16, 4, 20, 4);
      ctx.bezierCurveTo(27, 5, 26, 16, 14, 25);
      ctx.closePath();
      ctx.fill();

      // Weicher Glanzreflex oben links
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(9, 8, 4, 2.5, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    });

    create('icon_gold', 28, 28, (ctx) => {
      // Glänzende Goldmünze mit Riffelrand & Stern
      const grad = ctx.createLinearGradient(4, 4, 24, 24);
      grad.addColorStop(0, '#ffeaa7');
      grad.addColorStop(0.3, '#fdcb6e');
      grad.addColorStop(0.7, '#e17055');
      grad.addColorStop(1, '#b55829');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(14, 14, 12, 0, Math.PI * 2);
      ctx.fill();

      // Innenkreis mit Prägung
      ctx.strokeStyle = '#fff2a7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(14, 14, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Goldstern-Prägung
      ctx.fillStyle = '#fff9d2';
      ctx.beginPath();
      ctx.arc(14, 14, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    create('icon_wave', 28, 28, (ctx) => {
      // Epische Schlacht-Totenkopf-Emblem
      const grad = ctx.createLinearGradient(0, 4, 0, 24);
      grad.addColorStop(0, '#f1f2f6');
      grad.addColorStop(0.7, '#ced6e0');
      grad.addColorStop(1, '#747d8c');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(14, 11, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(10, 15, 8, 6);

      // Augenhöhlen
      ctx.fillStyle = '#1e1b29';
      ctx.beginPath();
      ctx.arc(11, 11, 2.5, 0, Math.PI * 2);
      ctx.arc(17, 11, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    create('icon_crystal', 28, 28, (ctx) => {
      // Magischer Prismen-Kristall mit Schimmer
      const grad = ctx.createLinearGradient(4, 4, 24, 24);
      grad.addColorStop(0, '#74b9ff');
      grad.addColorStop(0.4, '#a29bfe');
      grad.addColorStop(0.8, '#e056fd');
      grad.addColorStop(1, '#6c5ce7');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(14, 3);
      ctx.lineTo(24, 11);
      ctx.lineTo(14, 25);
      ctx.lineTo(4, 11);
      ctx.closePath();
      ctx.fill();

      // Lichtfacette
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(14, 3);
      ctx.lineTo(14, 25);
      ctx.lineTo(4, 11);
      ctx.closePath();
      ctx.fill();
    });

    // ==========================================
    // 2. MODERNE TURM-ICONS (Kaufleiste)
    // ==========================================
    create('icon_archer', 36, 36, (ctx) => {
      // Vektor-Balliste / Bogen
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#e67e22';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(16, 18, 11, -Math.PI / 2.3, Math.PI / 2.3);
      ctx.stroke();

      // Bogensehne & Pfeil
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(12, 8);
      ctx.lineTo(12, 28);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(9, 18);
      ctx.lineTo(26, 18);
      ctx.stroke();
    });

    create('icon_cannon', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Schweres Bronzerohr
      const tubeGrad = ctx.createLinearGradient(10, 10, 26, 26);
      tubeGrad.addColorStop(0, '#95a5a6');
      tubeGrad.addColorStop(0.5, '#34495e');
      tubeGrad.addColorStop(1, '#1e272e');

      ctx.fillStyle = tubeGrad;
      ctx.save();
      ctx.translate(18, 18);
      ctx.rotate(-Math.PI / 4);
      ctx.fillRect(-6, -12, 12, 22);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(-7, -13, 14, 4);
      ctx.restore();
    });

    create('icon_ice', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      const grad = ctx.createLinearGradient(10, 6, 26, 26);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#74b9ff');
      grad.addColorStop(1, '#0984e3');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(18, 6);
      ctx.lineTo(26, 18);
      ctx.lineTo(18, 30);
      ctx.lineTo(10, 18);
      ctx.closePath();
      ctx.fill();
    });

    create('icon_poison', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Gift-Alchemiekolben
      const flaskGrad = ctx.createRadialGradient(18, 20, 2, 18, 20, 10);
      flaskGrad.addColorStop(0, '#55efc4');
      flaskGrad.addColorStop(0.7, '#00b894');
      flaskGrad.addColorStop(1, '#006266');

      ctx.fillStyle = flaskGrad;
      ctx.beginPath();
      ctx.arc(18, 21, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(15, 9, 6, 8);
    });

    create('icon_tesla', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Plasma-Pylon mit Blitz
      ctx.fillStyle = '#0984e3';
      ctx.beginPath();
      ctx.arc(18, 13, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#55efc4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(19, 8);
      ctx.lineTo(15, 14);
      ctx.lineTo(20, 15);
      ctx.lineTo(16, 22);
      ctx.stroke();
    });

    create('icon_sniper', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Fadenkreuz & Präzisionslauf
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(18, 18, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(18, 5); ctx.lineTo(18, 31);
      ctx.moveTo(5, 18); ctx.lineTo(31, 18);
      ctx.stroke();
    });

    // ==========================================
    // 3. MODERNER UNTERGRUND & PFADE (GEMALTE ÄSTHETIK)
    // ==========================================
    create('tile_ground_witch', 40, 40, (ctx) => {
      // Sanfter Wald- & Moosboden mit Tiefenverlauf
      const grad = ctx.createLinearGradient(0, 0, 40, 40);
      grad.addColorStop(0, '#2d5a32');
      grad.addColorStop(0.5, '#224827');
      grad.addColorStop(1, '#19361d');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 40, 40);

      // Weiche Gras-Nuancen & Blüten
      ctx.fillStyle = 'rgba(76, 175, 80, 0.35)';
      ctx.beginPath();
      ctx.arc(12, 14, 8, 0, Math.PI * 2);
      ctx.arc(28, 26, 10, 0, Math.PI * 2);
      ctx.fill();

      // Zarte kleine Waldblüte
      ctx.fillStyle = '#e056fd';
      ctx.beginPath();
      ctx.arc(24, 12, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_path_witch', 40, 40, (ctx) => {
      // Eleganter Holzsteg mit Schatten und feinen Fugen
      ctx.fillStyle = '#22151f';
      ctx.fillRect(0, 0, 40, 40);

      // Steinrand
      ctx.fillStyle = '#3a2434';
      ctx.fillRect(0, 0, 3, 40);
      ctx.fillRect(37, 0, 3, 40);

      // Holzbohlen
      const plankY = [1, 11, 21, 31];
      plankY.forEach((py) => {
        const pGrad = ctx.createLinearGradient(0, py, 0, py + 8);
        pGrad.addColorStop(0, '#6d4864');
        pGrad.addColorStop(0.7, '#593952');
        pGrad.addColorStop(1, '#43293e');

        ctx.fillStyle = pGrad;
        ctx.fillRect(4, py, 32, 8);

        // Zarte Messingnägel
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(8, py + 4, 1.2, 0, Math.PI * 2);
        ctx.arc(32, py + 4, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    create('tile_decor_witch', 40, 40, (ctx) => {
      // Sanft leuchtende Pilzgruppe
      ctx.fillStyle = '#dfe4ea';
      ctx.beginPath();
      ctx.ellipse(20, 26, 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      const capGrad = ctx.createRadialGradient(20, 16, 2, 20, 16, 12);
      capGrad.addColorStop(0, '#e056fd');
      capGrad.addColorStop(0.7, '#8e44ad');
      capGrad.addColorStop(1, '#481c5c');

      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.arc(20, 18, 12, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Leuchtpunkte
      ctx.fillStyle = '#55efc4';
      ctx.beginPath();
      ctx.arc(15, 13, 1.8, 0, Math.PI * 2);
      ctx.arc(22, 11, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_ground_cave', 40, 40, (ctx) => {
      // Subterraner Schiefer mit Kristallglanz
      const grad = ctx.createRadialGradient(20, 20, 4, 20, 20, 25);
      grad.addColorStop(0, '#2f3542');
      grad.addColorStop(0.7, '#222731');
      grad.addColorStop(1, '#161920');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 40, 40);

      // Glänzende Azurit-Ader
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 28);
      ctx.lineTo(16, 24);
      ctx.lineTo(24, 30);
      ctx.stroke();
    });

    create('tile_path_cave', 40, 40, (ctx) => {
      // Unterirdisches Schottergleisbett
      ctx.fillStyle = '#1c1714';
      ctx.fillRect(0, 0, 40, 40);

      // Schotter
      ctx.fillStyle = '#2d251f';
      ctx.fillRect(3, 3, 34, 34);

      // Schwellen
      const ties = [2, 12, 22, 32];
      ties.forEach((ty) => {
        ctx.fillStyle = '#4e3828';
        ctx.fillRect(4, ty, 32, 6);
      });

      // Schienen
      ctx.fillStyle = '#a4b0be';
      ctx.fillRect(10, 0, 3, 40);
      ctx.fillRect(27, 0, 3, 40);
      ctx.fillStyle = '#dfe4ea';
      ctx.fillRect(11, 0, 1, 40);
      ctx.fillRect(28, 0, 1, 40);
    });

    create('tile_decor_cave', 40, 40, (ctx) => {
      // Kristallmonolith
      const grad = ctx.createLinearGradient(12, 6, 28, 32);
      grad.addColorStop(0, '#f1c40f');
      grad.addColorStop(0.5, '#e67e22');
      grad.addColorStop(1, '#d35400');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(29, 32);
      ctx.lineTo(11, 32);
      ctx.closePath();
      ctx.fill();
    });

    create('tile_ground_mountain', 40, 40, (ctx) => {
      // Obsidian-Fels mit Magmaglimmen
      const grad = ctx.createLinearGradient(0, 0, 40, 40);
      grad.addColorStop(0, '#2c1417');
      grad.addColorStop(0.6, '#1d0c0e');
      grad.addColorStop(1, '#110507');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 40, 40);

      // Glühender Magmariss
      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(6, 26);
      ctx.lineTo(16, 22);
      ctx.lineTo(28, 28);
      ctx.stroke();

      ctx.strokeStyle = '#ffa502';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    create('tile_path_mountain', 40, 40, (ctx) => {
      ctx.fillStyle = '#170608';
      ctx.fillRect(0, 0, 40, 40);

      // Lavarinnen
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(1, 0, 4, 40);
      ctx.fillRect(35, 0, 4, 40);
      ctx.fillStyle = '#ffa502';
      ctx.fillRect(2, 0, 2, 40);
      ctx.fillRect(36, 0, 2, 40);

      // Obsidian-Straßenplatten
      const slabY = [2, 12, 22, 32];
      slabY.forEach((sy) => {
        ctx.fillStyle = '#381c20';
        ctx.fillRect(6, sy, 28, 8);
      });
    });

    create('tile_decor_mountain', 40, 40, (ctx) => {
      // Vulkankegel
      ctx.fillStyle = '#1e0c0f';
      ctx.beginPath();
      ctx.moveTo(10, 34);
      ctx.lineTo(15, 12);
      ctx.lineTo(25, 12);
      ctx.lineTo(30, 34);
      ctx.closePath();
      ctx.fill();

      // Glühender Krater
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.ellipse(20, 12, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // ==========================================
    // 4. WEHENDES GRAS (MODERNE VEKTOR-HALME)
    // ==========================================
    create('decor_grass_tuft_1', 26, 26, (ctx) => {
      // Weiche, geschwungene Grashalme mit Farbverlauf
      const grad = ctx.createLinearGradient(0, 26, 0, 4);
      grad.addColorStop(0, '#1e824c');
      grad.addColorStop(0.6, '#2ecc71');
      grad.addColorStop(1, '#a8e6cf');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(8, 14, 5, 5);
      ctx.quadraticCurveTo(10, 14, 13, 25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(13, 10, 13, 2);
      ctx.quadraticCurveTo(15, 10, 13, 25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(18, 14, 21, 6);
      ctx.quadraticCurveTo(16, 14, 13, 25);
      ctx.fill();
    });

    create('decor_grass_tuft_2', 26, 26, (ctx) => {
      // Grasbüschel mit zarter Blume
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(7, 12, 4, 6);
      ctx.quadraticCurveTo(11, 14, 13, 25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(19, 12, 22, 7);
      ctx.quadraticCurveTo(15, 14, 13, 25);
      ctx.fill();

      // Gelbe Margerite
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(13, 9, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(13, 9, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    create('decor_grass_tuft_3', 26, 26, (ctx) => {
      // Kleiner Wald-Farn
      ctx.fillStyle = '#16a085';
      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(5, 14, 3, 10);
      ctx.quadraticCurveTo(10, 16, 13, 25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(21, 14, 23, 10);
      ctx.quadraticCurveTo(16, 16, 13, 25);
      ctx.fill();
    });

    // ==========================================
    // 4b. BÄUME, FELSEN, BÄCHE & LEBENDIGE VIECHER
    // ==========================================

    // Großer Laubbaum (Hexenwald)
    create('decor_tree_oak', 46, 54, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(23, 49, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      const trunkGrad = ctx.createLinearGradient(19, 32, 27, 49);
      trunkGrad.addColorStop(0, '#593922');
      trunkGrad.addColorStop(0.5, '#422817');
      trunkGrad.addColorStop(1, '#2c180d');
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(21, 30);
      ctx.lineTo(25, 30);
      ctx.lineTo(27, 48);
      ctx.lineTo(19, 48);
      ctx.closePath();
      ctx.fill();

      const drawCanopy = (cx: number, cy: number, r: number, color1: string, color2: string) => {
        const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r);
        g.addColorStop(0, color1);
        g.addColorStop(1, color2);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawCanopy(17, 24, 13, '#2ed573', '#1e824c');
      drawCanopy(29, 24, 13, '#26af61', '#145a32');
      drawCanopy(23, 14, 14, '#7bed9f', '#20bf6b');
    });

    // Nadelbaum / Wald-Tanne
    create('decor_tree_pine', 38, 56, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(19, 52, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3e2723';
      ctx.fillRect(17, 42, 4, 10);

      const drawNeedles = (yTop: number, yBot: number, w: number, c1: string, c2: string) => {
        const g = ctx.createLinearGradient(19, yTop, 19, yBot);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(19, yTop);
        ctx.lineTo(19 + w, yBot);
        ctx.lineTo(19 - w, yBot);
        ctx.closePath();
        ctx.fill();
      };

      drawNeedles(26, 44, 16, '#27ae60', '#145a32');
      drawNeedles(15, 33, 13, '#2ecc71', '#196f3d');
      drawNeedles(4, 21, 10, '#55efc4', '#1e824c');
    });

    // Toter Vulkan-Baum mit Glut
    create('decor_tree_dead', 42, 54, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(21, 50, 13, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1a0a0d';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(21, 49);
      ctx.lineTo(21, 28);
      ctx.lineTo(12, 14);
      ctx.moveTo(21, 32);
      ctx.lineTo(31, 16);
      ctx.moveTo(16, 21);
      ctx.lineTo(8, 10);
      ctx.moveTo(26, 24);
      ctx.lineTo(35, 12);
      ctx.stroke();

      ctx.fillStyle = '#ff6b6b';
      [ {x: 12, y: 14}, {x: 8, y: 10}, {x: 31, y: 16}, {x: 35, y: 12} ].forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Stalagmit-Säule (Goblinhöhle)
    create('decor_stalagmite_huge', 38, 54, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(19, 50, 13, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createLinearGradient(12, 6, 26, 50);
      g.addColorStop(0, '#57606f');
      g.addColorStop(0.5, '#2f3542');
      g.addColorStop(1, '#1e272e');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(19, 4);
      ctx.lineTo(30, 48);
      ctx.lineTo(8, 48);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(19, 10);
      ctx.lineTo(22, 28);
      ctx.lineTo(17, 44);
      ctx.stroke();
    });

    // Felsbrocken Granit mit Moos
    create('decor_rock_granite', 38, 30, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(19, 26, 15, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createLinearGradient(6, 4, 32, 28);
      g.addColorStop(0, '#747d8c');
      g.addColorStop(0.6, '#4f5663');
      g.addColorStop(1, '#2f3542');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(8, 22);
      ctx.lineTo(12, 8);
      ctx.lineTo(25, 6);
      ctx.lineTo(32, 16);
      ctx.lineTo(29, 25);
      ctx.lineTo(14, 26);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#2ed573';
      ctx.beginPath();
      ctx.ellipse(18, 9, 8, 3.5, -0.1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Felsbrocken mit Erz
    create('decor_rock_ore', 38, 30, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(19, 26, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.moveTo(8, 24);
      ctx.lineTo(11, 7);
      ctx.lineTo(27, 7);
      ctx.lineTo(31, 23);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(14, 12, 4, 4);
      ctx.fillRect(23, 16, 3, 3);
      ctx.fillStyle = '#be2edd';
      ctx.fillRect(19, 10, 3, 3);
    });

    // Vulkanfels mit Lava-Adern
    create('decor_rock_volcanic', 38, 30, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(19, 26, 15, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e0c0f';
      ctx.beginPath();
      ctx.moveTo(7, 24);
      ctx.lineTo(13, 6);
      ctx.lineTo(26, 7);
      ctx.lineTo(33, 24);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, 10);
      ctx.lineTo(19, 18);
      ctx.lineTo(27, 20);
      ctx.stroke();
    });

    // Bach / Wasser-Kachel (Hexenwald)
    create('decor_water_stream_h', 40, 40, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 40);
      g.addColorStop(0, '#192a56');
      g.addColorStop(0.3, '#0984e3');
      g.addColorStop(0.7, '#48dbfb');
      g.addColorStop(1, '#192a56');
      ctx.fillStyle = g;
      ctx.fillRect(0, 4, 40, 32);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(4, 14);
      ctx.quadraticCurveTo(14, 11, 24, 14);
      ctx.quadraticCurveTo(32, 17, 38, 14);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(2, 26);
      ctx.quadraticCurveTo(12, 23, 22, 26);
      ctx.quadraticCurveTo(30, 29, 36, 26);
      ctx.stroke();

      ctx.fillStyle = '#57606f';
      ctx.beginPath();
      ctx.arc(8, 4, 2, 0, Math.PI * 2);
      ctx.arc(28, 5, 2.5, 0, Math.PI * 2);
      ctx.arc(18, 36, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Seerose auf dem Wasser
    create('decor_water_lily', 24, 24, (ctx) => {
      ctx.fillStyle = '#10ac84';
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0.3, Math.PI * 1.85);
      ctx.lineTo(12, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff9ff3';
      ctx.beginPath();
      ctx.arc(12, 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#feca57';
      ctx.beginPath();
      ctx.arc(12, 12, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Süßes Wald-Kaninchen
    create('critter_rabbit', 22, 20, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(11, 18, 8, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f5f0e6';
      ctx.beginPath();
      ctx.ellipse(10, 13, 7, 5, -0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(15, 9, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f5f0e6';
      ctx.beginPath();
      ctx.ellipse(14, 3, 1.8, 4.5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(17, 4, 1.8, 4.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffb8b8';
      ctx.beginPath();
      ctx.ellipse(14, 3, 0.9, 3, -0.2, 0, Math.PI * 2);
      ctx.ellipse(17, 4, 0.9, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.arc(16, 8, 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3, 13, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Schillernder Wald-Schmetterling
    create('critter_butterfly', 20, 18, (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, 20, 18);
      grad.addColorStop(0, '#00d2d3');
      grad.addColorStop(0.5, '#54a0ff');
      grad.addColorStop(1, '#5f27cd');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.ellipse(6, 6, 5, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7, 12, 3.5, 2.5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(14, 6, 5, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(13, 12, 3.5, 2.5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#222f3e';
      ctx.fillRect(9, 4, 2, 9);
    });

    // Höhlen-Fledermaus
    create('critter_bat', 24, 18, (ctx) => {
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.ellipse(12, 9, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(12, 7);
      ctx.quadraticCurveTo(6, 2, 2, 6);
      ctx.quadraticCurveTo(5, 12, 10, 10);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(12, 7);
      ctx.quadraticCurveTo(18, 2, 22, 6);
      ctx.quadraticCurveTo(19, 12, 14, 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff4757';
      ctx.fillRect(11, 7, 1, 1);
      ctx.fillRect(13, 7, 1, 1);
    });

    // Feuer-Salamander
    create('critter_salamander', 24, 16, (ctx) => {
      ctx.fillStyle = '#1a0d0d';
      ctx.beginPath();
      ctx.ellipse(12, 8, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1a0d0d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(5, 8);
      ctx.quadraticCurveTo(2, 6, 0, 10);
      ctx.stroke();

      ctx.fillStyle = '#ff9f43';
      ctx.beginPath();
      ctx.arc(9, 7, 1.3, 0, Math.PI * 2);
      ctx.arc(13, 8, 1.5, 0, Math.PI * 2);
      ctx.arc(16, 7, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // ==========================================
    // 5. RUNENSTEIN, PORTAL & SCHLOSS
    // ==========================================
    create('bg_menu_panorama', 1280, 720, (ctx) => {
      // Epische Vektor-Hintergrundlandschaft
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 720);
      skyGrad.addColorStop(0, '#0a0714');
      skyGrad.addColorStop(0.35, '#15102a');
      skyGrad.addColorStop(0.65, '#28133d');
      skyGrad.addColorStop(0.85, '#4a1d47');
      skyGrad.addColorStop(1.0, '#1d0c24');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // Sanfte leuchtende Sterne
      ctx.fillStyle = '#ffffff';
      const starCoords = [
        [120, 45], [240, 80], [380, 35], [510, 110], [640, 60],
        [790, 40], [920, 95], [1050, 50], [1180, 85], [160, 140],
        [310, 160], [450, 190], [700, 170], [860, 150], [1120, 130]
      ];
      starCoords.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Leuchtender Vollmond mit weicher Aura
      const moonX = 1040;
      const moonY = 140;
      const moonRadius = 60;
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonRadius);
      moonGrad.addColorStop(0, '#fffbf0');
      moonGrad.addColorStop(0.7, '#f6e58d');
      moonGrad.addColorStop(1, '#eccc68');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bergketten im Hintergrund (Schicht 1)
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

      // Schicht 2 (Dunklere Grate)
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

      // Wehrturm auf Klippe links
      ctx.fillStyle = '#100a1f';
      ctx.beginPath();
      ctx.moveTo(0, 570);
      ctx.lineTo(260, 540);
      ctx.lineTo(320, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e1634';
      ctx.fillRect(100, 310, 80, 240);
      ctx.fillStyle = '#55efc4';
      ctx.beginPath();
      ctx.arc(140, 290, 8, 0, Math.PI * 2);
      ctx.fill();

      // Erleuchtete Turmfenster
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(133, 350, 14, 22);
      ctx.fillRect(133, 410, 14, 22);
    });

    create('tile_runestone', 40, 40, (ctx) => {
      // Magischer Runensockel mit leuchtender Aura
      ctx.fillStyle = '#161426';
      ctx.beginPath();
      ctx.arc(20, 20, 18, 0, Math.PI * 2);
      ctx.fill();

      const ringGrad = ctx.createLinearGradient(4, 4, 36, 36);
      ringGrad.addColorStop(0, '#55efc4');
      ringGrad.addColorStop(0.5, '#00cec9');
      ringGrad.addColorStop(1, '#0984e3');

      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(20, 20, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Zentrales Runenzeichen
      ctx.fillStyle = '#e056fd';
      ctx.beginPath();
      ctx.arc(20, 20, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_portal', 40, 40, (ctx) => {
      // Wirbelndes Raumportal
      const portGrad = ctx.createRadialGradient(20, 20, 2, 20, 20, 18);
      portGrad.addColorStop(0, '#ffffff');
      portGrad.addColorStop(0.3, '#a29bfe');
      portGrad.addColorStop(0.7, '#6c5ce7');
      portGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = portGrad;
      ctx.beginPath();
      ctx.arc(20, 20, 18, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_castle', 40, 40, (ctx) => {
      // Königliches Schloss-Tor
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.roundRect(8, 8, 24, 28, 6);
      ctx.fill();

      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(20, 16, 5, 0, Math.PI * 2);
      ctx.fill();

      // Torbogen
      ctx.fillStyle = '#130e1e';
      ctx.beginPath();
      ctx.arc(20, 36, 8, Math.PI, 0);
      ctx.fill();
    });

    // ==========================================
    // 6. MODERNE FANTASY-GEGNER (VEKTOR-ILLUSTRATION)
    // ==========================================
    create('enemy_goblin', 34, 34, (ctx) => {
      // Schattierter Goblin-Krieger
      const skinGrad = ctx.createRadialGradient(17, 16, 2, 17, 16, 12);
      skinGrad.addColorStop(0, '#5cd670');
      skinGrad.addColorStop(0.7, '#27ae60');
      skinGrad.addColorStop(1, '#1b6330');

      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.arc(17, 16, 9, 0, Math.PI * 2);
      ctx.fill();

      // Spitze Goblin-Ohren
      ctx.beginPath();
      ctx.moveTo(8, 16); ctx.lineTo(1, 11); ctx.lineTo(8, 19);
      ctx.moveTo(26, 16); ctx.lineTo(33, 11); ctx.lineTo(26, 19);
      ctx.fill();

      // Glühende rote Augen
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(14, 15, 2, 0, Math.PI * 2);
      ctx.arc(20, 15, 2, 0, Math.PI * 2);
      ctx.fill();

      // Lederwams
      ctx.fillStyle = '#654124';
      ctx.beginPath();
      ctx.roundRect(11, 23, 12, 9, 3);
      ctx.fill();
    });

    create('enemy_bat', 34, 34, (ctx) => {
      // Nachtschwinge mit geschwungenen Lederflügeln
      const wingGrad = ctx.createLinearGradient(2, 6, 32, 28);
      wingGrad.addColorStop(0, '#3a1c57');
      wingGrad.addColorStop(0.5, '#241038');
      wingGrad.addColorStop(1, '#120520');

      ctx.fillStyle = wingGrad;
      // Linker Flügel
      ctx.beginPath();
      ctx.moveTo(17, 17);
      ctx.quadraticCurveTo(8, 6, 2, 9);
      ctx.quadraticCurveTo(7, 18, 4, 25);
      ctx.quadraticCurveTo(11, 21, 17, 17);
      ctx.fill();

      // Rechter Flügel
      ctx.beginPath();
      ctx.moveTo(17, 17);
      ctx.quadraticCurveTo(26, 6, 32, 9);
      ctx.quadraticCurveTo(27, 18, 30, 25);
      ctx.quadraticCurveTo(23, 21, 17, 17);
      ctx.fill();

      // Rumpf & Augen
      ctx.fillStyle = '#1e0c2b';
      ctx.beginPath();
      ctx.ellipse(17, 17, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff3838';
      ctx.fillRect(15, 14, 1.5, 2);
      ctx.fillRect(18, 14, 1.5, 2);
    });

    create('enemy_witch', 34, 34, (ctx) => {
      // Magische Sumpfhexe mit Zauberhut & Kugel
      ctx.fillStyle = '#301934';
      ctx.beginPath();
      ctx.moveTo(17, 4);
      ctx.lineTo(26, 17);
      ctx.lineTo(8, 17);
      ctx.closePath();
      ctx.fill();

      // Hutkrempe
      ctx.fillStyle = '#1e0c22';
      ctx.beginPath();
      ctx.ellipse(17, 17, 11, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Magische Kugel
      const orbGrad = ctx.createRadialGradient(24, 24, 1, 24, 24, 6);
      orbGrad.addColorStop(0, '#55efc4');
      orbGrad.addColorStop(0.7, '#00b894');
      orbGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(24, 24, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    create('enemy_slime', 34, 34, (ctx) => {
      // Glänzender Wackelschleim mit Lichtreflex
      const slimeGrad = ctx.createRadialGradient(15, 15, 2, 17, 20, 14);
      slimeGrad.addColorStop(0, '#55efc4');
      slimeGrad.addColorStop(0.6, '#00cec9');
      slimeGrad.addColorStop(1, '#0984e3');

      ctx.fillStyle = slimeGrad;
      ctx.beginPath();
      ctx.moveTo(7, 27);
      ctx.quadraticCurveTo(4, 15, 17, 8);
      ctx.quadraticCurveTo(30, 15, 27, 27);
      ctx.quadraticCurveTo(17, 29, 7, 27);
      ctx.closePath();
      ctx.fill();

      // Glanzlicht
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.ellipse(13, 13, 4, 2.5, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    });

    create('enemy_bomber', 34, 34, (ctx) => {
      // Sprengmeister mit Gusseisen-Bombe & Lunte
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.arc(17, 15, 8, 0, Math.PI * 2);
      ctx.fill();

      // Eisenbombe
      const bombGrad = ctx.createRadialGradient(15, 22, 1, 17, 24, 7);
      bombGrad.addColorStop(0, '#747d8c');
      bombGrad.addColorStop(0.7, '#2f3542');
      bombGrad.addColorStop(1, '#000000');

      ctx.fillStyle = bombGrad;
      ctx.beginPath();
      ctx.arc(17, 24, 7, 0, Math.PI * 2);
      ctx.fill();

      // Funke
      ctx.fillStyle = '#ffa502';
      ctx.fillRect(19, 15, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 16, 1.5, 1.5);
    });

    create('enemy_orc', 36, 36, (ctx) => {
      // Massiver Ork mit Hörnerhelm
      ctx.fillStyle = '#2f3640';
      ctx.beginPath();
      ctx.arc(18, 17, 10, 0, Math.PI * 2);
      ctx.fill();

      // Hörner
      ctx.fillStyle = '#f5f6fa';
      ctx.beginPath();
      ctx.moveTo(9, 15); ctx.quadraticCurveTo(5, 7, 2, 8); ctx.lineTo(8, 17);
      ctx.moveTo(27, 15); ctx.quadraticCurveTo(31, 7, 34, 8); ctx.lineTo(28, 17);
      ctx.fill();

      // Grimmiges Gesicht
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(14, 16, 2, 2);
      ctx.fillRect(20, 16, 2, 2);
    });

    create('enemy_boss', 42, 42, (ctx) => {
      // Majestätischer Titanen-Boss mit feuriger Aura
      const titanGrad = ctx.createRadialGradient(21, 21, 4, 21, 21, 20);
      titanGrad.addColorStop(0, '#ff4757');
      titanGrad.addColorStop(0.4, '#c0392b');
      titanGrad.addColorStop(0.8, '#2c0c11');
      titanGrad.addColorStop(1, '#110305');

      ctx.fillStyle = titanGrad;
      ctx.beginPath();
      ctx.arc(21, 21, 19, 0, Math.PI * 2);
      ctx.fill();

      // Dämonen-Hörner
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(11, 15); ctx.quadraticCurveTo(5, 3, 2, 5); ctx.lineTo(10, 19);
      ctx.moveTo(31, 15); ctx.quadraticCurveTo(37, 3, 40, 5); ctx.lineTo(32, 19);
      ctx.fill();

      // Glühende Augen & Spalten
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(16, 19, 2.5, 0, Math.PI * 2);
      ctx.arc(26, 19, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Alias-Maps für alle weiteren Monster im Code
    const aliasEnemy = (newKey: string, baseKey: string) => {
      create(newKey, 34, 34, (ctx) => {
        const baseImg = tm.get(baseKey).getSourceImage() as CanvasImageSource;
        if (baseImg) ctx.drawImage(baseImg, 0, 0, 34, 34);
      });
    };
    aliasEnemy('enemy_swamp_troll', 'enemy_orc');
    aliasEnemy('enemy_cave_goblin', 'enemy_goblin');
    aliasEnemy('enemy_bomber_tnt', 'enemy_bomber');
    aliasEnemy('enemy_armored_troll', 'enemy_orc');
    aliasEnemy('enemy_golem', 'enemy_orc');
    aliasEnemy('enemy_fire_imp', 'enemy_goblin');
    aliasEnemy('enemy_magma_orc', 'enemy_orc');
    aliasEnemy('enemy_hellhound', 'enemy_bat');
    aliasEnemy('enemy_lava_golem', 'enemy_boss');
    aliasEnemy('enemy_colossus', 'enemy_boss');
    aliasEnemy('enemy_titan', 'enemy_boss');

    // ==========================================
    // 7. MODERNE GESCHOSSE & EFFEKTE
    // ==========================================
    create('proj_arrow', 24, 8, (ctx) => {
      // Eleganter Holzpfeil mit Stahlspitze & Federn
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, 4);
      ctx.lineTo(18, 4);
      ctx.stroke();

      // Stahlspitze
      ctx.fillStyle = '#dfe4ea';
      ctx.beginPath();
      ctx.moveTo(23, 4);
      ctx.lineTo(17, 1);
      ctx.lineTo(17, 7);
      ctx.closePath();
      ctx.fill();

      // Befiederung
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.moveTo(2, 4); ctx.lineTo(6, 1); ctx.lineTo(8, 4);
      ctx.moveTo(2, 4); ctx.lineTo(6, 7); ctx.lineTo(8, 4);
      ctx.fill();
    });

    create('proj_cannonball', 16, 16, (ctx) => {
      // 3D-Gusseisenkugel mit Glanz
      const grad = ctx.createRadialGradient(5, 5, 1, 8, 8, 8);
      grad.addColorStop(0, '#a4b0be');
      grad.addColorStop(0.5, '#2f3542');
      grad.addColorStop(1, '#000000');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    create('proj_ice', 18, 18, (ctx) => {
      // Eisspitze mit Leuchten
      const grad = ctx.createLinearGradient(0, 0, 18, 18);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#74b9ff');
      grad.addColorStop(1, '#0984e3');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(9, 1);
      ctx.lineTo(17, 9);
      ctx.lineTo(9, 17);
      ctx.lineTo(1, 9);
      ctx.closePath();
      ctx.fill();
    });

    create('proj_poison', 16, 16, (ctx) => {
      // Säure-Ampulle
      const grad = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
      grad.addColorStop(0, '#55efc4');
      grad.addColorStop(0.7, '#00b894');
      grad.addColorStop(1, '#006266');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    create('proj_tesla', 20, 20, (ctx) => {
      // Energie-Plasmablitz
      ctx.fillStyle = 'rgba(0, 206, 201, 0.3)';
      ctx.beginPath();
      ctx.arc(10, 10, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, 10, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    create('proj_sniper', 26, 8, (ctx) => {
      // Hyperschall-Projektil mit Leuchtspur
      const grad = ctx.createLinearGradient(0, 4, 26, 4);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.4, '#ff4757');
      grad.addColorStop(1, '#ffffff');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 2, 26, 4);
    });

    // Effekte
    create('effect_hit', 20, 20, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, 10, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    create('effect_explosion', 48, 48, (ctx) => {
      const grad = ctx.createRadialGradient(24, 24, 2, 24, 24, 22);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ffa502');
      grad.addColorStop(0.7, '#ff4757');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
    });

    // Eis-Nova / Frost-Explosion (Kristalline Eiskrone)
    create('effect_frost', 48, 48, (ctx) => {
      const grad = ctx.createRadialGradient(24, 24, 2, 24, 24, 22);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#70a1ff');
      grad.addColorStop(0.7, '#00d2d3');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();

      // 8 Frostkristall-Strahlen
      ctx.strokeStyle = '#e0f7fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x1 = 24 + Math.cos(angle) * 4;
        const y1 = 24 + Math.sin(angle) * 4;
        const x2 = 24 + Math.cos(angle) * 20;
        const y2 = 24 + Math.sin(angle) * 20;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      // Diamantene Eissplitter
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 8;
        const sx = 24 + Math.cos(angle) * 12;
        const sy = 24 + Math.sin(angle) * 12;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Giftgas-Wolke / Toxische Explosion
    create('effect_poison', 48, 48, (ctx) => {
      const grad = ctx.createRadialGradient(24, 24, 2, 24, 24, 22);
      grad.addColorStop(0, '#7bed9f');
      grad.addColorStop(0.4, '#2ed573');
      grad.addColorStop(0.75, '#10ac84');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();

      // Giftige Gasbläschen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      [ {x: 18, y: 18, r: 3}, {x: 30, y: 22, r: 2.5}, {x: 22, y: 30, r: 2} ].forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // ==========================================
    // 8. MODERNE 3D-TÜRME (STUFE 1, 2, 3 + SPEZIALISIERUNGEN)
    // ==========================================
    const towerTypes = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];

    const modernTierColors: Record<number, { ring: string; trim: string; glow: string }> = {
      1: { ring: '#f1c40f', trim: '#fef160', glow: 'rgba(241, 196, 15, 0.4)' },
      2: { ring: '#e67e22', trim: '#ffb142', glow: 'rgba(230, 126, 34, 0.5)' },
      3: { ring: '#e74c3c', trim: '#ff7675', glow: 'rgba(231, 76, 60, 0.6)' }
    };

    towerTypes.forEach((type) => {
      for (let lvl = 1; lvl <= 3; lvl++) {
        const key = `tower_${type}_${lvl}`;
        const theme = modernTierColors[lvl];

        create(key, 40, 40, (ctx) => {
          // 1. Zylindrisches Stein-Fundament mit Radialschattierung
          const baseGrad = ctx.createRadialGradient(20, 26, 4, 20, 26, 18);
          baseGrad.addColorStop(0, '#3d384d');
          baseGrad.addColorStop(0.7, '#242031');
          baseGrad.addColorStop(1, '#15131f');

          ctx.fillStyle = baseGrad;
          ctx.beginPath();
          ctx.ellipse(20, 27, 16, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. Bevel-Zierring der Ausbaustufe (Gelb / Orange / Rot)
          ctx.strokeStyle = theme.ring;
          ctx.lineWidth = lvl >= 2 ? 2.5 : 1.8;
          ctx.beginPath();
          ctx.ellipse(20, 27, 14, 7.5, 0, 0, Math.PI * 2);
          ctx.stroke();

          // 3. Waffensystem
          if (type === 'archer') {
            // Balliste mit gespanntem Bogen
            ctx.fillStyle = '#654124';
            ctx.fillRect(17, 12, 6, 12);

            ctx.strokeStyle = theme.ring;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(20, 15, 11, -Math.PI / 1.3, -Math.PI / 4);
            ctx.stroke();

            // Bogensehne & Pfeilspitze
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(20, 5); ctx.lineTo(17, 11); ctx.lineTo(23, 11);
            ctx.closePath();
            ctx.fill();
          } else if (type === 'cannon') {
            // Schwere Gusseisen-Kanone
            const tubeGrad = ctx.createLinearGradient(14, 6, 26, 22);
            tubeGrad.addColorStop(0, '#747d8c');
            tubeGrad.addColorStop(0.5, '#2f3542');
            tubeGrad.addColorStop(1, '#1e272e');

            ctx.fillStyle = tubeGrad;
            ctx.beginPath();
            ctx.roundRect(14, 6, 12, 17, 3);
            ctx.fill();

            // Mündungsring
            ctx.fillStyle = theme.ring;
            ctx.beginPath();
            ctx.ellipse(20, 6, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === 'ice') {
            // Schwebender Prismen-Eisdiamant
            const iceGrad = ctx.createLinearGradient(12, 4, 28, 24);
            iceGrad.addColorStop(0, '#ffffff');
            iceGrad.addColorStop(0.4, '#74b9ff');
            iceGrad.addColorStop(1, '#0984e3');

            ctx.fillStyle = iceGrad;
            ctx.beginPath();
            ctx.moveTo(20, 3);
            ctx.lineTo(29, 15);
            ctx.lineTo(20, 26);
            ctx.lineTo(11, 15);
            ctx.closePath();
            ctx.fill();

            // Facettenlinie in Stufenfarbe
            ctx.strokeStyle = theme.ring;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else if (type === 'poison') {
            // Alchemie-Glasblase mit leuchtendem Gift
            const flaskGrad = ctx.createRadialGradient(20, 16, 2, 20, 16, 10);
            flaskGrad.addColorStop(0, '#55efc4');
            flaskGrad.addColorStop(0.7, '#00b894');
            flaskGrad.addColorStop(1, '#006266');

            ctx.fillStyle = flaskGrad;
            ctx.beginPath();
            ctx.arc(20, 16, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = theme.ring;
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (type === 'tesla') {
            // Hochvolt-Spule mit Plasma-Kugel
            ctx.fillStyle = '#2d3436';
            ctx.fillRect(17, 14, 6, 12);

            // Kupferspulen
            ctx.strokeStyle = theme.ring;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(20, 17, 7, 2.5, 0, 0, Math.PI * 2);
            ctx.ellipse(20, 21, 8, 2.8, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Plasmakugel oben
            const orbGrad = ctx.createRadialGradient(20, 8, 1, 20, 8, 6);
            orbGrad.addColorStop(0, '#ffffff');
            orbGrad.addColorStop(0.5, '#00cec9');
            orbGrad.addColorStop(1, '#0984e3');

            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(20, 8, 6, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === 'sniper') {
            // Präzisions-Gewehr auf Dreibein
            ctx.fillStyle = '#2f3542';
            ctx.beginPath();
            ctx.roundRect(18, 2, 4, 22, 2);
            ctx.fill();

            // Zieloptik
            ctx.fillStyle = theme.ring;
            ctx.beginPath();
            ctx.arc(20, 11, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(20, 11, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    });

    // Meister-Spezialisierungen A & B mit leuchtenden Prunk-Auren
    towerTypes.forEach((type) => {
      ['spec_a', 'spec_b'].forEach((specKey) => {
        const key = `tower_${type}_${specKey}`;
        const isPathA = specKey === 'spec_a';
        const auraColor = isPathA ? '#00d2d3' : '#9b59b6';

        create(key, 40, 40, (ctx) => {
          // Basis-Stufe-3 Rendering
          const baseImg = tm.get(`tower_${type}_3`).getSourceImage() as CanvasImageSource;
          if (baseImg) {
            ctx.drawImage(baseImg, 0, 0, 40, 40);
          }

          // Magische Meister-Aura
          ctx.strokeStyle = auraColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(20, 20, 17, 0, Math.PI * 2);
          ctx.stroke();

          // Meisterkrone
          ctx.fillStyle = auraColor;
          ctx.beginPath();
          ctx.moveTo(17, 3); ctx.lineTo(20, 0); ctx.lineTo(23, 3);
          ctx.fill();
        });
      });
    });
  }
}
