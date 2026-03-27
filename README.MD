# Hierbei handelt es sich um einen Fork des von simon42 gebauten dynamischen Dashboards - ich erweitere das Dashboard um die power_flow_card


<summary>Installation</summary>

1. Gehe zu HACS → **Custom repositories**
2. Füge das Repository hinzu: `https://github.com/schloenkomat/schloenkomat-dashboard`
3. Installiere "Schloenkomat Dashboard"
4. Folge den Anweisungen in HACS für die Resource-Registrierung und Dashboard-Erstellung.

<summary>Dashboard erstellen</summary>

1. Gehe zu **Einstellungen** → **Dashboards**
2. Klicke auf **Dashboard hinzufügen**
3. Wähle **Neue Ansicht** und dann den **Edit-Modus**
4. Klicke auf die **drei Punkte** (⋮) → **Raw-Konfigurationseditor**
5. Füge die folgende Konfiguration ein:

```yaml
strategy:
  type: custom:schloenkomat-dashboard
```

> **⚠️ Hinweis:** Nachfolgend findet sich die Möglichkeit zur Unterstützung von Simon42

Unterstütze die Weiterentwicklung:

<p align="center">
  <a href="https://youtube.com/@simon42/join">
    <img src="https://img.shields.io/badge/YouTube-Kanalmitglied_werden-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube Kanalmitglied werden" />
  </a>
  <br/>
  <em>🫶 Bevorzugte Unterstützung: Werde Kanalmitglied auf YouTube!</em>
  <br/><br/>
  <a href="https://www.buymeacoffee.com/simon42official">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-Spende_einen_Kaffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
</p>

---

## 🎨 Grafischer Konfigurator

Der Editor bietet eine intuitive dreistufige Hierarchie zur Konfiguration:

### Stufe 1: Bereiche verwalten

```
☰ Drag-Handle        Ziehe Bereiche, um die Reihenfolge zu ändern
☑️ Area-Checkbox      Bereich ein-/ausblenden
▶ Expand-Button       Klappt Domain-Gruppen auf
📊 Entity-Counter     Anzahl der Entities im Bereich
```

**Beispiel:**
```
☰ ☑️ ▶ Wohnzimmer (12)
☰ ☑️ ▶ Küche (8)
☰ ☐ ▶ Garage (5)      ← ausgeblendet
```

### Stufe 2: Domain-Gruppen

Nach dem Aufklappen eines Bereichs siehst du die Entity-Domains:

```
☑️ Gruppen-Checkbox   Alle Entities dieser Domain ein-/ausblenden
⊟ Indeterminate       Bei teilweise ausgewählten Entities
🔧 Domain-Icon        Visuelles Symbol für die Domain
📊 Entity-Count       Anzahl der Entities in dieser Domain
▶ Expand-Button       Klappt Entity-Liste auf
```

**Beispiel:**
```
▼ Wohnzimmer
   ☑️ 💡 Beleuchtung (5)
   ⊟ 🌡️ Klima (2)      ← teilweise ausgewählt
   ☑️ 🪟 Rollos (3)
```

### Stufe 3: Einzelne Entities

In der aufgeklappten Entity-Liste:

```
☑️ Entity-Checkbox    Entity ein-/ausblenden
📝 Friendly-Name      Lesbarer Entity-Name
🔤 Entity-ID          Technische ID (monospace)
```

**Beispiel:**
```
▼ 💡 Beleuchtung (5)
   ☑️ Deckenlampe        (light.wohnzimmer_decke)
   ☑️ Stehlampe          (light.wohnzimmer_stehlampe)
   ☐ Alte Lampe          (light.wohnzimmer_alt) ← ausgeblendet
```

### Editor-Features

- **Persistenter State** - Aufgeklappte Bereiche bleiben während der Konfiguration offen
- **Automatisches Speichern** - Änderungen werden sofort in die Config übernommen
- **Intelligente Gruppierung** - Entities werden automatisch nach Domain erkannt
- **Visuelle Hierarchie** - Einrückungen zeigen die Struktur klar
- **Drag & Drop** - Intuitive Neuordnung per Maus

## ⚙️ Konfiguration

### Basis-Konfiguration

