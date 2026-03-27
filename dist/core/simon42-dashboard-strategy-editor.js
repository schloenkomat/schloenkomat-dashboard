// ====================================================================
// SIMON42 DASHBOARD STRATEGY - EDITOR
// ====================================================================
import { getEditorStyles } from './editor/simon42-editor-styles.js';
import { renderEditorHTML } from './editor/simon42-editor-template.js';
import {
  attachWeatherCheckboxListener,
  attachEnergyCheckboxListener,
  attachSearchCardCheckboxListener,
  attachSummaryViewsCheckboxListener,
  attachRoomViewsCheckboxListener,
  attachGroupByFloorsCheckboxListener,
  attachCoversSummaryCheckboxListener,
  attachAreaCheckboxListeners,
  attachDragAndDropListeners,
  attachExpandButtonListeners,
  sortAreaItems
} from './editor/simon42-editor-handlers.js';

class Simon42DashboardStrategyEditor extends HTMLElement {
  constructor() {
    super();
    this._expandedAreas = new Set();
    this._expandedGroups = new Map();
    this._isRendering = false;
    this._powerFlowEditorElement = null;
  }

  setConfig(config) {
    this._config = config || {};
    if (!this._isUpdatingConfig) {
      this._render();
    }
  }

  set hass(hass) {
    const shouldRender = !this._hass;
    this._hass = hass;
    if (shouldRender) {
      this._render();
    }
  }

  _checkSearchCardDependencies() {
    const hasSearchCard = customElements.get('search-card') !== undefined;
    const hasCardTools = window.customCards && window.customCards.some(card =>
      card.type === 'custom:search-card'
    );

    const searchCardExists = hasSearchCard || document.querySelector('search-card') !== null;
    const cardToolsExists = typeof window.customCards !== 'undefined' || typeof window.cardTools !== 'undefined';

    return searchCardExists && cardToolsExists;
  }

