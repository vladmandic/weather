import { DateTime } from 'luxon';
import * as SunCalc from 'suncalc';
import { log } from './log';

const hhmm = (dt: Date) => (Number.isNaN(dt.getTime()) ? '' : DateTime.fromJSDate(dt).toFormat('HH:mm'));

export function updateAstronomy(lat, lon) {
  const collection = document.getElementsByTagName('component-astronomy');
  for (let i = 0; i < collection.length; i++) {
    collection[i].setAttribute('loc', `${lat},${lon}`);
  }
}

class ComponentAstronomy extends HTMLElement { // watch for attributes
  static get observedAttributes() { return ['loc']; }

  connectedCallback() { // triggered on insert
    this.innerHTML = '';
  }

  attributeChangedCallback(name, _oldValue, newValue) { // triggered on attribute change
    if (name !== 'loc') return;
    const now = new Date();
    const [lat, lon] = newValue.split(',');
    const sunTimes = SunCalc.getTimes(now, lat, lon);
    const moonTimes = SunCalc.getMoonTimes(now, lat, lon);
    const moonIllumination = SunCalc.getMoonIllumination(now);
    const sunPos = SunCalc.getPosition(now, lat, lon);
    const moonPos = SunCalc.getMoonPosition(now, lat, lon);

    const astronomy = { sunTimes, moonTimes, moonIllumination, sunPos, moonPos };
    const title = JSON.stringify(astronomy, null, 2).replace(/{|}|"|,/g, '').replace('  ', ' ');
    log('updateAstronomy', astronomy);
    const phase = `<span style="display:inline-block;transform:rotate(${(moonIllumination.phase <= 0.5) ? 0 : 180}deg);"> ↑ </span>`;
    let img = '../assets/phases/moon-100.webp';
    if (moonIllumination.phase <= 0.88) img = '../assets/phases/moon-87.webp';
    if (moonIllumination.phase <= 0.76) img = '../assets/phases/moon-62.webp';
    if (moonIllumination.phase <= 0.54) img = '../assets/phases/moon-50.webp';
    if (moonIllumination.phase <= 0.44) img = '../assets/phases/moon-37.webp';
    if (moonIllumination.phase <= 0.32) img = '../assets/phases/moon-25.webp';
    if (moonIllumination.phase <= 0.20) img = '../assets/phases/moon-12.webp';
    if (moonIllumination.phase <= 0.08) img = '../assets/phases/moon-0.webp';
    this.innerHTML = `
      <table class="component-astronomy" style="margin: 10px 0 20px 0; font-size: 1.2rem">
        <tr>
          <td>
            <img src="../assets/phases/sun.webp" width="130px" height="130px" alt="sunrise" style="margin: -10px" title="${title}"></img>
          </td>
          <td>
            predawn<br>dawn<br>sunrise<br>noon<br>azimuth
          <td>
          <td>
            ${hhmm(sunTimes.nauticalDawn)}<br>${hhmm(sunTimes.dawn)}<br>${hhmm(sunTimes.sunrise)} - ${hhmm(sunTimes.sunriseEnd)}<br>${hhmm(sunTimes.solarNoon)}<br>
            ${Math.round(180 * sunPos.azimuth / Math.PI)}°<br>
          </td>
          <td>
            <img src="../assets/phases/moon.webp" width="130px" height="130px" alt="sunset" style="margin: -10px" title="${title}"></img>
          </td>
          <td style="padding-right: 10px">
            golden<br>sunset<br>dusk<br>night<br>altitude
          <td>
          <td>
            ${hhmm(sunTimes.goldenHour)}<br>${hhmm(sunTimes.sunsetStart)} - ${hhmm(sunTimes.sunset)}<br>${hhmm(sunTimes.dusk)} - ${hhmm(sunTimes.nauticalDusk)}<br>${hhmm(sunTimes.night)}<br>
            ${Math.round(180 * sunPos.altitude / Math.PI)}°
          </td>
          <td>
            <img src="${img}" width="70px" height="70px" alt="moonrise" style="margin-left: 20px" title="${title}"></img>
          </td>
          <td>
            rise<br>set<br>phase<br>azimuth<br>altitude
          <td>
          <td>
            ${moonTimes.rise ? hhmm(moonTimes.rise) : ''}<br>${moonTimes.set ? hhmm(moonTimes.set) : ''}<br>${Math.round(100 * (1 - 2 * Math.abs(0.5 - moonIllumination.phase)))}% ${phase}<br>
            ${Math.round(180 * moonPos.azimuth / Math.PI)}°<br>${Math.round(180 * moonPos.altitude / Math.PI)}°
          </td>
        </tr>
      </table>
    `;
  }
}

customElements.define('component-astronomy', ComponentAstronomy);
