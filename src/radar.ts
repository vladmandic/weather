import * as L from 'leaflet';
import { Radar } from './leaflet-radar.js';
import { log } from './log';

const mapUrl = 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';
const mapOptions = { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] };
// const mapUrl = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
// const mapUrl = 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png';

let map: L.Map;

export async function updateRadar(lat: number, lon: number) {
  log('updateMap', { lat, lon, mapUrl });
  const div = document.getElementById('weather-radar');
  if (!div) return;
  if (!map) {
    map = new L.Map(div, {
      center: new L.LatLng(lat, lon),
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    });
    const layer = L.tileLayer(mapUrl, mapOptions);
    layer.addTo(map);
    // @ts-ignore property does not exist
    L.control.radar = () => new Radar({});
    // @ts-ignore property does not exist
    L.control.radar({}).addTo(map);
  } else {
    map.setView(new L.LatLng(lat, lon));
  }
}

class ComponentRadar extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-radar" style="width: 800px; height: 800px; margin: 40px 0 40px 0"></div>
    `;
  }
}

customElements.define('component-radar', ComponentRadar);
