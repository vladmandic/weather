import { log } from './log';
import { getLocation, findLocation, findAddress, updateAddress } from './location';
import * as keys from '../secrets.json';
import { registerPWA } from './pwa-register';
import { updateAstronomy } from './astronomy';
import { updateLocation } from './distance';
import { updateLegend } from './legend';
import { updateToday } from './today';
import { updateForecast } from './forecast';
import { updateChart } from './chart';
import { updateRadar } from './radar';

async function hashChange(evt) {
  log('hash change:', evt.newURL);
}

async function cors(url: string) {
  const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  if (!res || !res.ok) return {};
  const content = (await res.json()).contents;
  const json = JSON.parse(content);
  return json;
}

async function main() {
  log('weather app');
  (document.getElementById('header') as HTMLDivElement).style.width = `${window.innerWidth}px`;
  await registerPWA('/public/pwa-serviceworker.js');

  // lookup based on string
  const lookup = await findLocation('Brickell', keys.google);
  updateAddress(lookup.name);
  updateAstronomy(lookup.lat, lookup.lon);
  updateLocation(lookup.lat, lookup.lon, Number.POSITIVE_INFINITY);

  // lookup based on gps
  const loc = await getLocation();
  const address = await findAddress(loc.lat, loc.lon, keys.google);
  updateAstronomy(loc.lat, loc.lon);
  updateAddress(address);
  updateLocation(loc.lat, loc.lon, Number.POSITIVE_INFINITY);

  const data = await cors(`https://api.darksky.net/forecast/${keys.darksky}/${loc.lat},${loc.lon}`);
  log('weatherData', data);
  updateLocation(loc.lat, loc.lon, data.flags['nearest-station']);
  updateToday(data);
  updateForecast(data);
  updateLegend(data);
  updateChart(data);
  updateRadar(loc.lat, loc.lon);
}

window.onhashchange = (evt) => hashChange(evt);
window.onload = main;
