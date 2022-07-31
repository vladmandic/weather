import PullToRefresh from 'pulltorefreshjs';
import { log } from './log';
import { getIPLocation, findByLocation } from './location';
import * as keys from '../secrets.json';
import { cors } from './cors';
import { updateAstronomy } from './astronomy';
import { updateLegend } from './legend';
import { updateToday } from './today';
import { updateForecast } from './forecast';
import { updateChart } from './chart';
import { updateRadar } from './radar';
import { updateAQI } from './aqi';
import { updateAlerts } from './alerts';
import { createSakura } from './sakura';
import { updateClock } from './clock';

const update = async () => {
  const loc = await getIPLocation(keys.google);
  loc.name = await findByLocation(loc.lat, loc.lon, keys.google);
  const data = await cors(`https://api.darksky.net/forecast/${keys.darksky}/${loc.lat},${loc.lon}`); // get actual forecast
  log('weatherData', data);
  await updateToday(data);
  await updateForecast(data);
  await updateLegend(data);
  await updateAstronomy(loc.lat, loc.lon);
  await updateAQI(loc.lat, loc.lon, keys.aqicn);
  await updateChart(data);
  await updateAlerts(data);
  await updateRadar(loc.lat, loc.lon);
  window.scroll(0, 0);
};

async function scrollNext() {
  const pages = Array.from((document.getElementById('main') as HTMLDivElement).children) as Array<HTMLDivElement>;
  let page = 0;
  for (let i = 0; i < pages.length; i++) {
    if (Math.round(window.scrollY) >= Math.round(pages[i].offsetTop)) page = i + 1;
  }
  if (page >= pages.length) page = 0;
  const offset = pages[page].offsetTop;
  log('scrollNext', { page, offset });
  const interval = () => {
    const easing = Math.round(10 - 10 * Math.abs(Math.cos(Math.PI * window.scrollY / (offset + 1))));
    if (offset === 0 && window.scrollY > 0) {
      window.scroll(0, 0); // scroll back to top
    } else if (window.scrollY < offset) {
      window.scroll(0, window.scrollY + easing + 1); // scroll to div offset
      setTimeout(interval, 10);
    }
  };
  interval();
}

async function initEvents() {
  PullToRefresh.init({ // register pull down events
    mainElement: 'body',
    onRefresh() { update(); },
  });
  document.body.onclick = () => scrollNext();
}

async function main() {
  log('weather app');
  createSakura(); // create background
  updateClock(); // start clock
  initEvents(); // do weather update on demand
  update(); // do initial weather update
  setTimeout(update, 15 * 60 * 1000); // update every 15min
  setTimeout(scrollNext, 15 * 1000); // scroll to new page every 15sec
  (document.getElementById('weather-radar') as HTMLDivElement).style.width = `${window.innerWidth - 100}px`;
  (document.getElementById('weather-radar') as HTMLDivElement).style.height = `${window.innerHeight}px`;
  (document.getElementById('weather-chart') as HTMLDivElement).style.maxWidth = `${window.innerWidth}px`;
  (document.getElementById('weather-canvas') as HTMLCanvasElement).style.width = `${window.innerWidth - 100}px`;
}

window.onload = main;
