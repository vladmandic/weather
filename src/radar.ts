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
const tileUrl = 'https://{s}.google.com/vt/lyrs=s,h,traffic&x={x}&y={y}&z={z}';
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
  div.style.height = (div.offsetWidth > window.innerHeight) ? `${window.innerHeight}px` : `${div.offsetWidth}px`;
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
  if (!div) return;
  if (intersectionObserver) intersectionObserver.disconnect();
  intersectionObserver = new IntersectionObserver((entries) => {
    if (entries[0].intersectionRatio <= 0) onHidden();
    if (entries[0].intersectionRatio > 0) onVisible(lat, lon);
  });
  intersectionObserver.observe(div); // trigers update first time when element becomes visible instead immediately
}

class ComponentRadar extends HTMLElement { // watch for attributes
  css: HTMLStyleElement = document.createElement('style');
  container: HTMLDivElement = document.createElement('div');
  leaflet: HTMLLinkElement = document.createElement('link');

  connectedCallback() { // triggered on insert
    this.attachShadow({ mode: 'open' });
    this.leaflet.rel = 'StyleSheet';
    this.leaflet.href = '../assets/leaflet.css';
    this.css.innerHTML = `
      input[type="range"] { appearance: none; width: 700px; background: transparent; position: relative; font-size: 1.0rem; word-spacing: 0.7rem; }
      input[type="range"]:focus { outline: 0; }
      input[type="range"]::-webkit-slider-thumb { appearance: none; width: 2rem; height: 2rem; background: hsl(27, 98%, 50%); border-radius: 100%; cursor: pointer;
        box-shadow: inset .8em .8em 5px -8px rgba(255, 255, 255, .4), inset -.4em -.4em 10px -3px rgba(0,0,0,.2), 0.7em 0.5em 7px -0.5em rgba(0,0,0,.4); }
      input[type="range"]::-webkit-slider-runnable-track { background: transparent; width: 100%; height: 2rem; border-radius: 2rem;
        box-shadow: inset .6em 1em 10px rgba(0,0,0,.15), inset -.6em -1em 10px rgba(255, 255, 255, .415); }
      input[type="range"]::before { content: attr(values); color: #c4c4c4; position: absolute; top: 0.4rem; left: 0; text-shadow: .5px .5px 0.9px rgba(0,0,0, .4); z-index: -1; }
    `;
    this.container.id = 'weather-radar';
    this.container.style.cssText = 'height: 1000px; margin: 40px 0 40px 0; z-index: 0';
    this.shadowRoot?.append(this.css, this.leaflet, this.container);
    div = this.container;
  }
}

customElements.define('component-radar', ComponentRadar);
