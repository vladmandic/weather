/**
 * Based on: https://github.com/mwasil/Leaflet.Rainviewer
 */

import * as L from 'leaflet';
import { log } from './log';

export const RainViewer = L.Control.extend({
  timestamps: [],
  radarLayers: <L.TileLayer[]> [],
  currentTimestamp: 0,
  nextTimestamp: 0,
  animationPosition: 0,
  animationTimer: 0,
  controlContainer: <HTMLDivElement | undefined> undefined,
  container: <HTMLDivElement | undefined> undefined,
  positionSlider: <HTMLInputElement | undefined> undefined,
  positionSliderLabel: <HTMLLabelElement | undefined> undefined,
  timestampLabel: <HTMLDivElement | undefined> undefined,
  map: <L.Map | undefined> undefined,
  options: { // defaults
    position: 'topright',
    animationInterval: 150,
    opacity: 0.8,
  },

  onAdd(map: L.Map) {
    this.timestamps = [];
    this.radarLayers = [];
    this.currentTimestamp = 0;
    this.nextTimestamp = 0;
    this.animationPosition = 0;
    this.animationTimer = 0;
    this.map = map;
    this.container = (L.DomUtil.get('leaflet-control-rainviewer leaflet-bar leaflet-control') || L.DomUtil.create('div', 'leaflet-control-rainviewer leaflet-bar leaflet-control')) as HTMLDivElement;
    this.container.style.border = 'none';
    this.container.style.background = 'transparent';
    this.load();
    return this.container;
  },

  load() {
    if (this.container) L.DomUtil.addClass(this.container, 'leaflet-control-rainviewer-active');
    this.controlContainer = L.DomUtil.create('div', 'leaflet-control-rainviewer-container', this.container);
    this.controlContainer.style.display = 'flex';
    this.controlContainer.style.alignItems = 'center';
    L.DomEvent.disableClickPropagation(this.controlContainer);
    this.positionSlider = L.DomUtil.create('input', 'leaflet-control-rainviewer-positionslider leaflet-bar-part', this.controlContainer);
    this.positionSlider.type = 'range';
    this.positionSlider.id = 'rainviewer-positionslider';
    this.positionSlider.min = '0';
    this.positionSlider.valueAsNumber = this.animationPosition;
    L.DomEvent.on(this.positionSlider, 'input', (e) => this.showFrame((e.srcElement as HTMLInputElement).valueAsNumber), this);
    L.DomEvent.disableClickPropagation(this.positionSlider);
    this.timestampLabel = L.DomUtil.create('div', 'leaflet-control-rainviewer-timestamp', this.controlContainer);
    L.DomEvent.on(this.timestampLabel, 'click', () => window.scroll(0, 0), this);
    this.refresh();
    if (!this.stop()) this.play();
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
        if (this.positionSlider) {
          this.positionSlider.max = `${json.length - 1}`;
          this.positionSlider.valueAsNumber = 0;
          const values = json.map((v) => Math.trunc((json[json.length - 1] - v) / -60));
          this.positionSlider.setAttribute('values', values.join('   '));
        }
        this.map?.invalidateSize();
        this.timestamps = json;
        this.showFrame(-1);
        this.play();
      }
    };
    apiRequest.ontimeout = () => log('rainviewer timeout');
    apiRequest.send();
  },

  unload() {
    if (this.controlContainer) L.DomUtil.remove(this.controlContainer);
    this.controlContainer = undefined;
    if (this.container) L.DomUtil.removeClass(this.container, 'leaflet-control-rainviewer-active');
    this.container = undefined;
    Object.keys(this.radarLayers).forEach((key) => {
      if (this.map?.hasLayer(this.radarLayers[key])) this.map.removeLayer(this.radarLayers[key]);
    });
  },

  addLayer(ts: number) {
    const map = this.map;
    if (!this.radarLayers[ts]) {
      this.radarLayers[ts] = new L.TileLayer('https://tilecache.rainviewer.com/v2/radar/' + ts + '/256/{z}/{x}/{y}/2/1_1.png', {
        tileSize: 256,
        opacity: 0.001,
        attribution: '<a href="https://rainviewer.com" target="_blank">rainnviewer.com</a>',
        zIndex: ts,
      });
    }
    if (map && !map.hasLayer(this.radarLayers[ts])) map.addLayer(this.radarLayers[ts]);
  },

  changeRadarPosition(position: number, preloadOnly: boolean) {
    position %= this.timestamps.length;
    this.currentTimestamp = this.timestamps[this.animationPosition];
    this.nextTimestamp = this.timestamps[position];
    this.addLayer(this.nextTimestamp);
    if (preloadOnly) return;
    this.animationPosition = position;
    if (this.positionSlider) this.positionSlider.valueAsNumber = position;
    if (this.radarLayers[this.currentTimestamp]) this.radarLayers[this.currentTimestamp].setOpacity(0);
    if (this.timestampLabel) this.timestampLabel.innerText = new Date(this.nextTimestamp * 1000).toTimeString().split(' ')[0];
    this.radarLayers[this.nextTimestamp].setOpacity(this.options.opacity);
  },

  showFrame(nextPosition: number) {
    const preloadingDirection = nextPosition - this.animationPosition > 0 ? 1 : -1;
    this.changeRadarPosition(nextPosition, false);
    this.changeRadarPosition(nextPosition + preloadingDirection, true); // preload next next frame
  },

  stop() {
    if (this.animationTimer > 0) {
      clearTimeout(this.animationTimer);
      this.animationTimer = 0;
      return true;
    }
    return false;
  },

  play() {
    if (this.timestamps.length < 1) return;
    this.showFrame(this.animationPosition + 1);
    this.animationTimer = setTimeout(() => { this.play(); }, this.options.animationInterval);
  },

  playStop() {
    if (!this.stop()) this.play();
  },

  /*
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
  */

  onRemove() {
    this.stop();
    this.unload();
  },
});