```yaml
strategy:
  type: custom:simon42-dashboard
  show_weather: true             # Wetter-Karte anzeigen
  show_energy: true              # Energie-Dashboard anzeigen
  show_subviews: false           # Utility Views als Subviews
  show_search_card: false        # Optional: Search Card in Overview
  show_covers_summary: true      # Rollo-Zusammenfassung anzeigen
  summaries_columns: 2           # Layout: 2 (2x2) oder 4 (1x4)
  group_by_floors: false         # Bereiche nach Etagen gruppieren
```

### Erweiterte Konfiguration mit Entity-Filterung

```yaml
strategy:
  type: custom:simon42-dashboard
  show_weather: true
  show_energy: true
  show_subviews: false
  group_by_floors: true
  
  # Bereich-Verwaltung
  areas_display:
    hidden: 
      - bad
      - garage
    order:
      - wohnzimmer
      - kueche
      - schlafzimmer
  
  # Entity-Filterung pro Bereich
  areas_options:
    wohnzimmer:
      groups_options:
        lights:
          hidden: 
            - light.stehlampe
            - light.alte_lampe
          order:
            - light.decke
            - light.couch
            - light.schrank
        climate:
          hidden:
            - climate.old_thermostat
        covers:
          hidden:
            - cover.rollo_links
    
    kueche:
      groups_options:
        lights:
          hidden:
            - light.dunstabzug
        switches:
          hidden:
            - switch.kaffeemaschine
```

### Konfigurations-Parameter

#### Globale Optionen

| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `show_weather` | boolean | `true` | Zeigt die Wetter-Karte in der Übersicht (falls Weather-Entity vorhanden) |
| `show_energy` | boolean | `true` | Zeigt das Energie-Dashboard in der Übersicht |
| `show_subviews` | boolean | `false` | Zeigt Utility-Views in der Navigation |
| `show_search_card` | boolean | `false` | Zeigt optional eine Search Card in der Übersicht |
| `show_covers_summary` | boolean | `true` | Zeigt die Rollo-Zusammenfassungskarte in der Übersicht |
| `summaries_columns` | number | `2` | Layout der Zusammenfassungskarten: `2` (2x2 Grid) oder `4` (1x4 Reihe) |
| `group_by_floors` | boolean | `false` | Gruppiert Bereiche nach Etagen/Floors |

#### `areas_display` - Bereich-Verwaltung

```yaml
areas_display:
  hidden: [area_id1, area_id2]   # Array: IDs der ausgeblendeten Bereiche
  order: [area_id3, area_id1]    # Array: Custom Sortierung der Bereiche
```

#### `areas_options` - Entity-Verwaltung

```yaml
areas_options:
  {area_id}:                     # ID des Bereichs
    groups_options:              # Domain-spezifische Optionen
      {domain}:                  # Domain-Name (z.B. lights, climate, covers)
        hidden: [entity_id1]     # Array: Ausgeblendete Entity-IDs
        order: [entity_id2]      # Array: Custom Sortierung der Entities
```

**Verfügbare Domains:**
- `lights` - Beleuchtung
- `climate` - Klimageräte (Thermostate, AC)
- `covers` - Rollos, Vorhänge, Jalousien
- `switches` - Schalter
- `sensors` - Sensoren
- `binary_sensors` - Binäre Sensoren
- `cameras` - Kameras
- `media_players` - Media Player
- `locks` - Schlösser
- `vacuum` - Saugroboter
- `fan` - Ventilatoren

## 🏷️ Label-System

### Globale Labels

Das Dashboard unterstützt Labels für die globale Filterung:

| Label | Funktion | Verwendung |
|-------|----------|------------|
| `no_dboard` | **Globale Exklusion** | Entity wird nirgendwo im Dashboard angezeigt, auch nicht im Konfigurator |
| `show_dboard` | *Reserviert* | Für zukünftige Verwendung |

### Label verwenden

1. Gehe zu **Einstellungen** → **Geräte & Dienste** → **Entities**
2. Wähle die gewünschte Entity aus
3. Klicke auf **Labels** und füge `no_dboard` hinzu

**Ideal für:**
- Debug-Sensoren
- Hilfs-Entities
- Template-Sensoren für Automatisierungen
- Interne Systemwerte

### Kombinierbarkeit

Labels und `groups_options` ergänzen sich perfekt:

