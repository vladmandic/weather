import PullToRefresh from 'pulltorefreshjs';
import { log } from './log';
import { findByAddress } from './location';
import { installable } from './install';
import { registerPWA } from './pwa-register';
import { updateSearchInfo } from './info';
import { createSakura } from './sakura';
import './clock';
import { update, initInitial } from './update'; // eslint-disable-line import/no-cycle
import { keys } from './secrets';
import type { Location } from './location';

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
}

async function main() {
  log('weather app');

  createSakura(); // create background
  window.addEventListener('beforeinstallprompt', (evt) => installable(evt)); // capture installable events
  await registerPWA('../dist/pwa-serviceworker.js'); // register pwa

  await keys.init();
  initInitial(); // do initial weather update
  initEvents(); // do weather update on demand when search is used
}

window.onload = main;
