// ====================================================================
// VIEW STRATEGY - LICHTER (alle Lichter) - MIT REAKTIVEN GROUP-CARDS
// ====================================================================
// Nutzt zwei reaktive Group-Cards (on/off) die sich automatisch aktualisieren
// ====================================================================
import { getExcludedLabels } from '../utils/schloenkomat-helpers.js';

class schloenkomatViewLightsStrategy {
  static async generate(config, hass) {
    // Die Strategy generiert zwei reaktive Group-Cards
    // Eine für eingeschaltete, eine für ausgeschaltete Lichter
    // Jede Card aktualisiert sich automatisch und zeigt/versteckt sich bei Bedarf
    
    return {
      type: "sections",
      sections: [
        {
          type: "grid",
          cards: [
            {
              type: "custom:schloenkomat-lights-group-card",
              entities: config.entities,
              config: config.config,
              group_type: "on"
            },
            {
              type: "custom:schloenkomat-lights-group-card",
              entities: config.entities,
              config: config.config,
              group_type: "off"
            }
          ]
        }
      ]
    };
  }
}

// Registriere Custom Element
customElements.define("ll-strategy-schloenkomat-view-lights", schloenkomatViewLightsStrategy);

console.log('✅ schloenkomat View Lights Strategy (with reactive group cards) loaded');
