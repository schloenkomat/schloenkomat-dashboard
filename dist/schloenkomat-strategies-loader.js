// ====================================================================
// SCHLOENKOMAT DASHBOARD STRATEGIES - LOADER
// ====================================================================

// Lade Helper-Funktionen
import './utils/simon42-helpers.js';
import './utils/simon42-data-collectors.js';
import './utils/simon42-badge-builder.js';
import './utils/simon42-section-builder.js';
import './utils/simon42-view-builder.js';

// Lade Custom Cards
import './cards/simon42-summary-card.js';
import './cards/simon42-lights-group-card.js';
import './cards/simon42-covers-group-card.js';

// Lade Core-Module
import './core/schloenkomat-dashboard-strategy.js';
import './core/schloenkomat-dashboard-strategy-editor.js';

// Lade View-Module
import './views/simon42-view-room.js';
import './views/simon42-view-lights.js';
import './views/simon42-view-covers.js';
import './views/simon42-view-security.js';
import './views/simon42-view-batteries.js';

console.log('Schloenkomat Dashboard Strategies loaded successfully!');
