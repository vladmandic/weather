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
import { loaderCallback } from './loader';
import './clock';

let updateTime = 0;
let pages: HTMLDivElement[] = [];

async function scrollTo(offset, duration, startTime?, startPos?) {
  if (!startPos) startPos = window.scrollY;
  if (!startTime) startTime = new Date().getTime();
  if (offset === 0) window.scroll(0, 0); // scroll back to top
  else {
    const elapsed = new Date().getTime() - startTime;
    const easeInOutSine = (Math.cos(Math.PI * (elapsed - duration) / duration) + 1) / 2;
    const target = easeInOutSine * easeInOutSine * (offset - startPos) + startPos; // easeInOutQuad
    window.scroll(0, target);
    if (elapsed < duration) setTimeout(() => scrollTo(offset, duration, startTime, startPos), 10);
  }
}

let scrollTime = new Date().getTime();
async function scrollNext() {
  if (pages.length === 0) return;
  scrollTime = new Date().getTime();
  let page = 0;
  for (let i = 0; i < pages.length; i++) {
    if (window.scrollY >= pages[i].offsetTop - 1) page = i + 1;
  }
  if (page >= pages.length) page = 0;
  log('scrollNext', { page });
  scrollTo(pages[page].offsetTop, 3000);
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
  const navEl = document.getElementById('nav');
  const navs = Array.from(navEl?.children || []) as HTMLSpanElement[];
  for (const nav of navs) {
    const target = document.getElementsByTagName(`component-${nav.getAttribute('target')}`)?.[0] as HTMLDivElement;
    if (!target) continue;
    nav.onclick = () => scrollTo(target.offsetTop - 50, 1000);
  }
}

async function main() {
  log('weather app');
  await keys.init(); // load api keys from secrets or url
  initInitial(); // do initial weather update
  initEvents(); // do weather update on demand
  pages = Array.from(document.getElementsByClassName('page')) as HTMLDivElement[];
  loaderCallback(initInitial);

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
