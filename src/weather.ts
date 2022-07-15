import { register } from './pwa-register';
import { log } from './log';
import { getLocation, findLocation, findAddress, printLocation } from './location';
import { getForecast } from './forecast';
import { getMap } from './map';
import { printCurrent } from './current';
import * as keys from '../secrets.json';

async function hashChange(evt) {
  log('hash change:', evt.newURL);
}

async function main() {
  log('weather app');
  await register('/public/pwa-serviceworker.js');

  // const loc = await findLocation('brickell', keys.google);

  const loc = await getLocation();
  const address = await findAddress(loc.lat, loc.lon, keys.google);
  printLocation(address);

  const data = await getForecast(loc.lat, loc.lon, keys.tomorrow);
  printCurrent(data);

  // await getMap(loc.lat, loc.lon, keys.tomorrow);
}

window.onhashchange = (evt) => hashChange(evt);
window.onload = main;
