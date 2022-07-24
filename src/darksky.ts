import PullToRefresh from 'pulltorefreshjs';
import { log } from './log';
import { getGPSLocation, findByLocation, findByAddress, updateAddress, getIPLocation } from './location';
import * as keys from '../secrets.json';
import { installable } from './install';
import { registerPWA } from './pwa-register';
import { cors } from './cors';
import { updateAstronomy } from './astronomy';
import { updateGPSInfo, updateIPInfo, updateSearchInfo, updateStationInfo, updateForecastAge } from './info';
import { updateLegend } from './legend';
import { updateToday } from './today';
import { updateForecast } from './forecast';
import { updateChart } from './chart';
import { updateRadar } from './radar';
import { updateAQI } from './aqi';
import { updateAlerts } from './alerts';
import { updateWindy } from './windy';
import { createSakura } from './sakura';
import { updateClock } from './clock';
import type { Location } from './location';

const update = async (loc: Location) => {
  // trigger update for items that dont need forecast data
  updateAstronomy(loc.lat, loc.lon);
  updateAddress(loc.name);
  updateAQI(loc.lat, loc.lon, keys.aqicn);

  // trigger update for items using forecast data
  const data = await cors(`https://api.darksky.net/forecast/${keys.darksky}/${loc.lat},${loc.lon}`); // get actual forecast
  log('weatherData', data);
  (document.getElementById('main') as HTMLDivElement).style.display = 'block';
  updateStationInfo(data.flags);
  updateForecastAge(data.currently?.time);
  updateToday(data);
  updateForecast(data);
  updateLegend(data);
  updateChart(data);
  updateAlerts(data);

  // last update tiled items
  updateRadar(loc.lat, loc.lon);
  updateWindy(loc.lat, loc.lon);

  // hide loader
  (document.getElementById('loader-container') as HTMLDivElement).style.display = 'none';
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

async function initInitial() {
  // show loader
  (document.getElementById('main') as HTMLDivElement).style.display = 'none';
  (document.getElementById('loader-container') as HTMLDivElement).style.display = 'block';

  // first lookup by ip location
  const locIP = await getIPLocation(keys.google);
  if (locIP.lat !== 0) {
    locIP.name = await findByLocation(locIP.lat, locIP.lon, keys.google);
    updateIPInfo(locIP);
  }

  // second lookup by gps location
  const locGPS = await getGPSLocation();
  if (locGPS.lat !== 0) {
    locGPS.name = await findByLocation(locGPS.lat, locGPS.lon, keys.google);
    updateGPSInfo(locGPS);
  }

  // decide which to use
  if (locGPS.lat !== 0) update(locGPS);
  else if (locIP.lat !== 0) update(locIP);
  else {
    const locDefault = await findByAddress('Brickell', keys.google);
    update(locDefault);
  }
}

async function initEvents() {
  PullToRefresh.init({ // register pull down events
    mainElement: 'body',
    onRefresh() {
      log('pullRefresh');
      initInitial();
    },
  });

  const input = document.getElementById('input-address') as HTMLInputElement; // register search input
  input.onchange = async () => {
    log('inputAddress', input.value);
    const adr = input.value.trim();
    if (adr.length > 2) {
      const loc: Location = await findByAddress(adr, keys.google);
      updateSearchInfo(loc);
      update(loc);
    }
  };

  const info = document.getElementById('weather-info') as HTMLDivElement; // register refresh on click
  info.onclick = async () => initInitial();
}

async function main() {
  log('weather app');

  createSakura(); // create background
  updateClock(); // start clock
  window.addEventListener('beforeinstallprompt', (evt) => installable(evt)); // capture installable events
  await registerPWA('pwa-serviceworker.js'); // register pwa

  initInitial(); // do initial weather update
  initEvents(); // do weather update on demand when search is used
}

window.onload = main;
