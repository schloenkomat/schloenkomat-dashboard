// ====================================================================
// SCHLOENKOMAT DASHBOARD STRATEGIES - LOADER
// ====================================================================

// Lade Helper-Funktionen
import './utils/schloenkomat-helpers.js';
import './utils/schloenkomat-data-collectors.js';
import './utils/schloenkomat-badge-builder.js';
import './utils/schloenkomat-section-builder.js';
import './utils/schloenkomat-view-builder.js';

// Lade Custom Cards
import './cards/schloenkomat-summary-card.js';
import './cards/schloenkomat-lights-group-card.js';
import './cards/schloenkomat-covers-group-card.js';

// Lade Core-Modul
import './core/schloenkomat-dashboard-strategy.js';

// Lade View-Module
import './views/schloenkomat-view-room.js';
import './views/schloenkomat-view-lights.js';
import './views/schloenkomat-view-covers.js';
import './views/schloenkomat-view-security.js';
import './views/schloenkomat-view-batteries.js';

console.log('Schloenkomat Dashboard Strategies loaded successfully!');
