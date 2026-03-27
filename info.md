# Schloenkomat Dashboard Strategy

Eine modulare und hochkonfigurierbare Dashboard-Strategy für Home Assistant, die automatisch Views basierend auf Bereichen, Entitäten und deren Zuständen generiert.

## Features

- **Grafischer Konfigurator** – Keine YAML-Kenntnisse erforderlich
- **Automatische Raum-Erkennung** – Nutzt Home Assistant Areas & Devices
- **Dynamische Gruppierung** – Entitäten nach Status und Typ gruppiert
- **Spezialisierte Views** – Lichter, Rollos, Sicherheit, Batterien
- **Performance-optimiert** – Registry-Caching und Lazy Loading

## Installation

Nach der Installation über HACS:

1. Stelle sicher, dass die Lovelace-Ressource auf den Loader dieses Repositories zeigt:
   ```yaml
   lovelace:
     mode: storage
     resources:
       - url: /hacsfiles/schloenkomat-dashboard/schloenkomat-strategies-loader.js
         type: module
   ```

2. Erstelle ein neues Dashboard mit der Strategy:
   ```yaml
   strategy:
     type: custom:schloenkomat-dashboard
   ```

Für detaillierte Anweisungen siehe das README.
