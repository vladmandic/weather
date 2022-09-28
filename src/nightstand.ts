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
import { updateClock } from './clock';
import { updateClockOverlay } from './clock-overlay';

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
    } else {
      setInterval(scrollNext, 15 * 1000); // scroll to new page every 15sec
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
  // createSakura(); // create background
  updateClock(true); // start clock
  updateClockOverlay();
  await keys.init();
  initEvents(); // do weather update on demand
  update(); // do initial weather update
  for (const page of Array.from(document.getElementsByClassName('page'))) (page as HTMLDivElement).style.minHeight = `${window.innerHeight}px`;
  (document.getElementById('weather-radar') as HTMLDivElement).style.height = `${window.innerHeight}px`;

  setTimeout(scrollNext, 15 * 1000); // start scroll to new page every 15sec

  setInterval(() => { // reload on every full hour and quarters
    const t = Math.round((new Date()).getTime() / 1000);
    if (t % (60 * 15) === 0) window.location.reload();
  }, 500);
}

window.onload = main;
