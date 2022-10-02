/**
 * Based on: https://github.com/mwasil/Leaflet.Rainviewer
 */

import * as L from 'leaflet';
import { log } from './log';

let layer;

const Rainviewer = L.Control.extend({
  timestamps: [],
  radarLayers: <L.TileLayer[]> [],
  currentTimestamp: 0,
  nextTimestamp: 0,
  animationPosition: 0,
  animationTimer: 0,
  rainviewerActive: false,
  controlContainer: <HTMLDivElement | undefined> undefined,
  container: <HTMLDivElement | undefined> undefined,
  positionSlider: <HTMLInputElement | undefined> undefined,
  positionSliderLabel: <HTMLLabelElement | undefined> undefined,
  map: <L.Map | undefined> undefined,
  options: { // defaults
    position: 'topright',
    animationInterval: 150,
    opacity: 0.75,
  },

  onAdd(map) {
    // log('rainview onAdd');
    this.timestamps = [];
    this.radarLayers = [];
    this.currentTimestamp = 0;
    this.nextTimestamp = 0;
    this.animationPosition = 0;
    this.animationTimer = 0;
    this.rainviewerActive = false;
    this.map = map;
    this.container = L.DomUtil.create('div', 'leaflet-control-rainviewer leaflet-bar leaflet-control');
    this.container.style.border = 'none';
    this.container.style.background = 'rgba(100, 100, 100, 0.4)';
    return this.container;
  },

  load() {
    // log('rainviewer load');
    if (this.container) L.DomUtil.addClass(this.container, 'leaflet-control-rainviewer-active');
    this.controlContainer = L.DomUtil.create('div', 'leaflet-control-rainviewer-container', this.container);
    this.positionSliderLabel = L.DomUtil.create('label', 'leaflet-control-rainviewer-label leaflet-bar-part', this.controlContainer);
    this.positionSliderLabel.htmlFor = 'rainviewer-positionslider';
    this.positionSlider = L.DomUtil.create('input', 'leaflet-control-rainviewer-positionslider leaflet-bar-part', this.controlContainer);
    this.positionSlider.type = 'range';
    this.positionSlider.id = 'rainviewer-positionslider';
    this.positionSlider.min = '0';
    this.positionSlider.max = '11';
    this.positionSlider.valueAsNumber = this.animationPosition;
    L.DomEvent.on(this.positionSlider, 'input', this.setPosition, this);
    L.DomEvent.disableClickPropagation(this.positionSlider);
    const html = '<div id="timestamp" class="leaflet-control-rainviewer-timestamp"></div>';
    this.controlContainer.insertAdjacentHTML('beforeend', html);
    L.DomEvent.disableClickPropagation(this.controlContainer);
  },

  refresh() {
    const apiRequest = new XMLHttpRequest();
    apiRequest.timeout = 3000;
    apiRequest.open('GET', 'https://tilecache.rainviewer.com/api/maps.json', true);
    apiRequest.onload = () => {
      const json = JSON.parse(apiRequest.response);
      log('rainviewer refresh', json);
      if (json && json.length > 0) {
        this.stop();
        this.timestamps = json;
        this.showFrame(-1);
        this.play();
      }
    };
    apiRequest.ontimeout = () => log('rainviewer timeout');
    apiRequest.send();
  },

  unload() {
    // log('rainviewer unload');
    if (this.controlContainer) L.DomUtil.remove(this.controlContainer);
    if (this.container) L.DomUtil.removeClass(this.container, 'leaflet-control-rainviewer-active');
    const radarLayers = this.radarLayers;
    const map = this.map;
    Object.keys(radarLayers).forEach((key) => {
      if (map?.hasLayer(radarLayers[key])) {
        map.removeLayer(radarLayers[key]);
      }
    });
  },

  addLayer(ts) {
    // log('rainviewer addLayer');
    const map = this.map;
    if (!this.radarLayers[ts]) {
      this.radarLayers[ts] = new L.TileLayer('https://tilecache.rainviewer.com/v2/radar/' + ts + '/256/{z}/{x}/{y}/2/1_1.png', {
        tileSize: 256,
        opacity: 0.001,
        // transparent: true,
        attribution: '<a href="https://rainviewer.com" target="_blank">rainnviewer.com</a>',
        zIndex: ts,
      });
    }
    if (map && !map.hasLayer(this.radarLayers[ts])) {
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
    if (this.positionSlider) this.positionSlider.valueAsNumber = position;
    if (this.radarLayers[this.currentTimestamp]) this.radarLayers[this.currentTimestamp].setOpacity(0);
    this.radarLayers[this.nextTimestamp].setOpacity(this.options.opacity);
    const html = document.getElementById('timestamp') as HTMLDivElement;
    html.innerHTML = (new Date(this.nextTimestamp * 1000)).toLocaleString();
  },

  showFrame(nextPosition) {
    // log('rainviewer showFrame');
    const preloadingDirection = nextPosition - this.animationPosition > 0 ? 1 : -1;
    this.changeRadarPosition(nextPosition, false);
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
    if (this.animationTimer > 0) {
      clearTimeout(this.animationTimer);
      this.animationTimer = 0;
      return true;
    }
    return false;
  },

  play() {
    // log('rainviewer play');
    if (this.timestamps.length < 1) return;
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
    if (this.timestamps.length < 1) return;
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    this.stop();
    this.showFrame(this.animationPosition - 1);
  },

  startstop(e) {
    if (this.timestamps.length < 1) return;
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    this.playStop();
  },

  next(e) {
    if (this.timestamps.length < 1) return;
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    this.stop();
    this.showFrame(this.animationPosition + 1);
  },

  onRemove() {
    // Nothing to do here
  },
});

// L.control.rainviewer = (opts) => new L.Control.Rainviewer(opts);

export function addRadarLayer(map) {
  layer = new Rainviewer();
  layer.addTo(map);
  layer.load();
  return layer;
}

export function refreshRadarLayer() {
  if (layer) layer.refresh();
}
