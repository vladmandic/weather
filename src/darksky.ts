import PullToRefresh from 'pulltorefreshjs';
import { log } from './log';
import { getLocation, findLocation, findAddress, updateAddress } from './location';
import * as keys from '../secrets.json';
import { installable } from './install';
import { registerPWA } from './pwa-register';
import { cors } from './cors';
import { updateAstronomy } from './astronomy';
import { updateDistance } from './distance';
import { updateLegend } from './legend';
import { updateToday } from './today';
import { updateForecast } from './forecast';
import { updateChart } from './chart';
import { updateRadar } from './radar';
import { updateAQI } from './aqi';
import { updateAlerts } from './alerts';
import { updateWindy } from './windy';
import { createSakura } from './sakura';

async function hashChange(evt) {
  log('hash change:', evt.newURL);
}

const update = async (loc) => {
  // trigger update for items that dont need forecast data
  updateAstronomy(loc.lat, loc.lon);
  updateAddress(loc.name);
  updateDistance(loc.lat, loc.lon, Number.POSITIVE_INFINITY);
  updateAQI(loc.lat, loc.lon, keys.aqicn);
  updateRadar(loc.lat, loc.lon);
  updateWindy(loc.lat, loc.lon);

  const data = await cors(`https://api.darksky.net/forecast/${keys.darksky}/${loc.lat},${loc.lon}`); // get actual forecast
  log('weatherData', data);
  // trigger update for items using forecast data
  updateDistance(loc.lat, loc.lon, data.flags);
  updateToday(data);
  updateForecast(data);
  updateLegend(data);
  updateChart(data);
  updateAlerts(data);

  // fade in all icons
  for (const image of Array.from(document.getElementsByTagName('img'))) {
    let opacity = 0;
    image.style.visibility = 'visible';
    const increaseOpacity = (img: HTMLImageElement) => {
      opacity += 0.01;
      img.style.opacity = opacity.toString();
      if (opacity < 1) setTimeout(() => increaseOpacity(img), 20);
    };
    increaseOpacity(image);
  }
};

async function main() {
  log('weather app');
  createSakura();
  window.addEventListener('beforeinstallprompt', (evt) => installable(evt));
  await registerPWA('pwa-serviceworker.js');
  let loc = { lat: 0, lon: 0, name: '' };
  PullToRefresh.init({ mainElement: 'body', onRefresh() { window.location.reload(); } });

  // lookup based on gps
  const locGPS = await getLocation();
  if (locGPS.lat !== 0) {
    loc = locGPS;
    loc.name = await findAddress(loc.lat, loc.lon, keys.google);
  } else {
    loc = await findLocation('Brickell', keys.google);
  }

  // lookup based on input
  const input = (document.getElementById('input-address') as HTMLInputElement);
  input.onchange = async () => {
    log('inputAddress', input.value);
    const adr = input.value.trim();
    if (adr.length > 2) {
      loc = await findLocation(adr, keys.google);
      update(loc);
    }
  };

  // @ts-ignore
  update(loc); // eslint-disable-line no-use-before-define
}

window.onhashchange = (evt) => hashChange(evt);
window.onload = main;