```yaml
# Beispiel-Setup:

# Global versteckt (Label):
- light.debug_light (hat Label "no_dboard")
  → Wird nirgendwo im Dashboard angezeigt

# Im Wohnzimmer versteckt (Config):
- light.stehlampe (in groups_options.lights.hidden)
  → Wird nur im Wohnzimmer nicht angezeigt
  → Erscheint aber z.B. in der Lichter-Übersicht
```

**Filterlogik:**
1. ✅ `no_dboard` Label → **Globale Exklusion**
2. ✅ `groups_options.hidden` → **Bereich-spezifische Exklusion**
3. ✅ Entity Registry Status → Disabled/Hidden Entities werden gefiltert
4. ✅ Entity Category → Config/Diagnostic Entities werden gefiltert

## 🏗️ Projekt-Architektur

### Verzeichnisstruktur

```
simon42-strategy/
├── simon42-strategies-loader.js          # Entry Point - lädt alle Module
│
├── core/                                 # Kern-Module
│   ├── simon42-dashboard-strategy.js     # Haupt-Strategy, generiert Dashboard-Struktur
│   ├── simon42-dashboard-strategy-editor.js  # GUI-Editor für Konfiguration
│   └── editor/                           # Editor-Komponenten
│       ├── simon42-editor-handlers.js    # Event-Handler (Drag&Drop, Checkboxen)
│       ├── simon42-editor-styles.js      # CSS für Editor (Hierarchie-Styling)
│       └── simon42-editor-template.js    # HTML-Template (Area → Domain → Entity)
│
├── utils/                                # Utility-Module
│   ├── simon42-helpers.js                # Helper-Funktionen (Filterung, Sortierung)
│   ├── simon42-data-collectors.js        # Datensammlung (Lichter, Covers, Security...)
│   ├── simon42-badge-builder.js          # Badge-Erstellung für Views
│   ├── simon42-section-builder.js        # Section-Erstellung (Grid-Layouts)
│   └── simon42-view-builder.js           # View-Definitionen
│
├── views/                                # View-Strategies
│   ├── simon42-view-room.js              # Raum-Details (pro Bereich, config-aware)
│   ├── simon42-view-lights.js            # Lichter-Übersicht (on/off gruppiert)
│   ├── simon42-view-covers.js            # Rollos/Vorhänge (open/closed gruppiert)
│   ├── simon42-view-security.js          # Sicherheit (Türen, Fenster, Schlösser)
│   └── simon42-view-batteries.js         # Batterie-Status (kritisch/niedrig/gut)
│
└── cards/                                # Custom Cards
    └── simon42-summary-card.js           # Reaktive Summary Card mit Echtzeit-Updates
```

### Datenfluss

```
1. Loader (simon42-strategies-loader.js)
   └─> Registriert alle Module als Custom Elements

2. Core Strategy (simon42-dashboard-strategy.js)
   ├─> Liest Home Assistant Registries (Areas, Devices, Entities, Floors)
   ├─> Sammelt Daten via Data Collectors
   ├─> Erstellt Sections via Section Builder
   ├─> Generiert Views via View Builder
   └─> Übergibt Config (areas_options) an View-Strategies

3. View Strategies (z.B. simon42-view-room.js)
   ├─> Empfängt Config und Registries
   ├─> Filtert Entities basierend auf:
   │   ├─> no_dboard Label
   │   ├─> areas_options.groups_options.hidden
   │   ├─> Entity Registry Status
   │   └─> Entity Category
   ├─> Gruppiert Entities nach Domain und Status
   └─> Generiert finale Card-Konfigurationen

4. Editor (simon42-dashboard-strategy-editor.js)
   ├─> Lädt bestehende Config
   ├─> Lädt Entities dynamisch beim Aufklappen
   ├─> Verwaltet Expand-State persistent
   └─> Feuert config-changed Events bei Änderungen
```

### Custom Elements

Das Dashboard registriert folgende Custom Elements:

- `ll-strategy-simon42-dashboard` - Haupt-Dashboard-Strategy
- `simon42-dashboard-strategy-editor` - Grafischer Konfigurations-Editor
- `ll-strategy-simon42-view-room` - Raum-View-Strategy
- `ll-strategy-simon42-view-lights` - Lichter-View-Strategy
- `ll-strategy-simon42-view-covers` - Covers-View-Strategy
- `ll-strategy-simon42-view-security` - Security-View-Strategy
- `ll-strategy-simon42-view-batteries` - Batterie-View-Strategy

