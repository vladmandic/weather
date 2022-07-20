import { DateTime } from 'luxon';
import { log } from './log';
import type { Location } from './location';

export function updateGPSInfo(loc: Location) {
  log('updateGPSInfo', { loc });
  (document.getElementById('weather-info-gps') as HTMLDivElement).innerHTML = `GPS ${Math.round(1000 * loc.lat) / 1000}, ${Math.round(1000 * loc.lon) / 1000} ±${Math.round(loc.accuracy)}m`;
}

export function updateIPInfo(loc: Location) {
  log('updateIPInfo', { loc });
  (document.getElementById('weather-info-ip') as HTMLDivElement).innerHTML = `IP ${loc['ip'] || ''} at ${Math.round(1000 * loc.lat) / 1000}, ${Math.round(1000 * loc.lon) / 1000} ±${Math.round(loc.accuracy)}m`;
}

export function updateStationInfo(flags) {
  log('updateStationInfo', { flags });
  const distance = flags?.['nearest-station'] || Number.POSITIVE_INFINITY;
  (document.getElementById('weather-info-station') as HTMLDivElement).innerHTML = `nearest station ${distance} mi`;
}

export function updateSearchInfo(loc: Location) {
  log('updateSearchInfo', { loc });
  (document.getElementById('weather-info-gps') as HTMLDivElement).innerHTML = `location ${Math.round(1000 * loc.lat) / 1000}, ${Math.round(1000 * loc.lon) / 1000}`;
  (document.getElementById('weather-info-ip') as HTMLDivElement).innerHTML = '';
}

class ComponentInfo extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-info" style="margin: 20px 0 0 0; color: beige; font-size: 1.2rem">
        ${DateTime.now().toLocaleString(DateTime.DATETIME_HUGE)}<br><br>
        <div id="weather-info-gps"></div>
        <div id="weather-info-ip"></div>
        <div id="weather-info-station"></div>
      </div>`;
  }
}

customElements.define('component-info', ComponentInfo);
