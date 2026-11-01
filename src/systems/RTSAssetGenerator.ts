import Phaser from 'phaser';

/**
 * RTSAssetGenerator
 * Generiert vorgerenderte 2.5D-CGI-Sprites im hochauflösenden Stil von StarCraft Remastered & Iron Marines.
 * Verwendet volumetrische 3D-Schattierung (Keylight 135°, Umgebungsverdeckung, Specular-Highlights,
 * Material-Texturen und weiche gerichtete Bodenschatten).
 */
export class RTSAssetGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    const tm = scene.textures;

    const create = (key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
      if (tm.exists(key)) {
        tm.remove(key); // Vorhandene minderwertige Texturen überschreiben
      }
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

    // =========================================================================
    // 1. BIOME 1: ZERG-CREEP (1280x720) - Lebendige, organische Biomasse
    // =========================================================================
    create('rts_terrain_creep', 1280, 720, (ctx) => {
      // 1.1 Finstere, pulsierende Bio-Grundierung
      const baseGrad = ctx.createRadialGradient(640, 360, 50, 640, 360, 800);
      baseGrad.addColorStop(0, '#1c0828');
      baseGrad.addColorStop(0.5, '#12041b');
      baseGrad.addColorStop(1, '#07010b');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // 1.2 Organische Schleim-Zellgewebe-Struktur (Multi-Layer Noise)
      ctx.save();
      for (let i = 0; i < 280; i++) {
        const x = ((i * 137.5) % 1280);
        const y = ((i * 89.3) % 720);
        const rad = 25 + ((i * 23) % 45);

        const blobGrad = ctx.createRadialGradient(x - rad * 0.25, y - rad * 0.25, 2, x, y, rad);
        blobGrad.addColorStop(0, 'rgba(107, 33, 168, 0.45)');
        blobGrad.addColorStop(0.5, 'rgba(59, 7, 100, 0.35)');
        blobGrad.addColorStop(0.85, 'rgba(23, 2, 38, 0.25)');
        blobGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = blobGrad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 1.3 Verzweigtes Bio-Adernetzwerk (Creep Veins mit leuchtendem Mutagen)
      const veinSeeds = [
        [{ x: 40, y: 80 }, { x: 220, y: 180 }, { x: 480, y: 160 }, { x: 740, y: 280 }, { x: 1040, y: 200 }, { x: 1240, y: 120 }],
        [{ x: 80, y: 640 }, { x: 340, y: 520 }, { x: 620, y: 580 }, { x: 920, y: 440 }, { x: 1200, y: 600 }],
        [{ x: 300, y: 40 }, { x: 460, y: 320 }, { x: 400, y: 540 }, { x: 580, y: 680 }],
        [{ x: 840, y: 60 }, { x: 780, y: 340 }, { x: 860, y: 520 }, { x: 1100, y: 650 }]
      ];

      veinSeeds.forEach((pts) => {
        // Tiefer Adern-Schatten (Furche in der Biomasse)
        ctx.strokeStyle = '#0a0110';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let p = 1; p < pts.length; p++) {
          const prev = pts[p - 1];
          const cur = pts[p];
          const mx = (prev.x + cur.x) / 2 + ((p % 2 === 0) ? 25 : -25);
          const my = (prev.y + cur.y) / 2 + ((p % 2 === 0) ? -20 : 20);
          ctx.quadraticCurveTo(mx, my, cur.x, cur.y);
        }
        ctx.stroke();

        // Leuchtende violette Adernwand
        ctx.strokeStyle = '#9333ea';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let p = 1; p < pts.length; p++) {
          const prev = pts[p - 1];
          const cur = pts[p];
          const mx = (prev.x + cur.x) / 2 + ((p % 2 === 0) ? 25 : -25);
          const my = (prev.y + cur.y) / 2 + ((p % 2 === 0) ? -20 : 20);
          ctx.quadraticCurveTo(mx, my, cur.x, cur.y);
        }
        ctx.stroke();

        // Mutagen-Kern (helles Magenta / Neon-Glühen)
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // 1.4 Toxische Pusteln & Creep-Tumore (3D-Kugelschattierung mit Glanzpunkt)
      const pustules = [
        { x: 190, y: 260, r: 16, toxic: true },
        { x: 280, y: 440, r: 13, toxic: false },
        { x: 540, y: 220, r: 20, toxic: true },
        { x: 690, y: 480, r: 15, toxic: false },
        { x: 890, y: 170, r: 18, toxic: true },
        { x: 1020, y: 410, r: 14, toxic: false },
        { x: 440, y: 610, r: 12, toxic: true },
        { x: 1140, y: 280, r: 16, toxic: false }
      ];

      pustules.forEach((pst) => {
        // Bodenschatten
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.ellipse(pst.x + 4, pst.y + pst.r * 0.7, pst.r * 1.3, pst.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D-Körper
        const pGrad = ctx.createRadialGradient(pst.x - pst.r * 0.35, pst.y - pst.r * 0.35, 1, pst.x, pst.y, pst.r);
        if (pst.toxic) {
          pGrad.addColorStop(0, '#bef264');
          pGrad.addColorStop(0.3, '#84cc16');
          pGrad.addColorStop(0.7, '#4d7c0f');
          pGrad.addColorStop(1, '#14532d');
        } else {
          pGrad.addColorStop(0, '#f472b6');
          pGrad.addColorStop(0.4, '#c026d3');
          pGrad.addColorStop(0.8, '#701a75');
          pGrad.addColorStop(1, '#2e0836');
        }
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(pst.x, pst.y, pst.r, 0, Math.PI * 2);
        ctx.fill();

        // Nasses Specular-Glanzlicht
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.ellipse(pst.x - pst.r * 0.35, pst.y - pst.r * 0.35, pst.r * 0.28, pst.r * 0.16, -0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 1.5 Aus dem Boden ragende Knochen- & Chitin-Stacheln
      const boneCliffs = [
        { x: 140, y: 160 }, { x: 740, y: 130 }, { x: 1060, y: 530 }, { x: 380, y: 640 }, { x: 1180, y: 180 }
      ];
      boneCliffs.forEach((bc) => {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.ellipse(bc.x + 8, bc.y + 12, 18, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();

        const bGrad = ctx.createLinearGradient(bc.x - 10, bc.y + 15, bc.x + 5, bc.y - 25);
        bGrad.addColorStop(0, '#451a03');
        bGrad.addColorStop(0.3, '#78350f');
        bGrad.addColorStop(0.7, '#d97706');
        bGrad.addColorStop(1, '#fef08a');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.moveTo(bc.x - 8, bc.y + 6);
        ctx.quadraticCurveTo(bc.x - 14, bc.y - 12, bc.x + 3, bc.y - 24);
        ctx.quadraticCurveTo(bc.x + 10, bc.y - 8, bc.x + 6, bc.y + 7);
        ctx.closePath();
        ctx.fill();

        // Kanten-Highlight
        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bc.x - 6, bc.y + 4);
        ctx.lineTo(bc.x + 3, bc.y - 24);
        ctx.stroke();
      });

      // 1.6 Subtiles hexagonales Taktik-Raster
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.06)';
      ctx.lineWidth = 1;
      const hexR = 36;
      for (let hy = 40; hy < 700; hy += hexR * 1.5) {
        for (let hx = 40; hx < 1260; hx += hexR * 1.732) {
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (a * Math.PI) / 3;
            const px = hx + Math.cos(angle) * hexR;
            const py = hy + Math.sin(angle) * hexR;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    });

    // =========================================================================
    // 2. BIOME 2: ALIEN-DSCHUNGEL (Bel'Shir Stil mit Mineralien & Felsen)
    // =========================================================================
    create('rts_terrain_jungle', 1280, 720, (ctx) => {
      // 2.1 Tiefer smaragdgrüner & tealfarbener Dschungelboden
      const jGrad = ctx.createLinearGradient(0, 0, 1280, 720);
      jGrad.addColorStop(0, '#04241b');
      jGrad.addColorStop(0.4, '#063a2b');
      jGrad.addColorStop(0.8, '#032016');
      jGrad.addColorStop(1, '#02130e');
      ctx.fillStyle = jGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // 2.2 Fels-Plateaus mit isometrischen Schichtstufen
      const rocks = [
        { x: 120, y: 180, w: 160, h: 90 },
        { x: 680, y: 150, w: 210, h: 100 },
        { x: 1020, y: 440, w: 180, h: 110 },
        { x: 260, y: 520, w: 190, h: 95 }
      ];

      rocks.forEach((rk) => {
        // Fels-Schatten
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(rk.x + rk.w / 2 + 10, rk.y + rk.h + 8, rk.w * 0.58, rk.h * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gesteins-Körper mit Schichtkanten
        const rGrad = ctx.createLinearGradient(rk.x, rk.y, rk.x + rk.w, rk.y + rk.h);
        rGrad.addColorStop(0, '#334155');
        rGrad.addColorStop(0.5, '#1e293b');
        rGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.roundRect(rk.x, rk.y, rk.w, rk.h, 16);
        ctx.fill();

        // Kanten-Highlights oben links (Lichteinfall)
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rk.x + 8, rk.y + rk.h - 8);
        ctx.lineTo(rk.x + 8, rk.y + 12);
        ctx.lineTo(rk.x + rk.w - 12, rk.y + 12);
        ctx.stroke();
      });

      // 2.3 Blaue Mineralien-Kristall-Geoden (StarCraft Khaydarin/Minerals)
      const crystalClusters = [
        { x: 200, y: 380 }, { x: 780, y: 380 }, { x: 1120, y: 220 }, { x: 510, y: 590 }
      ];

      crystalClusters.forEach((cl) => {
        // Kristall-Glühen
        const glow = ctx.createRadialGradient(cl.x, cl.y, 4, cl.x, cl.y, 42);
        glow.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        glow.addColorStop(0.6, 'rgba(2, 132, 199, 0.25)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, 42, 0, Math.PI * 2);
        ctx.fill();

        // 4 Facettierte Einzelkristalle
        const shards = [
          { ox: -12, oy: 6, h: 28, w: 10, rot: -0.2 },
          { ox: 0, oy: -8, h: 36, w: 12, rot: 0.05 },
          { ox: 14, oy: 4, h: 26, w: 9, rot: 0.25 },
          { ox: -4, oy: 12, h: 20, w: 8, rot: -0.1 }
        ];

        shards.forEach((sh) => {
          ctx.save();
          ctx.translate(cl.x + sh.ox, cl.y + sh.oy);
          ctx.rotate(sh.rot);

          const cGrad = ctx.createLinearGradient(-sh.w / 2, -sh.h / 2, sh.w / 2, sh.h / 2);
          cGrad.addColorStop(0, '#e0f2fe');
          cGrad.addColorStop(0.3, '#38bdf8');
          cGrad.addColorStop(0.7, '#0284c7');
          cGrad.addColorStop(1, '#0c4a6e');
          ctx.fillStyle = cGrad;

          ctx.beginPath();
          ctx.moveTo(0, -sh.h / 2);
          ctx.lineTo(sh.w / 2, 0);
          ctx.lineTo(sh.w * 0.35, sh.h / 2);
          ctx.lineTo(-sh.w * 0.35, sh.h / 2);
          ctx.lineTo(-sh.w / 2, 0);
          ctx.closePath();
          ctx.fill();

          // Scharfe Facetten-Glanzkante
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -sh.h / 2);
          ctx.lineTo(0, sh.h / 2);
          ctx.stroke();

          ctx.restore();
        });
      });
    });

    // =========================================================================
    // 3. BIOME 3: TERRAN ORBITAL PLATFORM (Stahlplatten, Lüfter, Warnstreifen)
    // =========================================================================
    create('rts_terrain_metal_platform', 1280, 720, (ctx) => {
      // 3.1 Weltraum-Tiefschwarz mit kosmischem Nebel
      const spGrad = ctx.createLinearGradient(0, 0, 0, 720);
      spGrad.addColorStop(0, '#06090e');
      spGrad.addColorStop(0.5, '#0b111b');
      spGrad.addColorStop(1, '#05070b');
      ctx.fillStyle = spGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // 3.2 Nahtlose 80x40 Isometrische Stahlkacheln
      const tw = 80;
      const th = 40;
      for (let y = 0; y < 720; y += th) {
        for (let x = 0; x < 1280; x += tw) {
          const pGrad = ctx.createLinearGradient(x, y, x + tw, y + th);
          pGrad.addColorStop(0, '#283344');
          pGrad.addColorStop(0.4, '#1b2330');
          pGrad.addColorStop(1, '#111722');
          ctx.fillStyle = pGrad;
          ctx.fillRect(x + 1, y + 1, tw - 2, th - 2);

          // Obere/linke Fase (Highlight)
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 1, y + th - 2);
          ctx.lineTo(x + 1, y + 1);
          ctx.lineTo(x + tw - 2, y + 1);
          ctx.stroke();

          // Nieten an den Plattenecken
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x + 4, y + 4, 2, 2);
          ctx.fillRect(x + tw - 6, y + 4, 2, 2);
          ctx.fillRect(x + 4, y + th - 6, 2, 2);
          ctx.fillRect(x + tw - 6, y + th - 6, 2, 2);
        }
      }

      // 3.3 Warnmarkierungen (Gelb-Schwarz gestreifte Gefahrenzonen)
      const hazardBands = [
        { x: 160, y: 220, w: 160, h: 14 },
        { x: 820, y: 440, w: 200, h: 14 }
      ];
      hazardBands.forEach((hb) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(hb.x, hb.y, hb.w, hb.h);
        ctx.clip();
        for (let s = -20; s < hb.w + 40; s += 16) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(hb.x + s, hb.y);
          ctx.lineTo(hb.x + s + 10, hb.y);
          ctx.lineTo(hb.x + s - 4, hb.y + hb.h);
          ctx.lineTo(hb.x + s - 14, hb.y + hb.h);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(hb.x + s + 10, hb.y);
          ctx.lineTo(hb.x + s + 18, hb.y);
          ctx.lineTo(hb.x + s + 4, hb.y + hb.h);
          ctx.lineTo(hb.x + s - 4, hb.y + hb.h);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
    });

    // =========================================================================
    // 4. TURM 1: SIEGE GAUSS CANNON (Terran Siege Tank Style)
    // =========================================================================
    // 4.1 Basis mit 4 massiven Ketten-Auslegern & Hydraulik (84x84)
    create('rts_tower_cannon_base', 84, 84, (ctx) => {
      const cx = 42;
      const cy = 44;

      // Realistischer weicher Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(cx + 6, cy + 12, 36, 18, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // 4 Kettenmodule / Panzer-Ausleger (diagonal angeordnet)
      const tracks = [
        { x: cx - 24, y: cy - 18, w: 18, h: 12 },
        { x: cx + 8, y: cy - 18, w: 18, h: 12 },
        { x: cx - 26, y: cy + 8, w: 20, h: 14 },
        { x: cx + 8, y: cy + 8, w: 20, h: 14 }
      ];

      tracks.forEach((tr) => {
        // Kettenkörper
        const tGrad = ctx.createLinearGradient(tr.x, tr.y, tr.x, tr.y + tr.h);
        tGrad.addColorStop(0, '#475569');
        tGrad.addColorStop(0.5, '#1e293b');
        tGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.roundRect(tr.x, tr.y, tr.w, tr.h, 3);
        ctx.fill();

        // Kettenglieder
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        for (let gx = tr.x + 3; gx < tr.x + tr.w - 1; gx += 4) {
          ctx.beginPath();
          ctx.moveTo(gx, tr.y);
          ctx.lineTo(gx, tr.y + tr.h);
          ctx.stroke();
        }
      });

      // Zentraler oktogonaler Panzer-Wannenrumpf
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      const r = 26;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * (r * 0.68);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const hullGrad = ctx.createLinearGradient(-20, -18, 20, 18);
      hullGrad.addColorStop(0, '#64748b');
      hullGrad.addColorStop(0.3, '#334155');
      hullGrad.addColorStop(0.8, '#1e293b');
      hullGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = hullGrad;
      ctx.fill();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Drehkranz-Kugellager
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // 4.2 Drehbares schweres Zwillings-Gauss-Geschütz (84x84)
    create('rts_tower_cannon_turret', 84, 84, (ctx) => {
      const cx = 42;
      const cy = 42;

      // Turmkuppel mit schrägen Panzerplatten
      const cGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 20);
      cGrad.addColorStop(0, '#94a3b8');
      cGrad.addColorStop(0.4, '#475569');
      cGrad.addColorStop(0.8, '#1e293b');
      cGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 14, 32, 28, 8);
      ctx.fill();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Zwillings-Kanonenrohre mit Mündungsbremsen & Kühlrippen
      const barrels = [-6, 3];
      barrels.forEach((by) => {
        // Waffenrohr
        const bGrad = ctx.createLinearGradient(cx + 8, cy + by, cx + 36, cy + by + 4);
        bGrad.addColorStop(0, '#64748b');
        bGrad.addColorStop(0.5, '#334155');
        bGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bGrad;
        ctx.fillRect(cx + 8, cy + by, 28, 5);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 8, cy + by, 28, 5);

        // Geschlitzte Mündungsbremse am Rohrende
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx + 33, cy + by - 1, 4, 7);
        ctx.strokeStyle = '#f8fafc';
        ctx.strokeRect(cx + 33, cy + by - 1, 4, 7);
      });

      // Terran Zieloptik-Sensor (Laser/Cyan-Linse)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx + 2, cy - 10, 6, 4);
      // Faction-Rot Akzent
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 12, cy - 2, 8, 4);
    });

    // =========================================================================
    // 5. TURM 2: PHOTON PLASMA PYLON (Protoss Style)
    // =========================================================================
    // 5.1 Goldlegierungs-Pylonenfuß (84x84)
    create('rts_tower_tesla_base', 84, 84, (ctx) => {
      const cx = 42;
      const cy = 44;

      // Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy + 12, 30, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3 Gebogene Protoss-Goldpylonen
      const pylonAngles = [-Math.PI * 0.75, -Math.PI * 0.15, Math.PI * 0.55];
      pylonAngles.forEach((a) => {
        const px = cx + Math.cos(a) * 20;
        const py = cy + Math.sin(a) * 13;

        const gGrad = ctx.createLinearGradient(px - 10, py - 10, px + 10, py + 10);
        gGrad.addColorStop(0, '#fef08a');
        gGrad.addColorStop(0.4, '#eab308');
        gGrad.addColorStop(0.8, '#a16207');
        gGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = gGrad;

        ctx.beginPath();
        ctx.moveTo(px, py - 16);
        ctx.quadraticCurveTo(px + 8, py, px + 4, py + 10);
        ctx.lineTo(px - 4, py + 10);
        ctx.quadraticCurveTo(px - 8, py, px, py - 16);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });

    // 5.2 Schwebender Khaydarin-Plasmakristall (48x48)
    create('rts_tower_tesla_core', 48, 48, (ctx) => {
      const cx = 24;
      const cy = 24;

      // Glühender Psi-Kranz
      const gGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
      gGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      gGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.85)');
      gGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.35)');
      gGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();

      // Facettierter Kristall-Diamant
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 10, cy);
      ctx.lineTo(cx, cy + 14);
      ctx.lineTo(cx - 10, cy);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // =========================================================================
    // 6. TURM 3: SENTRY RAILGUN BUNKER (Terran Sniper Style)
    // =========================================================================
    create('rts_tower_sniper_base', 84, 84, (ctx) => {
      const cx = 42;
      const cy = 44;

      // Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(cx + 6, cy + 10, 32, 16, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Massiver quadratischer Bunker mit abgeschrägten Kanten
      const bGrad = ctx.createLinearGradient(cx - 20, cy - 16, cx + 20, cy + 16);
      bGrad.addColorStop(0, '#475569');
      bGrad.addColorStop(0.5, '#334155');
      bGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 22, cy - 16, 44, 32, 6);
      ctx.fill();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sichtschlitze & Lüfter
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 14, cy - 10, 28, 4);
    });

    create('rts_tower_sniper_turret', 84, 84, (ctx) => {
      const cx = 42;
      const cy = 42;

      // Drehbare Railgun-Lafette
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Langes Railgun-Schienenrohr
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx + 6, cy - 3, 32, 6);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + 6, cy - 3, 32, 6);

      // Leuchtende blaue Magnetspulen
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx + 12, cy - 4, 3, 8);
      ctx.fillRect(cx + 20, cy - 4, 3, 8);
      ctx.fillRect(cx + 28, cy - 4, 3, 8);
    });

    // =========================================================================
    // 7. EINHEIT 1: ECHTER ZERGLING (72x72) - Hochdetaillierte Chitin-Bestie
    // =========================================================================
    create('rts_unit_zergling', 72, 72, (ctx) => {
      const cx = 36;
      const cy = 36;

      // 7.1 Weicher 3D-Boden-Kontaktschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy + 12, 24, 10, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // 7.2 Raptor-Sprunghinterbeine mit Gelenken
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      // Linkes Bein
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 2);
      ctx.lineTo(cx - 20, cy + 14);
      ctx.lineTo(cx - 28, cy + 12);
      ctx.stroke();
      // Rechtes Bein
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy + 2);
      ctx.lineTo(cx + 18, cy + 16);
      ctx.lineTo(cx + 26, cy + 13);
      ctx.stroke();

      // 7.3 Segmentierter Chitin-Panzerrumpf (Burgund & Deep Purple)
      const bGrad = ctx.createLinearGradient(cx - 14, cy - 10, cx + 14, cy + 10);
      bGrad.addColorStop(0, '#c084fc');
      bGrad.addColorStop(0.3, '#7e22ce');
      bGrad.addColorStop(0.7, '#4c1d95');
      bGrad.addColorStop(1, '#2e1065');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.ellipse(cx - 2, cy + 1, 16, 11, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Carapax-Panzerrippen (Volumetrischer Glanz)
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx - 5, cy, 7, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 1, cy, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // 7.4 IKONISCHE DORSAL-FLÜGELSTACHELN (Zergling Wing Spikes)
      // Linke Rückensichel
      const sGradL = ctx.createLinearGradient(cx - 6, cy - 2, cx - 18, cy - 26);
      sGradL.addColorStop(0, '#78350f');
      sGradL.addColorStop(0.4, '#d97706');
      sGradL.addColorStop(0.85, '#fef08a');
      sGradL.addColorStop(1, '#dc2626'); // Blutige Spitze
      ctx.fillStyle = sGradL;

      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 2);
      ctx.quadraticCurveTo(cx - 20, cy - 18, cx - 14, cy - 26);
      ctx.quadraticCurveTo(cx - 8, cy - 14, cx - 1, cy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rechte Rückensichel
      const sGradR = ctx.createLinearGradient(cx + 4, cy - 2, cx + 18, cy - 26);
      sGradR.addColorStop(0, '#78350f');
      sGradR.addColorStop(0.4, '#d97706');
      sGradR.addColorStop(0.85, '#fef08a');
      sGradR.addColorStop(1, '#dc2626');
      ctx.fillStyle = sGradR;

      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - 2);
      ctx.quadraticCurveTo(cx + 20, cy - 18, cx + 18, cy - 26);
      ctx.quadraticCurveTo(cx + 10, cy - 14, cx + 7, cy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 7.5 Raubtierkopf mit Unterkiefer-Mandibeln & leuchtenden Augen
      const hGrad = ctx.createRadialGradient(cx + 14, cy - 2, 1, cx + 12, cy, 9);
      hGrad.addColorStop(0, '#9333ea');
      hGrad.addColorStop(0.6, '#581c87');
      hGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.arc(cx + 12, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      // Unterkiefer-Mandibeln (Sichelzangen)
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 16, cy - 4);
      ctx.quadraticCurveTo(cx + 24, cy - 2, cx + 22, cy + 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 16, cy + 4);
      ctx.quadraticCurveTo(cx + 24, cy + 2, cx + 22, cy - 2);
      ctx.stroke();

      // Leuchtende Bernstein-Augen
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx + 14, cy - 2, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 8. EINHEIT 2: HYDRALISK (80x80) - Aufragender Schlangenkörper mit Sichelarmen
    // =========================================================================
    create('rts_unit_hydralisk', 80, 80, (ctx) => {
      const cx = 40;
      const cy = 42;

      // Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy + 14, 28, 12, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Geschwungener Schlangenleib
      const sGrad = ctx.createLinearGradient(cx - 12, cy + 8, cx + 18, cy + 20);
      sGrad.addColorStop(0, '#581c87');
      sGrad.addColorStop(0.5, '#3b0764');
      sGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 18, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Aufgerichteter Oberkörper
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.roundRect(cx - 8, cy - 14, 16, 22, 6);
      ctx.fill();

      // Ikonische aufgefächerte Chitin-Kopfhaube (Hydralisk Crest Hood)
      const hdGrad = ctx.createLinearGradient(cx - 16, cy - 26, cx + 16, cy - 10);
      hdGrad.addColorStop(0, '#c084fc');
      hdGrad.addColorStop(0.5, '#6b21a8');
      hdGrad.addColorStop(1, '#3b0764');
      ctx.fillStyle = hdGrad;

      ctx.beginPath();
      ctx.moveTo(cx, cy - 26);
      ctx.quadraticCurveTo(cx + 18, cy - 22, cx + 14, cy - 10);
      ctx.lineTo(cx - 14, cy - 10);
      ctx.quadraticCurveTo(cx - 18, cy - 22, cx, cy - 26);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Mächtige Sensen-Klingenarme
      const bladeGrad = ctx.createLinearGradient(cx - 10, cy, cx - 26, cy + 12);
      bladeGrad.addColorStop(0, '#78350f');
      bladeGrad.addColorStop(0.5, '#d97706');
      bladeGrad.addColorStop(1, '#fef08a');
      ctx.fillStyle = bladeGrad;

      // Linke Sichel
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 6);
      ctx.quadraticCurveTo(cx - 26, cy - 10, cx - 22, cy + 10);
      ctx.lineTo(cx - 16, cy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.stroke();

      // Rechte Sichel
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 6);
      ctx.quadraticCurveTo(cx + 26, cy - 10, cx + 22, cy + 10);
      ctx.lineTo(cx + 16, cy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Leuchtende Giftaugen
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 12, 1.8, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy - 12, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 9. EINHEIT 3: GOLIATH ASSAULT MECH (76x76) - Terran Walker mit Raketen & Kanonen
    // =========================================================================
    create('rts_unit_mech', 76, 76, (ctx) => {
      const cx = 38;
      const cy = 40;

      // Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy + 14, 24, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bipolare Walker-Beine mit Kniehydraulik
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      // Linkes Bein
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 2);
      ctx.lineTo(cx - 18, cy + 14);
      ctx.lineTo(cx - 22, cy + 22);
      ctx.stroke();
      // Rechtes Bein
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy + 2);
      ctx.lineTo(cx + 18, cy + 14);
      ctx.lineTo(cx + 22, cy + 22);
      ctx.stroke();

      // Gepanzerte Cockpit-Kanzel
      const mGrad = ctx.createLinearGradient(cx - 14, cy - 16, cx + 14, cy + 10);
      mGrad.addColorStop(0, '#94a3b8');
      mGrad.addColorStop(0.4, '#475569');
      mGrad.addColorStop(0.8, '#1e293b');
      mGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 14, cy - 16, 28, 24, 5);
      ctx.fill();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Panzerglas-Visierschlitz (Cyan)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 8, cy - 10, 16, 3);

      // Zwillings-Autokanonen am Unterbau
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 8, cy + 8, 4, 10);
      ctx.fillRect(cx + 4, cy + 8, 4, 10);

      // Schulter-Raketenwerfer (Hellfire Missile Pods)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 22, cy - 14, 8, 12);
      ctx.fillRect(cx + 14, cy - 14, 8, 12);
      // Rote Raketenköpfe
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 21, cy - 15, 3, 2);
      ctx.fillRect(cx - 17, cy - 15, 3, 2);
      ctx.fillRect(cx + 15, cy - 15, 3, 2);
      ctx.fillRect(cx + 19, cy - 15, 3, 2);
    });

    // =========================================================================
    // 10. EINHEIT 4: VOID SKIMMER (72x72) - Protoss Psi-Gleiter mit Schwebeschatten
    // =========================================================================
    create('rts_unit_skimmer', 72, 72, (ctx) => {
      const cx = 36;
      const cy = 32;

      // Abgesetzter Bodenschatten (Schwebe-Illusion)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy + 24, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Aerodynamischer Gold-Rumpf (Pfeilflügel)
      const wGrad = ctx.createLinearGradient(cx - 20, cy - 10, cx + 20, cy + 10);
      wGrad.addColorStop(0, '#fef08a');
      wGrad.addColorStop(0.4, '#eab308');
      wGrad.addColorStop(0.8, '#a16207');
      wGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = wGrad;

      ctx.beginPath();
      ctx.moveTo(cx + 22, cy);
      ctx.lineTo(cx - 18, cy - 16);
      ctx.lineTo(cx - 10, cy);
      ctx.lineTo(cx - 18, cy + 16);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Zentraler schwebender Psi-Kristall (Cyan)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx - 2, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ionentriebwerk-Glühen
      const tGrad = ctx.createRadialGradient(cx - 14, cy, 1, cx - 14, cy, 8);
      tGrad.addColorStop(0, '#67e8f9');
      tGrad.addColorStop(0.5, '#0284c7');
      tGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tGrad;
      ctx.beginPath();
      ctx.arc(cx - 14, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 11. RTS-BEFEHLSKONSOLE BOTTOM PANEL (1280x160)
    // =========================================================================
    create('rts_console_bottom_panel', 1280, 160, (ctx) => {
      // Tiefes Titan-/Carbon-Panel
      const cGrad = ctx.createLinearGradient(0, 0, 0, 160);
      cGrad.addColorStop(0, '#1e293b');
      cGrad.addColorStop(0.15, '#0f172a');
      cGrad.addColorStop(1, '#020617');
      ctx.fillStyle = cGrad;
      ctx.fillRect(0, 0, 1280, 160);

      // Obere Kantenfase mit blauem Neon-Führungsstreifen
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(1280, 2);
      ctx.stroke();

      // 1. Radar-Fenster Rahmen (Links)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 14, 256, 132);
      ctx.fillStyle = '#060d17';
      ctx.fillRect(34, 16, 252, 128);

      // 2. Wireframe / Infopanel Rahmen (Mitte)
      ctx.strokeRect(312, 14, 616, 132);
      ctx.fillStyle = '#050a12';
      ctx.fillRect(314, 16, 612, 128);

      // 3. Command Card Rahmen (Rechts)
      ctx.strokeRect(952, 14, 296, 132);
      ctx.fillStyle = '#060d17';
      ctx.fillRect(954, 16, 292, 128);
    });
  }
}