## 📊 Spezialisierte Views

### 🏠 Raum-View (Room)

**Navigation:** Bereiche → [Raumname]

Pro Bereich wird automatisch eine Detail-Ansicht generiert:

**Sections:**
- **Beleuchtung** - Alle Lichter mit Batch-Aktionen (on/off)
- **Klima** - Thermostate, AC-Geräte mit Temperatur-Control
- **Rollos & Vorhänge** - Cover-Entities mit open/close/stop
- **Kameras** - Live-Ansicht (mit Reolink-Support)
- **Sensoren** - Temperatur, Luftfeuchtigkeit, etc.
- **Sonstiges** - Vacuum, Fans, Switches, etc.

**Features:**
- Name-Stripping: Raumnamen werden automatisch aus Entity-Namen entfernt
- Config-Aware: Respektiert `areas_options.groups_options.hidden`
- Batch-Aktionen: Heading-Badges für Gruppensteuerung
- Last Changed: Sortierung nach letzter Aktivität
- Smart Sensor Selection: Verwendet bevorzugt die in der Area-Konfiguration hinterlegten Temperatur- und Luftfeuchtigkeitssensoren (Fallback: automatisch erkannte Sensoren)
- Raum-Pins: Zeige spezielle Entitäten am Ende der Raum-View (ideal für Wetterstationen, Admin-Sensoren, etc.)

### 💡 Lichter-Übersicht

**Navigation:** Lichter

Zeigt alle Lichter im Haus, gruppiert nach Status:

**Gruppen:**
- **Eingeschaltete Lichter** - Sofort sichtbar und steuerbar
- **Ausgeschaltete Lichter** - Collapsible Section

**Features:**
- Batch-Kontrolle über Heading-Badges
- Brightness-Slider für dimmbare Lichter
- Echtzeit-Updates bei Statusänderung

### 🪟 Rollos & Vorhänge

**Navigation:** Rollos

Alle Cover-Entities, gruppiert nach Position:

**Gruppen:**
- **Geöffnete Covers** - Aktuell offen/hochgefahren
- **Geschlossene Covers** - Aktuell geschlossen/heruntergefahren

**Features:**
- Open/Close/Stop Buttons
- Position-Slider für positionierbare Covers
- Name-Stripping: "Rollo", "Vorhang", "Cover" etc. werden entfernt (DE/EN)

### 🔒 Sicherheit

**Navigation:** Sicherheit

Sicherheits-relevante Entities, gruppiert nach Typ:

**Kategorien:**
- **Schlösser** - Locked/Unlocked Status
- **Türen & Tore** - Open/Closed Status
- **Garagen** - Open/Closed/Opening/Closing
- **Fenster & Sensoren** - Open/Closed/Motion

**Features:**
- Farbcodierung nach Status (rot=unsicher, grün=sicher)
- Alarm-Panel Integration (falls vorhanden)
- Device-Class basierte Kategorisierung

### 🔋 Batterie-Status

**Navigation:** Batterien

Alle Batterie-Entities, gruppiert nach Status:

**Gruppen:**
- **Kritisch** (< 20%) - Rot, sofortige Aufmerksamkeit
- **Niedrig** (20-50%) - Gelb, bald wechseln
- **Gut** (> 50%) - Grün, alles okay

**Features:**
- Sortierung nach Batterie-Level
- Last Changed Anzeige
- Visuelle Warnung bei kritischen Batterien

## 🎯 Erweiterte Features

### Raum-Pins

Pinne spezielle Entitäten, die nur in ihren zugeordneten Räumen angezeigt werden sollen:

**Verwendung:**
1. Öffne den Dashboard-Editor
2. Scrolle zur Sektion "Raum-Pins"
3. Wähle eine Entität aus dem Dropdown (nur Entitäten mit Raum-Zuordnung)
4. Klicke auf "+ Hinzufügen"

**Ideal für:**
- Wetterstationen mit spezifischen Sensoren
- Admin-Entitäten, die nicht automatisch erkannt werden
- Spezielle Entitäten, die nur in einem bestimmten Raum relevant sind
- Entities mit speziellen Device-Classes

