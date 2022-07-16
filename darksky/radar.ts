import * as L from 'leaflet';
import { Radar } from '../assets/leaflet-radar.js';
import { log } from './log';

export async function updateRadar(lat: number, lon: number) {
  log('updateRadar');
  const div = document.getElementById('weather-radar');
  if (!div) return;
  const map = new L.Map(div, {
    center: new L.LatLng(lat, lon),
    zoom: 8,
    zoomControl: false,
    attributionControl: false,
  });
  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {}).addTo(map);
  // L.tileLayer('https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {}).addTo(map);
  // @ts-ignore property does not exist
  L.control.radar = () => new Radar({});
  // @ts-ignore property does not exist
  L.control.radar({}).addTo(map);
}

class ComponentRadar extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-radar" style="width: 100%; height: 740px; margin: 40px 0 40px 0"></div>
    `;
  }
}

customElements.define('component-radar', ComponentRadar);

// eslint-disable-next-line max-len
// <iframe width="650" height="450" src="https://embed.windy.com/embed2.html?lat=24.916&lon=-80.464&detailLat=25.794&detailLon=-80.460&width=650&height=450&zoom=7&level=surface&overlay=radar&product=radar&menu=&message=true&marker=&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=mph&metricTemp=%C2%B0F&radarRange=-1" frameborder="0"></iframe>
