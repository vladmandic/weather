/**
 * Based on: https://github.com/mwasil/Leaflet.Rainviewer
 */

import * as L from 'leaflet';
// import { log } from './log';

export function addRadarLayer(map) {
  const layer = new L.Control.Rainviewer({
    position: 'topright',
    animationInterval: 150,
    opacity: 0.75,
  });
  layer.addTo(map);
  layer.load();
  return layer;
}

L.Control.Rainviewer = L.Control.extend({
  options: { // defaults
    position: 'bottomleft',
    animationInterval: 500,
    opacity: 0.5,
  },

  onAdd(map) {
    // log('rainview onAdd');
    this.timestamps = [];
    this.radarLayers = [];
    this.currentTimestamp = 0;
    this.nextTimestamp = 0;
    this.animationPosition = 0;
    this.animationTimer = false;
    this.rainviewerActive = false;
    this._map = map; // eslint-disable-line no-underscore-dangle
    this.container = L.DomUtil.create('div', 'leaflet-control-rainviewer leaflet-bar leaflet-control');
    this.container.style.border = 'none';
    this.container.style.background = 'rgba(100, 100, 100, 0.4)';
    return this.container;
  },

  load() {
    // log('rainviewer load');
    const t = this; // eslint-disable-line @typescript-eslint/no-this-alias
    this.apiRequest = new XMLHttpRequest();
    this.apiRequest.open('GET', 'https://tilecache.rainviewer.com/api/maps.json', true);
    this.apiRequest.onload = () => {
      t.timestamps = JSON.parse(t.apiRequest.response);
      t.showFrame(-1);
    };
    this.apiRequest.send();
    L.DomUtil.addClass(this.container, 'leaflet-control-rainviewer-active');
    this.controlContainer = L.DomUtil.create('div', 'leaflet-control-rainviewer-container', this.container);
    this.positionSliderLabel = L.DomUtil.create('label', 'leaflet-control-rainviewer-label leaflet-bar-part', this.controlContainer);
    this.positionSliderLabel.for = 'rainviewer-positionslider';
    this.positionSlider = L.DomUtil.create('input', 'leaflet-control-rainviewer-positionslider leaflet-bar-part', this.controlContainer);
    this.positionSlider.type = 'range';
    this.positionSlider.id = 'rainviewer-positionslider';
    this.positionSlider.min = 0;
    this.positionSlider.max = 11;
    this.positionSlider.value = this.animationPosition;
    L.DomEvent.on(this.positionSlider, 'input', t.setPosition, this);
    L.DomEvent.disableClickPropagation(this.positionSlider);
    const html = '<div id="timestamp" class="leaflet-control-rainviewer-timestamp"></div>';
    this.controlContainer.insertAdjacentHTML('beforeend', html);
    L.DomEvent.disableClickPropagation(this.controlContainer);
  },

  unload() {
    // log('rainviewer unload');
    L.DomUtil.remove(this.controlContainer);
    L.DomUtil.removeClass(this.container, 'leaflet-control-rainviewer-active');
    const radarLayers = this.radarLayers;
    const map = this._map; // eslint-disable-line no-underscore-dangle
    Object.keys(radarLayers).forEach((key) => {
      if (map.hasLayer(radarLayers[key])) {
        map.removeLayer(radarLayers[key]);
      }
    });
  },

  addLayer(ts) {
    // log('rainviewer addLayer');
    const map = this._map; // eslint-disable-line no-underscore-dangle
    if (!this.radarLayers[ts]) {
      this.radarLayers[ts] = new L.TileLayer('https://tilecache.rainviewer.com/v2/radar/' + ts + '/256/{z}/{x}/{y}/2/1_1.png', {
        tileSize: 256,
        opacity: 0.001,
        transparent: true,
        attribution: '<a href="https://rainviewer.com" target="_blank">rainnviewer.com</a>',
        zIndex: ts,
      });
    }
    if (!map.hasLayer(this.radarLayers[ts])) {
      map.addLayer(this.radarLayers[ts]);
    }
  },

  changeRadarPosition(position, preloadOnly) {
    // log('rainviewer changeRadarPosition');
    while (position >= this.timestamps.length) position -= this.timestamps.length;
    while (position < 0) position += this.timestamps.length;
    this.currentTimestamp = this.timestamps[this.animationPosition];
    this.nextTimestamp = this.timestamps[position];
    this.addLayer(this.nextTimestamp);
    if (preloadOnly) return;
    this.animationPosition = position;
    this.positionSlider.value = position;
    if (this.radarLayers[this.currentTimestamp]) this.radarLayers[this.currentTimestamp].setOpacity(0);
    this.radarLayers[this.nextTimestamp].setOpacity(this.options.opacity);
    document.getElementById('timestamp').innerHTML = (new Date(this.nextTimestamp * 1000)).toLocaleString();
  },

  showFrame(nextPosition) {
    // log('rainviewer showFrame');
    const preloadingDirection = nextPosition - this.animationPosition > 0 ? 1 : -1;
    this.changeRadarPosition(nextPosition);
    // preload next next frame (typically, +1 frame), if don't do that, the animation will be blinking at the first loop
    this.changeRadarPosition(nextPosition + preloadingDirection, true);
  },

  setOpacity(e) {
    // log('rainviewer setOpacity');
    if (this.radarLayers[this.currentTimestamp]) {
      this.radarLayers[this.currentTimestamp].setOpacity(e.srcElement.value / 100);
    }
  },

  setPosition(e) {
    // log('rainviewer setPosition');
    this.showFrame(e.srcElement.value);
  },

  stop() {
    // log('rainviewer stop');
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = false;
      return true;
    }
    return false;
  },

  play() {
    // log('rainviewer play');
    this.showFrame(this.animationPosition + 1);
    this.animationTimer = setTimeout(() => { this.play(); }, this.options.animationInterval);
  },

  playStop() {
    // log('rainviewer playStop');
    if (!this.stop()) {
      this.play();
    }
  },

  prev(e) {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    this.stop();
    this.showFrame(this.animationPosition - 1);
  },

  startstop(e) {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    this.playStop();
  },

  next(e) {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    this.stop();
    this.showFrame(this.animationPosition + 1);
  },

  onRemove() {
    // Nothing to do here
  },
});

L.control.rainviewer = (opts) => new L.Control.Rainviewer(opts);
