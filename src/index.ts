import PullToRefresh from 'pulltorefreshjs';
import { log } from './log';
import { installable } from './install';
import { registerPWA } from './pwa-register';
import { keys } from './secrets';
import { createSakura } from './sakura';
import { initInput } from './address';
import { updateSearchInfo } from './info';
import { updateRadar } from './radar';
import { updateClockOverlay } from './clock-overlay';
import { findByAddress, Location } from './location';
import { update, initInitial } from './update'; // eslint-disable-line import/no-cycle
import './clock';
import './loader';

let updateTime = 0;
let pages: HTMLDivElement[] = [];

let scrollTime = new Date().getTime();
async function scrollNext() {
  if (pages.length === 0) return;
  scrollTime = new Date().getTime();
  let page = 0;
  for (let i = 0; i < pages.length; i++) {
    if (Math.round(window.scrollY) >= Math.round(pages[i].offsetTop)) page = i + 1;
  }
  if (page >= pages.length) page = 0;
  const offset = pages[page].offsetTop;
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
    onRefresh() {
      log('pullRefresh');
      initInitial();
    },
  });
  document.body.onclick = () => scrollNext();
}

async function main() {
  log('weather app');
  await keys.init(); // load api keys from secrets or url
  initInitial(); // do initial weather update
  initEvents(); // do weather update on demand
  pages = Array.from(document.getElementsByClassName('page')) as HTMLDivElement[];

  // nightstand mode
  if (pages.length > 0) {
    updateClockOverlay(); // start clock overlay on secondary pages
    for (const page of pages) (page as HTMLDivElement).style.minHeight = `${window.innerHeight}px`;
    setInterval(() => {
      const t = Math.round((new Date()).getTime() / 1000);
      if (t >= 15 + (scrollTime / 1000)) scrollNext(); // scroll to next page every 15sec
      if ((t >= 15 + (updateTime / 1000)) && (t % (15 * 60) === 0)) {
        updateTime = new Date().getTime();
        initInitial();
      }
      // if ((t >= 15 + (updateTime / 1000)) && (t % (24 * 60 * 60) === 0)) window.location.reload(); // reload page at midnight
    }, 100);

  // standalone mode
  } else {
    createSakura(); // create background
    window.addEventListener('beforeinstallprompt', (evt) => installable(evt)); // capture installable events
    await registerPWA('../dist/pwa-serviceworker.js'); // register pwa
    initInput(async (val) => {
      log('inputAddress', val);
      const loc: Location = await findByAddress(val, keys.google);
      updateSearchInfo(loc);
      updateRadar(loc.lat, loc.lon);
      update(loc);
    });
  }
}

window.onload = main;
