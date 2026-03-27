# Schloenkomat Dashboard Strategy

Eine angepasste Home-Assistant-Dashboard-Strategy auf Basis des Projekts **simon42-dashboard-strategy** von **Simon42**.

Dieser Fork erweitert und verändert das Originalprojekt für meine eigene Nutzung, unter anderem mit:
- eigener HACS-/Loader-Struktur
- eigenem Strategy-Namen
- angepasstem Dashboard-Branding
- Unterstützung für eine konfigurierbare `power-flow-card-plus`
- erweiterten Editor-Funktionen für die Power-Flow-Konfiguration

> Hinweis: Dieses Repository ist **kein offizielles Projekt von Simon42**, sondern ein eigenständiger Fork mit eigenen Anpassungen.

---

## Ursprung / Attribution

Dieses Projekt basiert auf:

- **Originalprojekt:** `TheRealSimon42/simon42-dashboard-strategy`
- **Autor des Originalprojekts:** Simon42

Vielen Dank an Simon42 für die ursprüngliche Architektur, die modulare Struktur und die Grundlage dieses Projekts.

Ich habe dieses Repository als bearbeitete Version weitergeführt und an meine Anforderungen angepasst.

---

## Lizenz

Dieses Fork-Projekt steht – wie das Original – unter der Lizenz:

**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**

Das bedeutet insbesondere:
- **Attribution:** Der ursprüngliche Autor und das Originalprojekt müssen genannt werden.
- **NonCommercial:** Keine kommerzielle Nutzung.
- **ShareAlike:** Bearbeitungen und Weitergaben müssen unter derselben Lizenz erfolgen.
- **Änderungen kennzeichnen:** Es sollte klar erkennbar sein, dass dies eine bearbeitete Version ist.

Die vollständige Lizenz findest du in der Datei `LICENSE`.

---

## Was ist anders als im Original?

Dieser Fork ist keine 1:1-Kopie. Je nach Stand des Repositories wurden unter anderem folgende Punkte angepasst:

- Umbenennung auf **Schloenkomat Dashboard Strategy**
- eigener HACS-Einstiegspunkt
- eigener Loader
- eigener Strategy-Name
- Anpassungen am grafischen Editor
- Integration bzw. Bearbeitbarkeit der `power-flow-card-plus`
- projektspezifische Struktur- und Branding-Anpassungen

---

## Installation über HACS

1. Öffne **HACS**
2. Gehe zu **Custom repositories**
3. Füge dieses Repository hinzu
4. Kategorie: **Dashboard**
5. Installiere die **Schloenkomat Dashboard Strategy**

Nach der Installation die Ressource prüfen. Der relevante Pfad ist typischerweise:

```yaml
url: /hacsfiles/schloenkomat-dashboard/schloenkomat-dashboard-strategy.js
type: module
```

Danach:
- Home Assistant neu starten
- Browser-Cache leeren bzw. hart neu laden

---

## Dashboard erstellen

In Home Assistant:

1. **Einstellungen → Dashboards**
2. **Dashboard hinzufügen**
3. **Neues Dashboard von Grund auf**
4. Dashboard öffnen
5. **Bearbeiten**
6. **⋮ → Raw-Konfigurationseditor**

Dann z. B.:

```yaml
strategy:
  type: custom:schloenkomat-dashboard
```

Falls direkt auf Strategy-Ebene gearbeitet wird:

```yaml
type: custom:schloenkomat-dashboard
```

---

## Beispielkonfiguration

```yaml
type: custom:schloenkomat-dashboard
show_search_card: true
show_energy: true

power_flow_card_config:
  entities:
    battery:
      entity:
        consumption: sensor.entladeleistung
        production: sensor.ladeleistung
      state_of_charge: sensor.venus_e_battery_soc
      show_state_of_charge: true
      icon: mdi:battery-60
      color_circle: true
      invert_state: false
      use_metadata: false
      state_of_charge_unit_white_space: true
    grid:
      entity: sensor.shelly_pro_3em_total_active_power
      secondary_info: {}
    solar:
      entity: sensor.pv_leistung
      display_zero_state: true
      secondary_info: {}
    home:
      secondary_info: {}
      override_state: false
      use_metadata: false
      hide: false
      subtract_individual: false
      circle_animation: true
    individual:
      - entity: sensor.pracht_alpha_mono_xt_ladeleistung
        secondary_info:
          entity: sensor.mg_4_state_of_charge
          unit_of_measurement: "%"
        name: EV
        icon: mdi:car-electric
        show_direction: false
        display_zero_state: false
        calculate_flow_rate: true
  clickable_entities: true
  display_zero_lines: true
  use_new_flow_rate_model: true
  w_decimals: 0
  kw_decimals: 1
  min_flow_rate: 0.75
  max_flow_rate: 6
  max_expected_power: 2000
  min_expected_power: 0.01
  watt_threshold: 1000
  transparency_zero_lines: 0
  sort_individual_devices: false
```

---

## Projektstruktur

Die Codebasis ist modular aufgebaut:

- `dist/schloenkomat-dashboard-strategy.js` – HACS-Entry-Point
- `dist/schloenkomat-strategies-loader.js` – Loader
- `dist/core/` – Strategy und Editor
- `dist/utils/` – Hilfsfunktionen
- `dist/views/` – spezialisierte Views
- `dist/cards/` – Custom Cards

---

## Hinweis zum Originalprojekt

Wenn du die offizielle bzw. ursprüngliche Variante suchst, nutze bitte das Originalprojekt von Simon42.

Dieser Fork ist auf meine eigenen Anforderungen zugeschnitten und kann sich funktional und strukturell vom Ursprung unterscheiden.

---

## Danksagung

Danke an **Simon42** für das ursprüngliche Projekt und die Basis dieses Forks.
