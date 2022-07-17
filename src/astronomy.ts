import { DateTime } from 'luxon';
import * as SunCalc from 'suncalc';
import { log } from './log';

const hhmm = (dt) => DateTime.fromJSDate(dt).toFormat('HH:mm');

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
    this.style.display = 'inline-block';
  }

  attributeChangedCallback(name, _oldValue, newValue) { // triggered on attribute change
    if (name !== 'loc') return;
    const [lat, lon] = newValue.split(',');
    const sun = SunCalc.getTimes(new Date(), lat, lon);
    const moon = SunCalc.getMoonTimes(new Date(), lat, lon);
    const pos = SunCalc.getMoonIllumination(new Date());
    log('updateAstronomy', { lat, lon, sun, moon, pos });
    const phase = `<span style="display:inline-block;transform:rotate(${(pos.phase <= 0.5) ? 0 : 180}deg);"> ↑ </span>`;
    let img = '/assets/phases/moon-100.webp';
    if (pos.phase <= 0.88) img = '/assets/phases/moon-87.webp';
    if (pos.phase <= 0.76) img = '/assets/phases/moon-62.webp';
    if (pos.phase <= 0.54) img = '/assets/phases/moon-50.webp';
    if (pos.phase <= 0.44) img = '/assets/phases/moon-37.webp';
    if (pos.phase <= 0.32) img = '/assets/phases/moon-25.webp';
    if (pos.phase <= 0.20) img = '/assets/phases/moon-12.webp';
    if (pos.phase <= 0.08) img = '/assets/phases/moon-0.webp';
    this.innerHTML = `
      <table class="component-astronomy-data" style="display: block; margin: 20px 0 20px 0">
        <tr>
          <td><img src="/assets/phases/sun.webp" width="100px" height="100px" alt="sunrise"></img></td>
          <td>Dawn<br>Sunrise<br>Noon<td>
          <td>${hhmm(sun.dawn)}<br>${hhmm(sun.sunrise)} - ${hhmm(sun.sunriseEnd)}<br>${hhmm(sun.solarNoon)}</td>
          <td><img src="/assets/phases/moon.webp" width="100px" height="100px" alt="sunset" style="margin-left: 20px"></img></td>
          <td style="padding-right: 10px">Golden hour<br>Sunset<br>Dusk<br>Night<td>
          <td>${hhmm(sun.goldenHour)}<br>${hhmm(sun.sunsetStart)} - ${hhmm(sun.sunset)}<br>${hhmm(sun.dusk)}<br>${hhmm(sun.night)}</td>
          <td><img src="${img}" width="50px" height="50px" alt="moonrise" style="margin-left: 50px"></img></td>
          <td>Moonrise<br>Moonset<br>Phase<td>
          <td>${hhmm(moon.rise)}<br>${hhmm(moon.set)}<br>${Math.round(100 * (1 - 2 * Math.abs(0.5 - pos.phase)))}% ${phase}</td>
        </tr>
      </table>
    `;
  }
}

customElements.define('component-astronomy', ComponentAstronomy);
