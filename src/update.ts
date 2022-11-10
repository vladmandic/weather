import { log } from './log';
import { findByLocation, getIPLocation, findByAddress, updateAddress, getGPSLocation } from './location'; // eslint-disable-line import/no-cycle
import { updateIPInfo, updateStationInfo, updateGPSInfo, updateForecastAge } from './info'; // eslint-disable-line import/no-cycle
import { showLoader, hideLoader } from './loader';
import { updateAstronomy } from './astronomy';
import { updateLegend } from './legend';
import { updateToday } from './today';
import { updateForecast } from './forecast';
import { updateChart } from './chart';
import { updateRadar } from './radar';
import { updateAQI } from './aqi';
import { updateAlerts } from './alerts';
import { updateWindy } from './windy';
import { updateDarkSky } from './darksky';
import { updateSeaTemperature } from './seatemperature';
import { keys } from './secrets';
import { cors } from './cors';
import type { Location } from './location';

export const update = async (loc: Location) => {
  // trigger update for items that dont need forecast data
  updateAstronomy(loc.lat, loc.lon);
  updateAddress(loc.name);
  updateAQI(loc.lat, loc.lon, keys.aqicn);
  updateSeaTemperature(loc);

  // trigger update for items using forecast data
  const data = keys.darksky !== '' ? await cors(`https://api.darksky.net/forecast/${keys.darksky}/${loc.lat},${loc.lon}`) : undefined; // get actual forecast
  if (!data || Object.keys(data).length === 0) {
    showLoader('<b>no data</b><br>check api keys');
    return;
  }

  log('weatherData', data);
  (document.getElementById('main') as HTMLDivElement).style.display = 'block';
  updateStationInfo(data?.flags);
  updateForecastAge(data?.currently?.time);
  updateToday(data, loc);
  updateForecast(data);
  updateLegend(data);
  updateChart(data);
  updateAlerts(data.alerts);

  // last update tiled items
  updateRadar(loc.lat, loc.lon);
  updateWindy(loc.lat, loc.lon);
  updateDarkSky(loc.lat, loc.lon);

  // hide loader
  hideLoader();
  const navEl = document.getElementById('nav');
  if (navEl) navEl.style.display = 'flex';

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

export async function initInitial(forceGPS?: boolean) {
  // show loader
  (document.getElementById('main') as HTMLDivElement).style.display = 'none';
  showLoader('loading');

  let loc: Location | null = null;

  if (!loc) { // 1. lookup by search params
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('location')) loc = await findByAddress(searchParams.get('location') as string, keys.google);
  }

  if (!loc) { // 2. lookup by ip location
    loc = await getIPLocation(keys.google);
    if (loc.lat !== 0) updateIPInfo(loc);
  }

  if (!loc || forceGPS) { // 3. lookup by gps location
    loc = await getGPSLocation();
    if (loc.lat !== 0) updateGPSInfo(loc);
  }

  if (loc?.lat !== 0) {
    [loc.name, loc.city] = await findByLocation(loc.lat, loc.lon, keys.google);
  } else {
    (document.getElementById('weather-info-ip') as HTMLDivElement).innerHTML = 'cannot automatically determine location'; // register refresh on click
  }

  update(loc);
}
