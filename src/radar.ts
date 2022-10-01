import * as L from 'leaflet';
import { addRadarLayer, refreshRadarLayer } from './leaflet-rainviewer.js';
import { log } from './log';

/* google lyrs
  h = roads only
  m = standard roadmap
  p = terrain
  r = somehow altered roadmap
  s = satellite only
  t = terrain only
  y = hybrid
*/

const mapUrl = 'https://{s}.google.com/vt/lyrs=y,h&x={x}&y={y}&z={z}';
const mapOptions = { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] };

let map: L.Map;
let marker: L.Marker;
let layer;

export async function updateRadar(lat: number, lon: number) {
  const div = document.getElementById('weather-radar');
  if (!div) return;

  const intersectionObserver = new IntersectionObserver((entries) => {
    if (entries[0].intersectionRatio <= 0) return; // is radar canvas in viewport
    intersectionObserver.unobserve(div);
    if (!map) {
      log('createRadar', { lat, lon, mapUrl });
      map = new L.Map(div, {
        center: new L.LatLng(lat, lon),
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer(mapUrl, mapOptions).addTo(map); // first layer is map
      layer = addRadarLayer(map); // second layer is radar
      // setTimeout(() => radarLayer.play(), 2500); // start animation with delay
      div.onclick = () => {
        layer.playStop();
      };
    }
    if (!marker) {
      const icon = L.icon({ iconUrl: '../assets/marker.png', iconSize: [64, 64] });
      marker = new L.Marker(new L.LatLng(lat, lon), { icon });
      marker.addTo(map);
    }
    const latlng = new L.LatLng(lat, lon);
    map.setView(latlng);
    marker.setLatLng(latlng);
    refreshRadarLayer();
  });

  intersectionObserver.observe(div); // trigers update first time when element becomes visible instead immediately
}

class ComponentRadar extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-radar" style="width: 1000px; height: 1000px; margin: 40px 0 40px 0"></div>
    `;
  }
}

customElements.define('component-radar', ComponentRadar);
