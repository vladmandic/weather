import { DateTime } from 'luxon';
import { log } from './log';
import { initInitial } from './update';
import { escape } from './xss';
import type { Location } from './location';

export function updateGPSInfo(loc: Location) {
  log('updateGPSInfo', { loc });
  (document.getElementById('weather-info-gps') as HTMLDivElement).innerHTML = escape(`GPS ${Math.round(1000 * loc.lat) / 1000}, ${Math.round(1000 * loc.lon) / 1000} ±${Math.round(loc.accuracy)}m`);
}

export function updateIPInfo(loc: Location) {
  log('updateIPInfo', { loc });
  const ip = document.getElementById('weather-info-ip') as HTMLDivElement;
  if (ip) ip.innerHTML = escape(`IP ${loc['ip'] || ''} at ${Math.round(1000 * loc.lat) / 1000}, ${Math.round(1000 * loc.lon) / 1000} ±${Math.round(loc.accuracy)}m`);
}

export function updateStationInfo(flags) {
  log('updateStationInfo', { flags });
  const distance = flags?.['nearest-station'] || 'Number.POSITIVE_INFINITY';
  const station = document.getElementById('weather-info-station') as HTMLDivElement;
  if (station) station.innerHTML = escape(`nearest station ${distance} mi`);
}

export function updateSearchInfo(loc: Location) {
  log('updateSearchInfo', { loc });
  (document.getElementById('weather-info-gps') as HTMLDivElement).innerHTML = escape(`location ${Math.round(1000 * loc.lat) / 1000}, ${Math.round(1000 * loc.lon) / 1000}`);
  (document.getElementById('weather-info-ip') as HTMLDivElement).innerHTML = '';
}

let forecastAgeTimer: number;
export function updateForecastAge(time: number) {
  log('updateForecastAge', { time, date: DateTime.fromSeconds(time).toFormat('HH:mm:ss') });
  const age = () => {
    const min = Math.round((new Date().getSeconds() - new Date(1000 * time).getSeconds()) / 60);
    return min > 0 ? `${min} min` : 'current';
  };
  const div = document.getElementById('weather-info-age') as HTMLDivElement;
  if (div) div.innerHTML = escape(`forecast data age ${age()} | last update ${DateTime.fromSeconds(time).toFormat('HH:mm:ss')}`);
  if (forecastAgeTimer) return;
  forecastAgeTimer = setInterval(() => {
    if (div) div.innerHTML = escape(`forecast data age ${age()} | last update ${DateTime.fromSeconds(time).toFormat('HH:mm:ss')}`);
  }, 5000);
}

export function updateCurrentTime() {
  setInterval(() => {
    const html = document.getElementById('weather-info-time') as HTMLDivElement;
    if (html) html.innerHTML = escape(`${DateTime.now().toLocaleString(DateTime.DATETIME_HUGE)}`);
  }, 1000);
}

class ComponentInfo extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-info" title="click to reinitialize weather" style="margin: 20px 0 20px 0; color: beige; font-size: 1.2rem">
        <div id="weather-info-time"></div>
        <br>
        <div id="weather-info-gps"></div>
        <div id="weather-info-ip"></div>
        <div style="display: flex; justify-content: center">
          <div id="weather-info-station"></div>&nbsp|&nbsp
          <div id="weather-info-age"></div>
        </div>
      </div>`;
    updateCurrentTime();
    const html = document.getElementById('weather-info') as HTMLDivElement; // register refresh on click
    html.onclick = async (evt) => {
      evt.stopPropagation();
      initInitial(true);
    };
  }
}

customElements.define('component-info', ComponentInfo);
