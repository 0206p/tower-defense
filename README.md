# 🏰 Retro Tower Defense

Ein hochqualitatives, authentisches **16-Bit-Retro-Pixel-Art-Tower-Defense-Spiel** für den Webbrowser – entwickelt mit **TypeScript**, **Phaser 3** und **Vite**.

![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)
![Phaser](https://img.shields.io/badge/Phaser-3.85-green.svg)
![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)
![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-orange.svg)

---

## 🎮 Über das Spiel

Tauche ein in eine epische Retro-Fantasy-Welt! Führe die Verteidigung des Königreichs gegen Horden von Monstern, Kobolden, Dämonen und uralten Titanen. Platziere Türme strategisch entlang kurvenreicher Pfade, meistere 150 abwechslungsreiche Missionen in drei einzigartigen Kampagnen-Welten und verstärke dein Arsenal dauerhaft in der magischen Turm-Schmiede.

Das Spiel läuft vollständig clientseitig ohne Backend- oder Cloud-Abhängigkeiten und speichert deinen Spielfortschritt, Sterne und Upgrades automatisch im lokalen Browserspeicher (`localStorage`).

---

## ✨ Haupt-Features

### 🗺️ Drei große Kampagnen-Welten (150 Missionen)
1. **Die Hexenwelt (Mission 1 – 50)**:
   * *Thema*: Sumpfland, dichte Wälder, Pilze und magische Pfade.
   * *Gegner*: Wald-Goblins, flinke Nachtschwingen, Sumpf-Hexen, Giftschleime und massive Sumpftrolle.
2. **Die Goblinhöhlen (Mission 51 – 100)**:
   * *Thema*: Dunkle Schiefer-Katakomben, Minenschienen und Goldadern.
   * *Freischaltung*: Nach erfolgreichem Abschluss aller 50 Missionen der Hexenwelt.
   * *Gegner*: Minen-Goblins, explosive Dynamit-Bomber, Höhlen-Orks, Panzertrolle und Kristall-Golems.
3. **Der Tote Berg (Mission 101 – 150)**:
   * *Thema*: Brennende Basaltfelsen, Lavaströme und Obsidian.
   * *Freischaltung*: Nach erfolgreichem Abschluss aller 50 Missionen der Goblinhöhlen.
   * *Gegner*: Feuer-Imps, Höllenhunde, Magma-Berserker, Obsidian-Kolosse und finale Vulkan-Titanen.

> Jede Mission besteht aus **10 taktischen Wellen** mit einem spektakulären Titanen-Bosskampf in Welle 10. Für jedes Level können bis zu **3 Sterne** erspielt werden.

---

### 🏹 Die 6 Turm-Klassen & In-Game-Ausbaustufen

Jeder Turm besitzt eine feste Rolle und kann **während des laufenden Spiels in 3 Stufen** aufgewertet werden. Die Ausbaustufen spiegeln sich optisch in der Farbcodierung und visuellen Details wider:
* **Stufe 1 (Gelb)**: Grundlegende Bastion
* **Stufe 2 (Orange)**: Verstärkte Veteranen-Waffe
* **Stufe 3 (Rot)**: Meisterstufe mit maximalem Zerstörungspotenzial

| Turm | Typ | Grundkosten | Beschreibung & Spezialeffekte |
| :--- | :--- | :---: | :--- |
| **Bogenschütze** | Schnell / Einzelziel | `100 G` | Feuert rasant Pfeilsalven (bis zu 4 Schüsse/Sekunde auf Stufe 3). Ideal gegen schnelle Ziele wie Fledermäuse und Goblins. |
| **Kanone** | AoE / Flächenschaden | `150 G` | Feuert schwere Mörsergranaten mit großem Explosionsradius. Zermalmt dichte Gruppen und Bodentruppen. |
| **Eismagier** | Verlangsamung & Kälte | `130 G` | Schleudert Frostkristalle, die Gegner im Umkreis um bis zu **75% verlangsamen** und Kälteschaden anrichten. |
| **Gift-Alchemist** | Säure & Schaden über Zeit | `135 G` | Wirft Säurebomben mit ätzendem Gift-DoT (Damage over Time), der Feinde über mehrere Sekunden zersetzt. |
| **Tesla-Spule** | Kettenblitz | `180 G` | Entlädt hochenergetische Blitzbögen, die automatisch auf bis zu **6 nahe Feinde** überspringen. |
| **Scharfschütze** | Weitreichend / Kritisch | `210 G` | Extreme Reichweite (deckt halbe Karte ab), massiver Einzelschaden und bis zu **50% Chance auf kritische Treffer (2.2x Schaden)**. |

### 🎯 Taktische Zielprioritäten (Targeting Priorities)
Jeder platzierte Turm kann individuell über das Turm-Menü auf eine von fünf Zielstrategien eingestellt werden:
* **ERSTER (Pfad)**: Greift den Gegner an, der dem Ziel am nächsten ist (Standard).
* **LETZTER (Start)**: Konzentriert sich auf Nachzügler nahe dem Eingang.
* **STÄRKSTER (HP)**: Attackiert den Feind mit den meisten aktuellen Lebenspunkten (ideal gegen Bosse und Golems).
* **SCHWÄCHSTER (Finisher)**: Erledigt angeschlagene Feinde sofort, um Leckagen zu verhindern.
* **NÄCHSTER (Distanz)**: Visiert das dem Turm am nächsten stehende Ziel an.

### 🛡️ Dynamische Gegner-Mechaniken & Boss-Phasen
* **Schildsystem**: Elite-Feinde (Panzertrolle, Kristall-Golems, Obsidian-Kolosse) und Bosse besitzen aktive Energieschilde (`0x00d2d3`), die vor den Lebenspunkten Schaden absorbieren.
* **Mehrphasiger Titanen-Boss**: Fällt der Boss unter 50% HP, gerät er in **Phase 2 (Enrage)**: Schnelligkeitsbonus (+35%), regenerierter Notfallschild und glühende Zorn-Optik!

### 🖱️ Drag & Drop, Repositionierung & Sofort-Löschen
* **Drag & Drop**: Neue Türme werden per Maus- oder Touch-Zug direkt auf das Spielfeld gezogen.
* **Repositionieren**: Platzierte Türme können in den Bauphasen auf andere freie Kacheln verschoben werden.
* **Schnell-Verkauf**: Klick auf das rote `✕`-Symbol oben rechts am Turm verkauft ihn mit 70% Rückerstattung.
* **Wellen-Bausperre**: Während einer laufenden Welle ist der Neubau gesperrt; bestehende Türme können jedoch weiterhin taktisch aufgewertet werden.

---

### 💎 Permanente Turm-Schmiede & Akademie

In jeder Mission verdienst du wertvolle **magische Kristalle** (durch Sterne und neue Missionsrekorde). In der **Turm-Schmiede** können alle 6 Türme permanent und individuell in 4 Disziplinen um bis zu **5 Stufen** verstärkt werden:

* ⚔️ **Schadenskraft**: Erhöht den Basis- und Flächenschaden aller Geschosse (+12% pro Stufe, bis zu **+60%**).
* ⏱️ **Angriffs-Frequenz**: Verringert die Nachladezeit und erhöht die Kadenz (+9% pro Stufe, bis zu **+45%**).
* 🎯 **Reichweite**: Vergrößert den Zielerfassungs-Radius (+8% pro Stufe, bis zu **+40%**).
* ⚡ **Schnelligkeit & Spezial**: Erhöht Projektiltempo, Giftdauer, Frost-Verlangsamung und Blitzketten-Ziele (+15% pro Stufe, bis zu **+75%**).
* 🔄 **Kristall-Respec**: Alle investierten Kristalle können jederzeit mit einem Klick kostenlos zurückgesetzt und neu verteilt werden!

---

### ⚖️ Ausgewogene mathematische Power-Curve

* **Startgold (`250 G`)**: Ermöglicht einen taktischen Start (z. B. 2 Bogenschützen oder 1 Kanone + 1 Bogenschütze), ohne die ersten Wellen trivial zu machen.
* **Münz-Ökonomie**: Gegnerbelohnungen und Wellenboni sind so austariert, dass Upgrades wohlüberlegt erspart werden müssen.
* **Sanfte 150-Level-Skalierung**:
  $$\text{HP-Multiplikator} = 1.0 + \left(\frac{\text{Level} - 1}{149}\right)^{1.2} \times 1.5$$
  Die Monster werden von Level 1 bis Level 150 stetig fordernder, sodass die Upgrades aus der Schmiede Hand in Hand mit dem Voranschreiten der Kampagne gehen.

---

### 🎵 Integriertes Chiptune-Soundtrack & Sound-System
* Vollständig **synthetisierter Chiptune-Retro-Soundtrack** (ohne externe MP3-Ladezeiten) über die Web Audio API.
* Eigene Soundeffekte für Pfeilschüsse, Kanonendonner, Eisfrost, Münzenklingen, Treffer und Turmbau.
* Jederzeit stummschaltbar (Sound-Toggle im Hauptmenü, HUD und Pausenmenü).

---

### 📱 Vollbild & Responsive Mobil-Unterstützung
* **Automatische 16:9-Zentrierung**: Auf Desktop-Monitoren, Laptops, Tablets und Smartphones passt sich das Spiel via `Phaser.Scale.FIT` und `CENTER_BOTH` optimal an.
* **Mobile Fullscreen**: Kein störendes Verschieben, keine abgeschnittenen Kanten – das Spielfeld nutzt die maximal verfügbare Displayfläche im Vollbild.
* **Touch-optimiert**: Alle Schaltflächen besitzen großzügige Touch-Hitboxen (`touch-action: none`), Gesten und Kontextmenüs des Mobilbrowsers werden sauber unterdrückt.

---

## 🛠️ Technische Architektur

```text
TowerDefense/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automatisches Deployment auf GitHub Pages
├── public/                       # Statische Assets & Favicon
├── src/
│   ├── config/
│   │   ├── EnemyConfig.ts        # Attribute aller 15 Feindtypen
│   │   ├── GameConfig.ts         # Globale Konstanten, Farben & Schriftart
│   │   ├── TowerConfig.ts        # Turmdefinitionen & 3 In-Game-Stufen
│   │   └── WorldConfig.ts        # Konfiguration der 3 Kampagnenwelten
│   ├── entities/
│   │   ├── Enemy.ts              # Feindlogik, Pfadbewegung, Statuseffekte & Healthbar
│   │   ├── Projectile.ts         # Geschosse, Homing-Logik, Splash, Frost & Blitze
│   │   └── Tower.ts              # Turmlogik, Reichweitenkreis, Upgrade & Verkauf
│   ├── scenes/
│   │   ├── BootScene.ts          # Texturgenerierung & Asset-Initialisierung
│   │   ├── GameOverScene.ts      # Niederlage-Bildschirm & Statistiken
│   │   ├── GameScene.ts          # Haupt-Gameplay-Schleife & Interaktionen
│   │   ├── MenuScene.ts          # Startbildschirm mit Weltenvorschau
│   │   ├── MissionSelectScene.ts # 50-Level-Raster je Welt (1..25 & 26..50)
│   │   ├── UpgradeMenuScene.ts   # Turm-Schmiede & dauerhafte Meta-Progression
│   │   ├── VictoryScene.ts       # Sieg-Bildschirm, Sterne & Kristallvergabe
│   │   └── WorldSelectScene.ts   # Weltenauswahl mit Freischaltlogik
│   ├── systems/
│   │   ├── EconomySystem.ts      # Gold, Leben, Highscore & Events
│   │   ├── MapManager.ts         # Pfadkurven, Kacheln & Bauplatzprüfung
│   │   ├── PixelTextureGenerator.ts # Programmatische 16-Bit-Grafikgenerierung
│   │   ├── SaveSystem.ts         # Lokale Spielstandverwaltung (localStorage)
│   │   ├── SoundManager.ts       # Synthetisierter Chiptune-Sound & Audio
│   │   └── WaveManager.ts        # Spawner, progressive Skalierung & Wellen
│   ├── ui/
│   │   ├── HUD.ts                # Obere Leiste: Leben, Gold, Welle, Tempo, Pause
│   │   ├── PauseModal.ts         # Pausen-Dialogfenster
│   │   ├── TowerInfoModal.ts     # Turmdetails, In-Game-Upgrade & Verkauf
│   │   └── TowerSelectionBar.ts  # Untere Bauleiste mit Hover-Stats
│   └── main.ts                   # Phaser-Spielkonfiguration & Einstiegspunkt
├── index.html                    # Responsive Web-Container & Font-Einbindung
├── package.json                  # Projektabhängigkeiten & Build-Skripte
├── tsconfig.json                 # TypeScript-Compiler-Konfiguration
└── vite.config.ts                # Vite-Konfiguration mit base: '/tower-defense/'
```

---

## 🚀 Lokale Entwicklung

### Voraussetzungen
* [Node.js](https://nodejs.org/) (Version 18 oder höher empfohlen)
* npm (oder pnpm / yarn)

### Installation
```bash
# Repository klonen
git clone https://github.com/0206p/tower-defense.git

# In das Projektverzeichnis wechseln
cd tower-defense

# Abhängigkeiten installieren
npm install
```

### Entwicklungsserver starten
```bash
npm run dev
```
Öffne anschließend **`http://localhost:5173/tower-defense/`** in deinem Browser.

### Produktions-Build erstellen
```bash
npm run build
```
Der fertige, optimierte und minifizierte Build wird in den Ordner `dist/` exportiert.

---

## 🌐 GitHub Pages Deployment

Das Projekt ist für das automatische Deployment via GitHub Actions auf GitHub Pages vorbereitet:
* **Repository:** `https://github.com/0206p/tower-defense`
* **Live-URL:** `https://0206p.github.io/tower-defense/`

### Deployment-Workflow
Bei jedem Push auf den Branch `main` führt der GitHub Actions Workflow (`.github/workflows/deploy.yml`) automatisch folgende Schritte aus:
1. `npm ci` (Saubere Installation der Abhängigkeiten)
2. `npm run build` (TypeScript-Prüfung & Vite-Produktionsbau)
3. Deployment des `dist/`-Verzeichnisses auf GitHub Pages

---

## 📜 Lizenz
Dieses Projekt steht unter der [MIT License](LICENSE).
Viel Spaß beim Spielen und Verteidigen des Königreichs!