**Verhalten:**
- Pins erscheinen **nur** im zugeordneten Raum (nicht in der Übersicht)
- Anzeige am **Ende** der Raum-View (nach allen anderen Sections)
- Überschrift: "Raum-Pins" mit Pin-Icon

**Config:**
```yaml
strategy:
  type: custom:simon42-dashboard
  room_pin_entities:
    - sensor.wetterstation_temperatur
    - sensor.wetterstation_luftfeuchtigkeit
    - sensor.admin_sensor
```

### Floor-basierte Organisation

Mit `group_by_floors: true` werden Bereiche nach Etagen gruppiert:

```yaml
strategy:
  type: custom:simon42-dashboard
  group_by_floors: true
```

**Ergebnis:**
```
📍 Erdgeschoss
   ├── Wohnzimmer
   ├── Küche
   └── Gäste-WC

📍 Obergeschoss
   ├── Schlafzimmer
   ├── Bad
   └── Arbeitszimmer

📍 Weitere Bereiche
   └── Garten
```

**Vorteile:**
- Bessere Übersicht bei vielen Bereichen
- Logische Gruppierung nach physischer Lage
- Separate Sections mit Heading für jede Etage

### Performance-Optimierungen

Das Dashboard ist für maximale Performance optimiert:

**Registry-Caching:**
- Alle Registry-Daten werden aus dem `hass`-Objekt gelesen
- Keine WebSocket-Calls mehr nötig
- **85% Reduktion** der API-Calls

**Intelligente Filterung:**
```javascript
// Reihenfolge der Filter (von günstig zu teuer):
1. Domain-basierte Filterung (Set-Lookup: O(1))
2. Label-Exklusion (no_dboard)
3. Area-Binding Checks
4. Entity Registry Validierung
5. State Availability Check
```

**Lazy Loading:**
- Entities werden erst beim Aufklappen geladen
- Kein unnötiges Laden von versteckten Bereichen
- Reduzierte initiale Ladezeit

### Optionale Integrationen

#### Search Card

Aktiviere eine Search Card in der Übersicht:

```yaml
strategy:
  type: custom:simon42-dashboard
  show_search_card: true
```

**Voraussetzung:**
- Custom Search Card muss installiert sein
- Wird automatisch erkannt und eingebunden

#### Alarm Panel

Falls ein `alarm_control_panel` existiert:
- Automatische Integration in Security-View
- Badge in der Übersicht
- Steuerung direkt aus dem Dashboard

#### Reolink Kameras

Erweiterte Unterstützung für Reolink-Kameras:
- Automatische Erkennung von Reolink-Entities
- Optimierte Card-Konfiguration
- PTZ-Controls (falls unterstützt)

### Batch-Aktionen

Alle Gruppen-Views unterstützen Batch-Aktionen über Heading-Badges:

**Beispiel Lichter:**
```
[💡 Alle ein] [💡 Alle aus]  Eingeschaltete Lichter (5)
├── Wohnzimmer Decke
├── Küche Arbeitsplatte
└── ...
```

**Verfügbar für:**
- Lichter (Alle ein/aus)
- Rollos (Alle öffnen/schließen)
- Bereiche (Alle Lichter des Raums)

## 🔍 Entity-Filterung im Detail

### Filterlogik (Reihenfolge)

```
1. Label-Exklusion (no_dboard)
   ├─> Globale Filterung via Labels
   └─> Wird nirgendwo im Dashboard angezeigt

2. Area-Zugehörigkeit
   ├─> Entities mit direkter Area-Zuweisung
   └─> Entities über Device-Area-Zuweisung

3. Entity Category
   └─> Keine config oder diagnostic Entities

4. Hidden/Disabled Status (Registry)
   └─> Versteckte oder deaktivierte Entities

5. Availability
   └─> Entity muss in hass.states existieren

6. groups_options.hidden (Config)
   └─> Bereich-spezifische Filterung via Konfigurator
```

### Beispiel-Szenario

