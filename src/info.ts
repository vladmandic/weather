import { DateTime } from 'luxon';
import { log } from './log';
import { initInitial } from './update'; // eslint-disable-line import/no-cycle
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

let forecastAgeTimer: number;
export function updateForecastAge(time: number) {
  log('updateForecastAge', { time });
  const age = () => Math.max(0, Math.round((new Date().getSeconds() - new Date(1000 * time).getSeconds()) / 60));
  if (time) (document.getElementById('weather-info-age') as HTMLDivElement).innerHTML = `forecast data age ${age()} min`;
  if (forecastAgeTimer) return;
  forecastAgeTimer = setInterval(() => {
    if (time) (document.getElementById('weather-info-age') as HTMLDivElement).innerHTML = `forecast data age ${age()} min`;
  }, 5000);
}

export function updateCurrentTime() {
  setInterval(() => {
    const div = document.getElementById('weather-info-time') as HTMLDivElement;
    if (div) div.innerHTML = `${DateTime.now().toLocaleString(DateTime.DATETIME_HUGE)}`;
  }, 1000);
}

class ComponentInfo extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-info" title="click to reinitialize weather" style="margin: 20px 0 0 0; color: beige; font-size: 1.2rem">
        <div id="weather-info-time"></div>
        <br>
        <div id="weather-info-gps"></div>
        <div id="weather-info-ip"></div>
        <div style="display: flex; justify-content: center">
          <div id="weather-info-station"></div>&nbsp
          <div id="weather-info-age"></div>
        </div>
      </div>`;
    updateCurrentTime();
    const info = document.getElementById('weather-info') as HTMLDivElement; // register refresh on click
    info.onclick = async () => initInitial();
  }
}

customElements.define('component-info', ComponentInfo);
