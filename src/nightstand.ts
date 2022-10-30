import PullToRefresh from 'pulltorefreshjs';
import { log } from './log';
import { getIPLocation, findByLocation } from './location';
import { keys } from './secrets';
import { cors } from './cors';
import { updateAstronomy } from './astronomy';
import { updateLegend } from './legend';
import { updateToday } from './today';
import { updateForecast } from './forecast';
import { updateChart } from './chart';
import { updateRadar } from './radar';
import { updateAQI } from './aqi';
import { updateAlerts } from './alerts';
// import { updateClock } from './clock';
import './clock';
import { updateClockOverlay } from './clock-overlay';

let updateTime = 0;
const updateAll = async () => {
  updateTime = new Date().getTime();
  const loc = await getIPLocation(keys.google);
  loc.name = await findByLocation(loc.lat, loc.lon, keys.google);
  if (keys.darksky === '') return;
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

let scrollTime = new Date().getTime();
async function scrollNext() {
  scrollTime = new Date().getTime();
  const pages = Array.from((document.getElementById('main') as HTMLDivElement).children) as Array<HTMLDivElement>;
  let page = 0;
  for (let i = 0; i < pages.length; i++) {
    if (Math.round(window.scrollY) >= Math.round(pages[i].offsetTop)) page = i + 1;
  }
  if (page >= pages.length) page = 0;
  const offset = pages[page].offsetTop;
  // log('scrollNext', { page, offset });
  const interval = () => {
    const easing = Math.round(10 - 10 * Math.abs(Math.cos(Math.PI * window.scrollY / (offset + 1))));
    if (offset === 0 && window.scrollY > 0) {
      window.scroll(0, 0); // scroll back to top
    } else if (window.scrollY < offset) {
      window.scroll(0, window.scrollY + easing + 1); // scroll to div offset with easing
      setTimeout(interval, 10);
    }
  };
  interval();
}

async function initEvents() {
  PullToRefresh.init({ // register pull down events
    mainElement: 'body',
    onRefresh() { updateAll(); },
  });
  document.body.onclick = () => scrollNext();
}

async function main() {
  log('weather app');
  updateClockOverlay(); // start clock overlay on secondary pages
  await keys.init(); // load api keys from secrets or url
  initEvents(); // do weather update on demand
  updateAll(); // do initial weather update
  for (const page of Array.from(document.getElementsByClassName('page'))) (page as HTMLDivElement).style.minHeight = `${window.innerHeight}px`;

  setInterval(() => {
    const t = Math.round((new Date()).getTime() / 1000);
    if (t >= 15 + (scrollTime / 1000)) scrollNext(); // scroll to next page every 15sec
    if ((t >= 15 + (updateTime / 1000)) && (t % (15 * 60) === 0)) updateAll(); // update all data every 15min on the hour
    // if ((t >= 15 + (updateTime / 1000)) && (t % (24 * 60 * 60) === 0)) window.location.reload(); // reload page at midnight
  }, 100);
}

window.onload = main;
