/**
 * MapLibre Globe Control
 * Adds a button to toggle between globe and flat (Mercator) projections
 */
class GlobeControl {
  constructor(options = {}) {
    this._options = {
      enabledByDefault: true,
      ...options
    };
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    this._button = document.createElement('button');
    this._button.className = 'maplibregl-ctrl-globe';
    this._button.type = 'button';
    this._button.title = 'Toggle Globe/Flat View';
    this._button.setAttribute('aria-label', 'Toggle Globe/Flat View');

    // Globe icon SVG
    this._button.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>`;

    // Set initial state
    if (this._options.enabledByDefault) {
      this._button.classList.add('maplibregl-ctrl-globe-enabled');
    }

    this._button.addEventListener('click', () => this._toggleProjection());

    this._container.appendChild(this._button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }

  _toggleProjection() {
    const currentProjection = this._map.getProjection().name;

    if (currentProjection === 'globe') {
      // Switch to flat Mercator projection
      this._map.setProjection('mercator');
      this._button.classList.remove('maplibregl-ctrl-globe-enabled');
      this._button.title = 'Switch to Globe View';
    } else {
      // Switch to globe projection
      this._map.setProjection('globe');
      this._button.classList.add('maplibregl-ctrl-globe-enabled');
      this._button.title = 'Switch to Flat View';
    }
  }

  /**
   * Get current projection state
   * @returns {boolean} true if globe projection is active
   */
  isGlobeEnabled() {
    return this._map && this._map.getProjection().name === 'globe';
  }

  /**
   * Programmatically enable globe projection
   */
  enableGlobe() {
    if (this._map && this._map.getProjection().name !== 'globe') {
      this._map.setProjection('globe');
      this._button.classList.add('maplibregl-ctrl-globe-enabled');
      this._button.title = 'Switch to Flat View';
    }
  }

  /**
   * Programmatically disable globe projection (switch to Mercator)
   */
  disableGlobe() {
    if (this._map && this._map.getProjection().name === 'globe') {
      this._map.setProjection('mercator');
      this._button.classList.remove('maplibregl-ctrl-globe-enabled');
      this._button.title = 'Switch to Globe View';
    }
  }
}