  _render() {
    if (!this._hass || !this._config) {
      return;
    }

    const showWeather = this._config.show_weather !== false;
    const showEnergy = this._config.show_energy !== false;
    const showSearchCard = this._config.show_search_card === true;
    const showSummaryViews = this._config.show_summary_views === true;
    const showRoomViews = this._config.show_room_views === true;
    const groupByFloors = this._config.group_by_floors === true;
    const showCoversSummary = this._config.show_covers_summary !== false;
    const summariesColumns = this._config.summaries_columns || 2;
    const alarmEntity = this._config.alarm_entity || '';
    const favoriteEntities = this._config.favorite_entities || [];
    const roomPinEntities = this._config.room_pin_entities || [];
    const energyDashboardMode = this._config.energy_dashboard_mode || 'energy_distribution';
    const powerFlowCardConfig = this._config.power_flow_card_config || {};
    const powerFlowCardConfigText = JSON.stringify(powerFlowCardConfig, null, 2);
    const hasSearchCardDeps = this._checkSearchCardDependencies();

    const alarmEntities = Object.keys(this._hass.states)
      .filter(entityId => entityId.startsWith('alarm_control_panel.'))
      .map(entityId => {
        const state = this._hass.states[entityId];
        return {
          entity_id: entityId,
          name: state.attributes?.friendly_name || entityId.split('.')[1].replace(/_/g, ' ')
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const allEntities = this._getAllEntitiesForSelect();

    const allAreas = Object.values(this._hass.areas).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const hiddenAreas = this._config.areas_display?.hidden || [];
    const areaOrder = this._config.areas_display?.order || [];

    this.innerHTML = `
      <style>${getEditorStyles()}</style>
      ${renderEditorHTML({
        allAreas,
        hiddenAreas,
        areaOrder,
        showWeather,
        showEnergy,
        showSummaryViews,
        showRoomViews,
        showSearchCard,
        hasSearchCardDeps,
        summariesColumns,
        alarmEntity,
        alarmEntities,
        favoriteEntities,
        roomPinEntities,
        allEntities,
        groupByFloors,
        showCoversSummary,
        energyDashboardMode,
        powerFlowCardConfigText
      })}
    `;

    attachWeatherCheckboxListener(this, (showWeather) => this._showWeatherChanged(showWeather));
    attachEnergyCheckboxListener(this, (showEnergy) => this._showEnergyChanged(showEnergy));
    attachSearchCardCheckboxListener(this, (showSearchCard) => this._showSearchCardChanged(showSearchCard));
    attachSummaryViewsCheckboxListener(this, (showSummaryViews) => this._showSummaryViewsChanged(showSummaryViews));
    attachRoomViewsCheckboxListener(this, (showRoomViews) => this._showRoomViewsChanged(showRoomViews));
    attachGroupByFloorsCheckboxListener(this, (groupByFloors) => this._groupByFloorsChanged(groupByFloors));
    attachCoversSummaryCheckboxListener(this, (showCoversSummary) => this._showCoversSummaryChanged(showCoversSummary));

    this._attachEnergyDashboardModeListener();
    this._attachPowerFlowCardConfigListener();
    this._attachSummariesColumnsListener();
    this._attachAlarmEntityListener();
    this._attachFavoritesListeners();
    this._attachRoomPinsListeners();

    attachAreaCheckboxListeners(this, (areaId, isVisible) => this._areaVisibilityChanged(areaId, isVisible));

    sortAreaItems(this);

    attachDragAndDropListeners(
      this,
      () => this._updateAreaOrder()
    );

    attachExpandButtonListeners(
      this,
      this._hass,
      this._config,
      (areaId, group, entityId, isVisible) => this._entityVisibilityChanged(areaId, group, entityId, isVisible)
    );

    this._restoreExpandedState();
    this._updateEnergyModeVisibility();
    this._renderPowerFlowCardEditor();
  }

  _createFavoritesPicker(favoriteEntities) {
    const container = this.querySelector('#favorites-picker-container');
    if (!container) {
      console.warn('Favorites picker container not found');
      return;
    }

    const picker = document.createElement('ha-entities-picker');

    container.innerHTML = '';
    container.appendChild(picker);

    requestAnimationFrame(() => {
      picker.hass = this._hass;
      picker.value = favoriteEntities || [];

      picker.setAttribute('label', 'Favoriten-Entitäten');
      picker.setAttribute('placeholder', 'Entität hinzufügen...');
      picker.setAttribute('allow-custom-entity', '');

      picker.addEventListener('value-changed', (e) => {
        e.stopPropagation();
        this._favoriteEntitiesChanged(e.detail.value);
      });

      console.log('Favorites picker created:', picker);
    });
  }

  _attachEnergyDashboardModeListener() {
    const select = this.querySelector('#energy-dashboard-mode');
    if (!select) {
      return;
    }

    select.addEventListener('change', (e) => {
      this._energyDashboardModeChanged(e.target.value);
    });
  }

  _energyDashboardModeChanged(mode) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      energy_dashboard_mode: mode
    };

    if (mode === 'energy_distribution') {
      delete newConfig.energy_dashboard_mode;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _updateEnergyModeVisibility() {
    const modeRow = this.querySelector('#energy-dashboard-mode-row');
    const wrapper = this.querySelector('#power-flow-card-editor-wrapper');

    const showEnergy = this._config.show_energy !== false;
    const energyDashboardMode = this._config.energy_dashboard_mode || 'energy_distribution';

    if (modeRow) {
      modeRow.style.display = showEnergy ? '' : 'none';
    }

    if (wrapper) {
      wrapper.style.display = showEnergy && energyDashboardMode === 'power_flow_card' ? '' : 'none';
    }
  }

  async _renderPowerFlowCardEditor() {
    const container = this.querySelector('#power-flow-card-editor-container');
    const wrapper = this.querySelector('#power-flow-card-editor-wrapper');
    const errorEl = this.querySelector('#power-flow-card-editor-error');
    const fallback = this.querySelector('#power-flow-card-config-fallback');

    if (!container || !wrapper) {
      return;
    }

    const showEnergy = this._config.show_energy !== false;
    const energyDashboardMode = this._config.energy_dashboard_mode || 'energy_distribution';

    container.innerHTML = '';
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
    if (fallback) {
      fallback.style.display = 'none';
    }

    if (!showEnergy || energyDashboardMode !== 'power_flow_card') {
      wrapper.style.display = 'none';
      return;
    }

    wrapper.style.display = '';

    try {
      const editor = await this._createPowerFlowCardEditor();
      if (!editor) {
        throw new Error('Kein grafischer Editor für power-flow-card-plus verfügbar');
      }

      this._powerFlowEditorElement = editor;
      container.appendChild(editor);
    } catch (err) {
      console.error(err);
      if (errorEl) {
        errorEl.textContent = `Grafischer Editor nicht verfügbar. Prüfe, ob power-flow-card-plus installiert und geladen ist. ${err.message}`;
        errorEl.style.display = 'block';
      }
      if (fallback) {
        fallback.style.display = '';
      }
    }
  }

  async _createPowerFlowCardEditor() {
    const fullCardConfig = {
      type: 'custom:power-flow-card-plus',
      ...(this._config.power_flow_card_config || {})
    };

    const elementNamesToTry = [
      'power-flow-card-plus',
      'power-flow-card'
    ];

    for (const tagName of elementNamesToTry) {
      try {
        const elementClass = customElements.get(tagName);

        if (!elementClass) {
          continue;
        }

        if (typeof elementClass.getConfigElement !== 'function') {
          continue;
        }

        const editor = await elementClass.getConfigElement();
        if (!editor) {
          continue;
        }

        if (typeof editor.setConfig === 'function') {
          editor.setConfig(fullCardConfig);
        }

        if ('hass' in editor) {
          editor.hass = this._hass;
        }

        editor.addEventListener('config-changed', (ev) => {
          ev.stopPropagation();
          const value = ev.detail?.config || {};
          const { type, ...rest } = value;

          const newConfig = {
            ...this._config,
            energy_dashboard_mode: 'power_flow_card',
            power_flow_card_config: rest
          };

          this._config = newConfig;
          this._fireConfigChanged(newConfig);
        });

        return editor;
      } catch (err) {
        console.error('Power Flow Card Editor konnte nicht erstellt werden:', err);
      }
    }

    return null;
  }

  _attachPowerFlowCardConfigListener() {
    const textarea = this.querySelector('#power-flow-card-config');
    const errorEl = this.querySelector('#power-flow-card-config-error');

    if (!textarea) {
      return;
    }

    const save = () => {
      this._powerFlowCardConfigChanged(textarea.value, errorEl);
    };

    textarea.addEventListener('change', save);
    textarea.addEventListener('blur', save);
  }

  _powerFlowCardConfigChanged(value, errorEl) {
    if (!this._config || !this._hass) {
      return;
    }

    try {
      const trimmed = (value || '').trim();

      const newConfig = {
        ...this._config,
        energy_dashboard_mode: 'power_flow_card'
      };

      if (!trimmed) {
        delete newConfig.power_flow_card_config;
      } else {
        newConfig.power_flow_card_config = JSON.parse(trimmed);
      }

      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }

      this._config = newConfig;
      this._fireConfigChanged(newConfig);
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = `Ungültiges JSON: ${err.message}`;
        errorEl.style.display = 'block';
      }
    }
  }

  _attachSummariesColumnsListener() {
    const radio2 = this.querySelector('#summaries-2-columns');
    const radio4 = this.querySelector('#summaries-4-columns');

    if (radio2) {
      radio2.addEventListener('change', (e) => {
        if (e.target.checked) {
          this._summariesColumnsChanged(2);
        }
      });
    }

    if (radio4) {
      radio4.addEventListener('change', (e) => {
        if (e.target.checked) {
          this._summariesColumnsChanged(4);
        }
      });
    }
  }

  _summariesColumnsChanged(columns) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      summaries_columns: columns
    };