```yaml
# Gegeben:
Area: Wohnzimmer
Entities:
  - light.wohnzimmer_decke
  - light.wohnzimmer_debug (hat Label "no_dboard")
  - light.wohnzimmer_alt (disabled in Registry)
  - light.wohnzimmer_config (Entity Category: config)
  - light.wohnzimmer_stehlampe

Config:
  areas_options:
    wohnzimmer:
      groups_options:
        lights:
          hidden:
            - light.wohnzimmer_stehlampe

# Ergebnis im Wohnzimmer Raum-View:
✅ light.wohnzimmer_decke
❌ light.wohnzimmer_debug (Label)
❌ light.wohnzimmer_alt (Disabled)
❌ light.wohnzimmer_config (Category)
❌ light.wohnzimmer_stehlampe (Config)

# Ergebnis in der Lichter-Übersicht:
✅ light.wohnzimmer_decke
❌ light.wohnzimmer_debug (Label)
❌ light.wohnzimmer_alt (Disabled)
❌ light.wohnzimmer_config (Category)
✅ light.wohnzimmer_stehlampe (nur im Raum-View ausgeblendet!)
```

## 🤝 Contributing

### Maintainers gesucht! 🔍

Dieses Projekt sucht aktiv nach Maintainern, die bei der Weiterentwicklung helfen möchten!

**Interessiert?**
- Erstelle Issues für Bugs oder Feature-Requests
- Pull Requests sind willkommen
- **Bitte teste PRs gründlich vor dem Einreichen** 🫶

### Pull Request Guidelines

1. **Feature Branch erstellen**
   ```bash
   git checkout -b feature/mein-neues-feature
   ```

2. **Code-Style beachten**
   - Kommentare auf Deutsch oder Englisch
   - JSDoc für Funktionen
   - Aussagekräftige Commit-Messages

3. **Testen**
   - Teste alle Änderungen in einem lokalen HA-Setup
   - Prüfe verschiedene Szenarien (mit/ohne Config, etc.)
   - Validiere die Performance

4. **Pull Request erstellen**
   - Beschreibe die Änderungen ausführlich
   - Füge Screenshots hinzu (bei UI-Änderungen)
   - Referenziere zugehörige Issues

## 📋 Roadmap & Geplante Features

- [x] Entity-Sortierung per Drag & Drop im Editor
- [ ] Preset-Templates für verschiedene Use-Cases
- [ ] Import von Views aus anderen Dashboards
- [x] Erweiterte Favoriten-Funktionen
- [ ] Themes & Custom Styling
- [ ] Export/Import von Konfigurationen
- [ ] Mehrsprachigkeit (i18n)

## 🐛 Bekannte Probleme & Limitationen

- Editor kann bei sehr vielen Entities (>500) langsam werden
- Drag & Drop funktioniert nicht auf Touch-Geräten optimal
- Einige Custom Cards werden möglicherweise nicht korrekt gerendert
- Performance bei floor-basierten Layouts kann bei >20 Bereichen leiden

**Workarounds siehe GitHub Issues**

## 📄 Lizenz

**Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**

### Du darfst:
- ✅ **Teilen** - Das Material kopieren und weiterverbreiten
- ✅ **Bearbeiten** - Das Material remixen, verändern und darauf aufbauen

### Unter folgenden Bedingungen:
- 📝 **Namensnennung** - Angemessene Urheber-Nennung
- 🚫 **Nicht kommerziell** - Keine kommerzielle Nutzung
- 🔄 **Weitergabe unter gleichen Bedingungen** - Bei Veränderungen unter gleicher Lizenz

### 💼 Kommerzielle Nutzung

Interessiert an kommerzieller Nutzung? Kontaktiere mich für individuelle Lizenzvereinbarungen:

**👉 [Kontaktformular](https://www.simon42.com/contact/)**

**Siehe LICENSE-Datei für vollständige Details**

## 🙏 Credits & Danksagungen

- Home Assistant Community für Inspiration und Feedback
- Alle Contributor und Tester
- Entwickler der genutzten Custom Cards und Integrationen

## 📞 Support & Kontakt

- **[GitHub Issues](https://github.com/TheRealSimon42/simon42-dashboard-strategy/issues)**
- **[simon42 Community](https://community.simon42.com/):** Suchfunktion hilft immer 😜 

---

**Entwickelt mit ❤️ für die Home Assistant Community**

*Letzte Aktualisierung: Gelegentlich und zu unregelmäßig* 😅
