import { log } from './log';
import { findByLocation, getIPLocation, updateAddress } from './location'; // eslint-disable-line import/no-cycle
import { updateIPInfo, updateStationInfo, updateForecastAge } from './info'; // eslint-disable-line import/no-cycle
import { updateAstronomy } from './astronomy';
import { updateLegend } from './legend';
import { updateToday } from './today';
import { updateForecast } from './forecast';
import { updateChart } from './chart';
import { updateRadar } from './radar';
import { updateAQI } from './aqi';
import { updateAlerts } from './alerts';
import { updateWindy } from './windy';
import * as keys from '../secrets.json';
import { cors } from './cors';
import type { Location } from './location';

export const update = async (loc: Location) => {
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

export async function initInitial() {
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
  /*
  const locGPS = await getGPSLocation();
  if (locGPS.lat !== 0) {
    locGPS.name = await findByLocation(locGPS.lat, locGPS.lon, keys.google);
    updateGPSInfo(locGPS);
  }
  if (locGPS.lat !== 0) update(locGPS);
  */

  // decide which to use
  if (locIP.lat !== 0) update(locIP);
  else {
    (document.getElementById('weather-info-text') as HTMLDivElement).innerHTML = 'cannot automatically determine location'; // register refresh on click
    // const locDefault = await findByAddress('Brickell', keys.google);
    // update(locDefault);
  }
}