    if (columns === 2) {
      delete newConfig.summaries_columns;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _attachAlarmEntityListener() {
    const alarmSelect = this.querySelector('#alarm-entity');
    if (alarmSelect) {
      alarmSelect.addEventListener('change', (e) => {
        this._alarmEntityChanged(e.target.value);
      });
    }
  }

  _alarmEntityChanged(entityId) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      alarm_entity: entityId
    };

    if (!entityId || entityId === '') {
      delete newConfig.alarm_entity;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _attachFavoritesListeners() {
    const addBtn = this.querySelector('#add-favorite-btn');
    const select = this.querySelector('#favorite-entity-select');

    if (addBtn && select) {
      addBtn.addEventListener('click', () => {
        const entityId = select.value;
        if (entityId && entityId !== '') {
          this._addFavoriteEntity(entityId);
          select.value = '';
        }
      });
    }

    const removeButtons = this.querySelectorAll('.remove-favorite-btn');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entityId = e.target.dataset.entityId;
        this._removeFavoriteEntity(entityId);
      });
    });
  }

  _addFavoriteEntity(entityId) {
    if (!this._config || !this._hass) {
      return;
    }

    const currentFavorites = this._config.favorite_entities || [];

    if (currentFavorites.includes(entityId)) {
      return;
    }

    const newFavorites = [...currentFavorites, entityId];

    const newConfig = {
      ...this._config,
      favorite_entities: newFavorites
    };

    this._config = newConfig;
    this._fireConfigChanged(newConfig);

    this._updateFavoritesList();
  }

  _removeFavoriteEntity(entityId) {
    if (!this._config || !this._hass) {
      return;
    }

    const currentFavorites = this._config.favorite_entities || [];
    const newFavorites = currentFavorites.filter(id => id !== entityId);

    const newConfig = {
      ...this._config,
      favorite_entities: newFavorites.length > 0 ? newFavorites : undefined
    };

    if (newFavorites.length === 0) {
      delete newConfig.favorite_entities;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);

    this._updateFavoritesList();
  }

  _updateFavoritesList() {
    const container = this.querySelector('#favorites-list');
    if (!container) return;

    const favoriteEntities = this._config.favorite_entities || [];
    const allEntities = this._getAllEntitiesForSelect();

    import('./editor/simon42-editor-template.js').then(module => {
      container.innerHTML = module.renderFavoritesList?.(favoriteEntities, allEntities) ||
        this._renderFavoritesListFallback(favoriteEntities, allEntities);

      this._attachFavoritesListeners();
    }).catch(() => {
      container.innerHTML = this._renderFavoritesListFallback(favoriteEntities, allEntities);
      this._attachFavoritesListeners();
    });
  }

  _renderFavoritesListFallback(favoriteEntities, allEntities) {
    if (!favoriteEntities || favoriteEntities.length === 0) {
      return '<div class="empty-state" style="padding: 12px; text-align: center; color: var(--secondary-text-color); font-style: italic;">Keine Favoriten hinzugefügt</div>';
    }

    const entityMap = new Map(allEntities.map(e => [e.entity_id, e.name]));

    return `
      <div style="border: 1px solid var(--divider-color); border-radius: 4px; overflow: hidden;">
        ${favoriteEntities.map((entityId) => {
          const name = entityMap.get(entityId) || entityId;
          return `
            <div class="favorite-item" data-entity-id="${entityId}" style="display: flex; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--divider-color); background: var(--card-background-color);">
              <span class="drag-handle" style="margin-right: 12px; cursor: grab; color: var(--secondary-text-color);">☰</span>
              <span style="flex: 1; font-size: 14px;">
                <strong>${name}</strong>
                <span style="margin-left: 8px; font-size: 12px; color: var(--secondary-text-color); font-family: monospace;">${entityId}</span>
              </span>
              <button class="remove-favorite-btn" data-entity-id="${entityId}" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); cursor: pointer;">
                ✕
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  _attachRoomPinsListeners() {
    const addBtn = this.querySelector('#add-room-pin-btn');
    const select = this.querySelector('#room-pin-entity-select');

    if (addBtn && select) {
      addBtn.addEventListener('click', () => {
        const entityId = select.value;
        if (entityId && entityId !== '') {
          this._addRoomPinEntity(entityId);
          select.value = '';
        }
      });
    }

    const removeButtons = this.querySelectorAll('.remove-room-pin-btn');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entityId = e.target.dataset.entityId;
        this._removeRoomPinEntity(entityId);
      });
    });
  }

  _addRoomPinEntity(entityId) {
    if (!this._config || !this._hass) {
      return;
    }

    const currentPins = this._config.room_pin_entities || [];

    if (currentPins.includes(entityId)) {
      return;
    }

    const newPins = [...currentPins, entityId];

    const newConfig = {
      ...this._config,
      room_pin_entities: newPins
    };

    this._config = newConfig;
    this._fireConfigChanged(newConfig);

    this._updateRoomPinsList();
  }

  _removeRoomPinEntity(entityId) {
    if (!this._config || !this._hass) {
      return;
    }

    const currentPins = this._config.room_pin_entities || [];
    const newPins = currentPins.filter(id => id !== entityId);

    const newConfig = {
      ...this._config,
      room_pin_entities: newPins.length > 0 ? newPins : undefined
    };

    if (newPins.length === 0) {
      delete newConfig.room_pin_entities;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);

    this._updateRoomPinsList();
  }

  _updateRoomPinsList() {
    const container = this.querySelector('#room-pins-list');
    if (!container) return;

    const roomPinEntities = this._config.room_pin_entities || [];
    const allEntities = this._getAllEntitiesForSelect();
    const allAreas = Object.values(this._hass.areas).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    import('./editor/simon42-editor-template.js').then(module => {
      container.innerHTML = module.renderRoomPinsList?.(roomPinEntities, allEntities, allAreas) ||
        this._renderRoomPinsListFallback(roomPinEntities, allEntities, allAreas);

      this._attachRoomPinsListeners();
    }).catch(() => {
      container.innerHTML = this._renderRoomPinsListFallback(roomPinEntities, allEntities, allAreas);
      this._attachRoomPinsListeners();
    });
  }

  _renderRoomPinsListFallback(roomPinEntities, allEntities, allAreas) {
    if (!roomPinEntities || roomPinEntities.length === 0) {
      return '<div class="empty-state" style="padding: 12px; text-align: center; color: var(--secondary-text-color); font-style: italic;">Keine Raum-Pins hinzugefügt</div>';
    }

    const entityMap = new Map(allEntities.map(e => [e.entity_id, e]));
    const areaMap = new Map(allAreas.map(a => [a.area_id, a.name]));

    return `
      <div style="border: 1px solid var(--divider-color); border-radius: 4px; overflow: hidden;">
        ${roomPinEntities.map((entityId) => {
          const entity = entityMap.get(entityId);
          const name = entity?.name || entityId;
          const areaId = entity?.area_id || entity?.device_area_id;
          const areaName = areaId ? areaMap.get(areaId) || areaId : 'Kein Raum';

          return `
            <div class="room-pin-item" data-entity-id="${entityId}" style="display: flex; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--divider-color); background: var(--card-background-color);">
              <span class="drag-handle" style="margin-right: 12px; cursor: grab; color: var(--secondary-text-color);">☰</span>
              <span style="flex: 1; font-size: 14px;">
                <strong>${name}</strong>
                <span style="margin-left: 8px; font-size: 12px; color: var(--secondary-text-color); font-family: monospace;">${entityId}</span>
                <br>
                <span style="font-size: 11px; color: var(--secondary-text-color);">📍 ${areaName}</span>
              </span>
              <button class="remove-room-pin-btn" data-entity-id="${entityId}" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); cursor: pointer;">
                ✕
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  _getAllEntitiesForSelect() {
    if (!this._hass) return [];

    const entities = Object.values(this._hass.entities || {});
    const devices = Object.values(this._hass.devices || {});

    const deviceAreaMap = new Map();
    devices.forEach(device => {
      if (device.area_id) {
        deviceAreaMap.set(device.id, device.area_id);
      }
    });

    return Object.keys(this._hass.states)
      .map(entityId => {
        const state = this._hass.states[entityId];
        const entity = entities.find(e => e.entity_id === entityId);

        let areaId = entity?.area_id;
        if (!areaId && entity?.device_id) {
          areaId = deviceAreaMap.get(entity.device_id);
        }

        return {
          entity_id: entityId,
          name: state.attributes?.friendly_name || entityId.split('.')[1].replace(/_/g, ' '),
          area_id: areaId,
          device_area_id: areaId
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  _favoriteEntitiesChanged(entities) {
    if (!this._config || !this._hass) {
      return;
    }

    console.log('Favorites changed:', entities);

    const newConfig = {
      ...this._config,
      favorite_entities: entities
    };

    if (!entities || entities.length === 0) {
      delete newConfig.favorite_entities;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _restoreExpandedState() {
    this._expandedAreas.forEach(areaId => {
      const button = this.querySelector(`.expand-button[data-area-id="${areaId}"]`);
      const content = this.querySelector(`.area-content[data-area-id="${areaId}"]`);

      if (button && content) {
        content.style.display = 'block';
        button.classList.add('expanded');

        const expandedGroups = this._expandedGroups.get(areaId);
        if (expandedGroups) {
          expandedGroups.forEach(groupKey => {
            const groupButton = content.querySelector(`.expand-button-small[data-area-id="${areaId}"][data-group="${groupKey}"]`);
            const entityList = content.querySelector(`.entity-list[data-area-id="${areaId}"][data-group="${groupKey}"]`);

            if (groupButton && entityList) {
              entityList.style.display = 'block';
              groupButton.classList.add('expanded');
            }
          });
        }
      }
    });
  }

  _updateAreaOrder() {
    const areaList = this.querySelector('#area-list');
    const items = Array.from(areaList.querySelectorAll('.area-item'));
    const newOrder = items.map(item => item.dataset.areaId);

    const newConfig = {
      ...this._config,
      areas_display: {
        ...this._config.areas_display,
        order: newOrder
      }
    };

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _showWeatherChanged(showWeather) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      show_weather: showWeather
    };

    if (showWeather === true) {
      delete newConfig.show_weather;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _showEnergyChanged(showEnergy) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      show_energy: showEnergy
    };

    if (showEnergy === true) {
      delete newConfig.show_energy;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _showSearchCardChanged(showSearchCard) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      show_search_card: showSearchCard
    };

    if (showSearchCard === false) {
      delete newConfig.show_search_card;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _showSummaryViewsChanged(showSummaryViews) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      show_summary_views: showSummaryViews
    };

    if (showSummaryViews === false) {
      delete newConfig.show_summary_views;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _showRoomViewsChanged(showRoomViews) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      show_room_views: showRoomViews
    };

    if (showRoomViews === false) {
      delete newConfig.show_room_views;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _areaVisibilityChanged(areaId, isVisible) {
    if (!this._config || !this._hass) {
      return;
    }

    let hiddenAreas = [...(this._config.areas_display?.hidden || [])];

    if (isVisible) {
      hiddenAreas = hiddenAreas.filter(id => id !== areaId);
    } else {
      if (!hiddenAreas.includes(areaId)) {
        hiddenAreas.push(areaId);
      }
    }

    const newConfig = {
      ...this._config,
      areas_display: {
        ...this._config.areas_display,
        hidden: hiddenAreas
      }
    };

    if (newConfig.areas_display.hidden.length === 0) {
      delete newConfig.areas_display.hidden;
    }

    if (Object.keys(newConfig.areas_display).length === 0) {
      delete newConfig.areas_display;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _entityVisibilityChanged(areaId, group, entityId, isVisible) {
    if (!this._config || !this._hass) {
      return;
    }

    const currentAreaOptions = this._config.areas_options?.[areaId] || {};
    const currentGroupsOptions = currentAreaOptions.groups_options || {};
    const currentGroupOptions = currentGroupsOptions[group] || {};

    let hiddenEntities = [...(currentGroupOptions.hidden || [])];

    if (entityId === null) {
      if (!isVisible) {
        const entityList = this.querySelector(`.entity-list[data-area-id="${areaId}"][data-group="${group}"]`);
        if (entityList) {
          const entityCheckboxes = entityList.querySelectorAll('.entity-checkbox');
          const allEntities = Array.from(entityCheckboxes).map(cb => cb.dataset.entityId);
          hiddenEntities = [...new Set([...hiddenEntities, ...allEntities])];
        }
      } else {
        const entityList = this.querySelector(`.entity-list[data-area-id="${areaId}"][data-group="${group}"]`);
        if (entityList) {
          const entityCheckboxes = entityList.querySelectorAll('.entity-checkbox');
          const allEntities = Array.from(entityCheckboxes).map(cb => cb.dataset.entityId);
          hiddenEntities = hiddenEntities.filter(e => !allEntities.includes(e));
        }
      }
    } else {
      if (isVisible) {
        hiddenEntities = hiddenEntities.filter(e => e !== entityId);
      } else {
        if (!hiddenEntities.includes(entityId)) {
          hiddenEntities.push(entityId);
        }
      }
    }

    const newGroupOptions = {
      ...currentGroupOptions,
      hidden: hiddenEntities
    };

    if (newGroupOptions.hidden.length === 0) {
      delete newGroupOptions.hidden;
    }

    const newGroupsOptions = {
      ...currentGroupsOptions,
      [group]: newGroupOptions
    };

    if (Object.keys(newGroupsOptions[group]).length === 0) {
      delete newGroupsOptions[group];
    }

    const newAreaOptions = {
      ...currentAreaOptions,
      groups_options: newGroupsOptions
    };

    if (Object.keys(newAreaOptions.groups_options).length === 0) {
      delete newAreaOptions.groups_options;
    }

    const newAreasOptions = {
      ...this._config.areas_options,
      [areaId]: newAreaOptions
    };

    if (Object.keys(newAreasOptions[areaId]).length === 0) {
      delete newAreasOptions[areaId];
    }

    const newConfig = {
      ...this._config,
      areas_options: newAreasOptions
    };

    if (Object.keys(newConfig.areas_options).length === 0) {
      delete newConfig.areas_options;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _groupByFloorsChanged(groupByFloors) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      group_by_floors: groupByFloors
    };

    if (groupByFloors === false) {
      delete newConfig.group_by_floors;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _showCoversSummaryChanged(showCoversSummary) {
    if (!this._config || !this._hass) {
      return;
    }

    const newConfig = {
      ...this._config,
      show_covers_summary: showCoversSummary
    };

    if (showCoversSummary === true) {
      delete newConfig.show_covers_summary;
    }

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _fireConfigChanged(config) {
    this._isUpdatingConfig = true;
    this._config = config;

    const event = new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);

    setTimeout(() => {
      this._isUpdatingConfig = false;
    }, 0);
  }
}

customElements.define("schloenkomat-dashboard-strategy-editor", Simon42DashboardStrategyEditor);
