// ====================================================================
// VIEW STRATEGY - COVERS (Rollos/Vorhänge) - MIT REAKTIVEN GROUP-CARDS
// ====================================================================
// Nutzt zwei reaktive Group-Cards (open/closed) die sich automatisch aktualisieren
// ====================================================================
import { getExcludedLabels, stripCoverType } from '../utils/schloenkomat-helpers.js';

class schloenkomatViewCoversStrategy {
  static async generate(config, hass) {
    // Die Strategy generiert zwei reaktive Group-Cards
    // Eine für offene, eine für geschlossene Covers
    // Jede Card aktualisiert sich automatisch und zeigt/versteckt sich bei Bedarf
    
    return {
      type: "sections",
      sections: [
        {
          type: "grid",
          cards: [
            {
              type: "custom:schloenkomat-covers-group-card",
              entities: config.entities,
              config: config.config,
              device_classes: config.device_classes || ["awning", "blind", "curtain", "shade", "shutter", "window"],
              group_type: "open"
            },
            {
              type: "custom:schloenkomat-covers-group-card",
              entities: config.entities,
              config: config.config,
              device_classes: config.device_classes || ["awning", "blind", "curtain", "shade", "shutter", "window"],
              group_type: "closed"
            }
          ]
        }
      ]
    };
  }
}

// Registriere Custom Element
customElements.define("ll-strategy-schloenkomat-view-covers", schloenkomatViewCoversStrategy);

console.log('✅ schloenkomat View Covers Strategy (with reactive group cards) loaded');
