import { DateTime } from 'luxon';
import { log } from './log';
import type { Location } from './location';
import { updateNOAA } from './noaa';

const imgPath = '../assets/weather';

export async function updateToday(data, loc: Location) {
  log('updateToday', { currently: data.currently });
  const card = document.getElementById('component-today');
  if (!card) return;
  if (!data || !data.currently) {
    card.style.display = 'none';
    return;
  }
  card.style.display = 'block';
  card.setAttribute('time', Date.now().toString());
  const imgCurrent = document.getElementById('component-today-icon') as HTMLImageElement;
  imgCurrent.src = `${imgPath}/${data.currently.icon}.webp`;
  imgCurrent.alt = data.currently.icon;
  let title = '';
  for (const entry of Object.entries(data.currently)) {
    if (entry[0].toLowerCase().endsWith('time')) entry[1] = DateTime.fromSeconds(entry[1] as number).toFormat('HH:mm');
    title += `${entry[0]}: ${entry[1]}\n`;
  }
  imgCurrent.title = title;

  (card.querySelector('.temp-current') as HTMLDivElement).textContent = `${Math.round(10 * data.currently.temperature) / 10}°`;
  (card.querySelector('.temp-feel') as HTMLDivElement).innerHTML = `feels like <b>${Math.round(data.currently.apparentTemperature)}</b>°`;
  (card.querySelector('.temp-minmax') as HTMLDivElement).innerHTML = `range <b>${Math.round(data.daily.data[0].temperatureLow)}° - ${Math.round(data.daily.data[0].temperatureHigh)}°</b>`;
  if (data.currently?.summary) (card.querySelector('.desc-current') as HTMLDivElement).textContent = data.currently.summary.replace('.', '').toLowerCase();
  if (data.minutely?.summary) (card.querySelector('.desc-minute') as HTMLDivElement).textContent = data.minutely.summary.replace('.', '').toLowerCase();
  if (data.hourly?.summary) (card.querySelector('.desc-hour') as HTMLDivElement).textContent = data.hourly.summary.replace('.', '').toLowerCase();
  if (data.daily?.summary) (card.querySelector('.desc-daily') as HTMLDivElement).textContent = data.daily.summary.replace('.', '').toLowerCase();

  const div1 = document.getElementById('component-today-column2');
  if (!div1) return;
  let html = '';
  const rain = data.currently.precipProbability < 0.02 ? 'none' : `<b>${Math.round(100 * data.currently.precipProbability)}% for ${Math.round(100 * data.currently.precipIntensity) / 100} in</b>`;
  html += `humidity <b>${Math.round(100 * data.currently.humidity)}%</b><br>`;
  html += `dew point <b>${Math.round(data.currently.dewPoint)}°</b><br>`;
  html += `cloud cover <b>${Math.round(100 * data.currently.cloudCover)}%</b><br>`;
  html += `pressure <b>${data.currently.pressure} mb</b><br>`;
  html += `precipation <b>${rain}</b><br>`;
  div1.innerHTML = html;
  const div2 = document.getElementById('component-today-column3');
  if (!div2) return;
  html = '';
  const storm = data.currently.nearestStormDistance ? `<b>${data.currently.nearestStormDistance} mi &nbsp<span style="display:inline-block;transform:rotate(${data.currently.nearestStormBearing}deg);"> ↑ </span></b>` : 'none';
  html += `uv index <span style="background-color: rgba(${15 * data.currently.uvIndex}, ${15 * (15 - data.currently.uvIndex)}, ${0}, 1)"><b>&nbsp${data.currently.uvIndex}&nbsp</b></span><br>`;
  html += `visibility <b>${data.currently.visibility} mi</b><br>`;
  html += `wind <b>${Math.round(data.currently.windSpeed)} to ${Math.round(data.currently.windGust)} mph &nbsp&nbsp<span style="display:inline-block;transform:rotate(${data.currently.windBearing}deg);"> ↑ </span></b><br>`;
  html += `nearest storm ${storm}<br>`;
  const seaTemp = await updateNOAA(loc.lat, loc.lon);
  if (seaTemp) html += `sea temperature ${seaTemp}°<br>`;
  div2.innerHTML = html;
}

class ComponentToday extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    // this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.innerHTML = `
      #component-today { margin: 20px 0 0 0; font-size: 1.2rem; }
      .component-today-icon { margin-right: 25px }
    `;
    const container = document.createElement('div');
    container.style.cssText = 'margin: 20px 0 0 0; font-size: 1.2rem';
    this.id = 'component-today';
    container.innerHTML = `
      <div class="current" id="day-0" style="display: flex; justify-content: center; font-size: 1.2rem; line-height: 1.3">
        <div class="component-today-icon">
          <img id="component-today-icon" width="200" height="200" src="${blank}"></img>
        </div>
        <div id="component-today-column1" style="margin-right: 25px">
          <div class="temp-current" style="text-align: center; font-size: 3.4rem"></div>
          <div class="temp-feel" style="line-height: 2rem"></div>
          <div class="temp-minmax"></div>
        </div>
        <div id="component-today-column2" style="margin: 12px 25px 0 25px">
        </div>
        <div id="component-today-column3" style="margin: 12px 25px 0 25px">
        </div>
      </div>
      <div class="weather-text" style="font-size: 1.8rem; line-height: 1.8rem; text-align: center">
        <div class="desc-current"></div> 
        <div class="desc-minute"></div>
        <div class="desc-hour"></div>
        <div class="desc-daily"></div>
      </div>
    `;
    this.appendChild(container);
    // this.shadowRoot?.append(style, container);
  }
}

customElements.define('component-today', ComponentToday);
