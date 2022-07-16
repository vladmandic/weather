import * as L from 'leaflet';

// https://strasis.com/documentation/limelight-xe/reference/tile-map-servers

export const Radar = L.Control.extend({
  NEXRAD_URL: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi',
  NEXRAD_LAYER: 'nexrad-n0q-900913', // base reflectivity radar
  isPaused: false,
  timeLayerIndex: 0,
  timeLayers: [],
  options: {
    position: 'topright',
    opacity: 0.575,
    zIndex: 200,
    transitionMs: 200,
    playHTML: '&#9658;',
    pauseHTML: '&#9616;',
  },

  onRemove() {
    L.DomUtil.remove(this.container);
  },

  onAdd(map) {
    this.map = map;
    this.container = L.DomUtil.create('div', 'leaflet-radar');
    this.container.style.background = 'transparent';
    this.container.style.border = 'none';
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.container, 'control_container', (e) => { L.DomEvent.stopPropagation(e); });
    L.DomEvent.disableScrollPropagation(this.container);
    const sliderDiv = L.DomUtil.create('div', 'leaflet-radar-slider', this.container);
    this.slider = document.createElement('input');
    this.slider.id = 'leaflet-radar-slider';
    this.slider.type = 'range';
    this.slider.min = 0;
    sliderDiv.appendChild(this.slider);
    this.timestamp_div = L.DomUtil.create('div', 'leaflet-radar-timestamp', this.container);
    this.setDisabled(false);
    this.isPaused = false;
    this.toggle();
    return this.container;
  },

  hideLayerByIndex(index) {
    this.timeLayers[index].tileLayer.setOpacity(0);
    this.timestamp_div.innerHTML = '';
  },

  showLayerByIndex(index) {
    this.timeLayers[index].tileLayer.setOpacity(this.options.opacity);
    this.timestamp_div.innerHTML = this.timeLayers[index].timestamp;
  },

  setDisabled(disabled) {
    this.slider.disabled = disabled;
    this.timestamp_div.innerText = '';
  },

  toggle() {
    this.setDisabled(false);
    this.timeLayers = this.generateLayers();
    this.addLayers(this.timeLayers);
    this.slider.max = `${this.timeLayers.length - 1}`;
    this.timeLayerIndex = 0;
    this.isPaused = false;
    this.slider.oninput = () => {
      this.hideLayerByIndex(this.timeLayerIndex);
      this.timeLayerIndex = +this.slider.value;
      this.showLayerByIndex(this.timeLayerIndex);
      this.isPaused = true;
    };
    this.setTransitionTimer();
  },

  setTransitionTimer() {
    setTimeout(() => {
      if (this.isPaused) return;
      this.timeLayers.forEach((timeLayer) => {
        timeLayer.tileLayer.setOpacity(0);
        timeLayer.tileLayer.addTo(this.map);
      });
      this.hideLayerByIndex(this.timeLayerIndex);
      this.incrementLayerIndex();
      this.showLayerByIndex(this.timeLayerIndex);
      this.slider.value = `${this.timeLayerIndex}`;
      this.setTransitionTimer();
    }, this.options.transitionMs);
  },

  incrementLayerIndex() {
    this.timeLayerIndex++;
    if (this.timeLayerIndex > this.timeLayers.length - 1) {
      this.timeLayerIndex = 0;
    }
  },

  addLayers() {
    this.timeLayers.forEach((timeLayer) => {
      timeLayer.tileLayer.setOpacity(0);
      timeLayer.tileLayer.addTo(this.map);
    });
  },

  removeLayers() {
    this.timeLayers.forEach((timeLayer) => timeLayer.tileLayer.removeFrom(this.map));
    this.timeLayers = [];
    this.timeLayerIndex = 0;
  },

  generateLayers() {
    const suffix = (time) => {
      switch (time) {
        case 0: return '';
        case 5: return '-m05m';
        default: return '-m' + time + 'm';
      }
    };
    const timeLayers = [];
    const totalIntervals = 10;
    const intervalLength = 5;
    const currentTime = new Date();
    for (let i = 0; i <= totalIntervals; i++) {
      const timeDiffMins = totalIntervals * intervalLength - intervalLength * i;
      const layerRequest = this.NEXRAD_LAYER + suffix(timeDiffMins);
      const layer = L.tileLayer.wms(this.NEXRAD_URL, {
        layers: layerRequest,
        format: 'image/png',
        transparent: true,
        opacity: this.options.opacity,
        zIndex: this.options.zIndex,
      });
      const timeString = new Date(currentTime.valueOf() - timeDiffMins * 60 * 1000).toLocaleTimeString();
      timeLayers.push({
        timestamp: `${timeString} (-${timeDiffMins} min)`,
        tileLayer: layer,
      });
    }
    return timeLayers;
  },
});
