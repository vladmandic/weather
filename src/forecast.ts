import { DateTime } from 'luxon';
import { log } from './log';

const imgPath = '../assets/weather';

export async function updateForecast(data) {
  log('updateForecast', { daily: data.daily });
  const card = document.getElementById('component-forecast');
  if (!card) return;
  if (!data || !data.currently || !data.daily) {
    card.style.display = 'none';
    return;
  }
  card.style.display = 'flex';
  const week = card.querySelectorAll('.component-forecast-day');
  week.forEach((day, i) => {
    const forecast = data.daily.data[i + 1];
    const img = document.getElementById(`icon-${i + 1}`) as HTMLImageElement;
    img.src = `${imgPath}/${forecast.icon}.webp`;
    img.alt = forecast.icon;
    let title = '';
    for (const entry of Object.entries(forecast)) {
      if (entry[0].toLowerCase().endsWith('time')) entry[1] = DateTime.fromSeconds(entry[1] as number).toFormat('HH:mm');
      title += `${entry[0]}: ${entry[1]}\n`;
    }
    img.title = title;
    (day.querySelector('.component-forecast-date') as HTMLDivElement).textContent = DateTime.fromSeconds(forecast.time).setZone(data.timezone).toFormat('ccc').toLowerCase();
    (day.querySelector('.component-forecast-temp-high') as HTMLDivElement).textContent = ` ${Math.round(forecast.temperatureHigh)}° `;
    (day.querySelector('.component-forecast-temp-low') as HTMLDivElement).textContent = ` ${Math.round(forecast.temperatureLow)}° `;
    let precip = '';
    if (forecast.precipProbability > 0.05 && Math.round(100 * forecast.precipIntensityMax) > 0) {
      precip += `
          <span style="color: rgb(${100}, ${100 + Math.trunc(155 * forecast.precipProbability)}, ${100})">
          ${forecast.precipType} ${Math.round(100 * forecast.precipProbability)}% 
          </span>
        `;
    }
    if (Math.round(100 * forecast.precipIntensity) > 0) {
      precip += `
          <span style="color: black; background-color: rgb(${100}, ${100 + Math.trunc(1500 * forecast.precipIntensity)}, ${100})">
          <b>&nbsp${Math.min(Math.round(100 * forecast.precipIntensity), 10)}&nbsp</b></span>
        `;
    }
    if (Math.round(100 * forecast.precipIntensityMax) > 0) {
      precip += `
          <br>
          at ${DateTime.fromSeconds(forecast.precipIntensityMaxTime).toFormat('HH:mm')} 
          <span style="color: black; background-color: rgb(${100}, ${100 + Math.trunc(1500 * forecast.precipIntensityMax)}, ${100})">
          <b>&nbsp${Math.min(Math.round(100 * forecast.precipIntensityMax), 10)}&nbsp</b></span>
        `;
    }
    (day.querySelector('.daily-rain') as HTMLDivElement).innerHTML = precip;
  });
  card.style.visibility = 'visible';
}

class ComponentForecast extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    this.innerHTML = `
      <div id="component-forecast" class="component-forecast" style="visibility: hidden">
        <div class="component-forecast-day"><div class="component-forecast-date" id="day-1"></div>
          <div class="icon"><img id="icon-1" width="120" height="120" src="${blank}"></img></div>
          <div class="day-details"><span class="component-forecast-temp-low"></span> - <span class="component-forecast-temp-high"></span><br><span class="daily-rain"</span></div>
        </div>
        <div class="component-forecast-day"><div class="component-forecast-date" id="day-2"></div>
          <div class="icon"><img id="icon-2" width="120" height="120" src="${blank}"></img></div>
          <div class="day-details"><span class="component-forecast-temp-low"></span> - <span class="component-forecast-temp-high"></span><br><span class="daily-rain"</span></div>
        </div>
        <div class="component-forecast-day"><div class="component-forecast-date" id="day-3"></div>
          <div class="icon"><img id="icon-3" width="120" height="120" src="${blank}"></img></div>
          <div class="day-details"><span class="component-forecast-temp-low"></span> - <span class="component-forecast-temp-high"></span><br><span class="daily-rain"</span></div>
        </div>
        <div class="component-forecast-day"><div class="component-forecast-date" id="day-4"></div>
          <div class="icon"><img id="icon-4" width="120" height="120" src="${blank}"></img></div>
          <div class="day-details"><span class="component-forecast-temp-low"></span> - <span class="component-forecast-temp-high"></span><br><span class="daily-rain"</span></div>
        </div>
        <div class="component-forecast-day"><div class="component-forecast-date" id="day-5"></div>
          <div class="icon"><img id="icon-5" width="120" height="120" src="${blank}"></img></div>
          <div class="day-details"><span class="component-forecast-temp-low"></span> - <span class="component-forecast-temp-high"></span><br><span class="daily-rain"</span></div>
        </div>
        <div class="component-forecast-day"><div class="component-forecast-date" id="day-6"></div>
          <div class="icon"><img id="icon-6" width="120" height="120" src="${blank}"></img></div>
          <div class="day-details"><span class="component-forecast-temp-low"></span> - <span class="component-forecast-temp-high"></span><br><span class="daily-rain"</span></div>
        </div>
        <div class="component-forecast-day"><div class="component-forecast-date" id="day-7"></div>
          <div class="icon"><img id="icon-7" width="120" height="120" src="${blank}"></img></div>
          <div class="day-details"><span class="component-forecast-temp-low"></span> - <span class="component-forecast-temp-high"></span><br><span class="daily-rain"</span></div>
        </div>
      </div>
    `;
  }
}

customElements.define('component-forecast', ComponentForecast);
