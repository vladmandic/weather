import * as L from 'leaflet';
import { RainViewer } from './leaflet-rainviewer';
import { log } from './log';
import { keys } from './secrets';

/* google lyrs
  h = roads only
  m = standard roadmap
  p = terrain
  r = somehow altered roadmap
  s = satellite only
  t = terrain only
  y = hybrid
*/

const mapOptions = { zoom: 9, zoomControl: false, attributionControl: false };
const tileUrl = 'https://{s}.google.com/vt/lyrs=y,h&x={x}&y={y}&z={z}';
const tileOptions = { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] };
const iconUrl = '../assets/marker.png';

let div: HTMLDivElement | undefined;
let map: L.Map | undefined;
let marker: L.Marker | undefined;
let rainViewer: L.Control | null;
let ts: number;
let intersectionObserver: IntersectionObserver;

function onVisible(lat: number, lon: number) {
  if (!div) return;
  div.style.height = `${window.innerHeight}px`;
  const latlng = new L.LatLng(lat, lon);
  if (!map || !marker) {
    if (keys.google === '') return;
    log('createRadar', { lat, lon });
    map = new L.Map(div, { center: latlng, ...mapOptions });
    const tileLayer = L.tileLayer(tileUrl, tileOptions); // google maps layer
    tileLayer.addTo(map);
    const icon = L.icon({ iconUrl, iconSize: [64, 64] });
    marker = new L.Marker(new L.LatLng(lat, lon), { icon }); // map marker
    marker.addTo(map);
    // map.on('click', () => rainViewer.)
  } else {
    map.setView(latlng);
    marker.setLatLng(latlng);
  }
  if (!rainViewer) {
    rainViewer = new RainViewer();
    rainViewer.addTo(map);
    ts = Date.now();
  }
  div.onclick = (event) => {
    // @ts-ignore private method
    if (rainViewer) rainViewer.playStop();
    event.stopPropagation();
  };
}

async function onHidden() {
  if (map && rainViewer && Date.now() > (ts + (10 * 60 * 1000))) { // remove control every 10min
    map.removeControl(rainViewer);
    rainViewer = null;
  }
}

export async function updateRadar(lat: number, lon: number) {
  div = document.getElementById('weather-radar') as HTMLDivElement;
  if (!div) return;
  if (!intersectionObserver) {
    intersectionObserver = new IntersectionObserver((entries) => {
      if (entries[0].intersectionRatio <= 0) onHidden();
      if (entries[0].intersectionRatio > 0) onVisible(lat, lon);
    });
    intersectionObserver.observe(div); // trigers update first time when element becomes visible instead immediately
  }
}

class ComponentRadar extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-radar" style="width: 1000px; height: 1000px; margin: 40px 0 40px 0"></div>
    `;
  }
}

customElements.define('component-radar', ComponentRadar);
