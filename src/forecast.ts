import { DateTime } from 'luxon';
import { log } from './log';

const imgPath = '../assets/weather';

export async function updateForecast(data) {
  log('updateForecast', { daily: data.daily });
  if (!data || !data.currently || !data.daily) return;
  const card = document.getElementById('weather-forecast');
  if (!card) return;
  const week = card.querySelectorAll('.future .oneday');
  week.forEach((weekday, i) => {
    const day = weekday;
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
    (day.querySelector('.forecast-date') as HTMLDivElement).textContent = DateTime.fromSeconds(forecast.time).setZone(data.timezone).toFormat('ccc');
    (day.querySelector('.daily-temp-high') as HTMLDivElement).textContent = ` ${Math.round(forecast.temperatureHigh)}° `;
    (day.querySelector('.daily-temp-low') as HTMLDivElement).textContent = ` ${Math.round(forecast.temperatureLow)}° `;
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
    this.innerHTML = `
      <div id="weather-forecast" style="margin: 40px 0 0 0; visibility: hidden">
        <div class="future" style="display: flex; text-align: center; line-height: 1.4rem; justify-content: center; font-size: 1.1rem">
          <div class="oneday" style="padding: 20px"><div class="forecast-date" id="day-1" style="font-size: 1.4rem"></div>
              <div class="icon"><img id="icon-1" width="100" height="100"></img></div>
              <div class="day-details"><span class="daily-temp-low"></span> - <span class="daily-temp-high"></span><br><span class="daily-rain"</span></div>
          </div>
          <div class="oneday" style="padding: 20px"><div class="forecast-date" id="day-2" style="font-size: 1.4rem"></div>
              <div class="icon"><img id="icon-2" width="100" height="100"></img></div>
              <div class="day-details"><span class="daily-temp-low"></span> - <span class="daily-temp-high"></span><br><span class="daily-rain"</span></div>
          </div>
          <div class="oneday" style="padding: 20px"><div class="forecast-date" id="day-3" style="font-size: 1.4rem"></div>
              <div class="icon"><img id="icon-3" width="100" height="100"></img></div>
              <div class="day-details"><span class="daily-temp-low"></span> - <span class="daily-temp-high"></span><br><span class="daily-rain"</span></div>
          </div>
          <div class="oneday" style="padding: 20px"><div class="forecast-date" id="day-4" style="font-size: 1.4rem"></div>
              <div class="icon"><img id="icon-4" width="100" height="100"></img></div>
              <div class="day-details"><span class="daily-temp-low"></span> - <span class="daily-temp-high"></span><br><span class="daily-rain"</span></div>
          </div>
          <div class="oneday" style="padding: 20px"><div class="forecast-date" id="day-5" style="font-size: 1.4rem"></div>
              <div class="icon"><img id="icon-5" width="100" height="100"></img></div>
              <div class="day-details"><span class="daily-temp-low"></span> - <span class="daily-temp-high"></span><br><span class="daily-rain"</span></div>
          </div>
          <div class="oneday" style="padding: 20px"><div class="forecast-date" id="day-6" style="font-size: 1.4rem"></div>
              <div class="icon"><img id="icon-6" width="100" height="100"></img></div>
              <div class="day-details"><span class="daily-temp-low"></span> - <span class="daily-temp-high"></span><br><span class="daily-rain"</span></div>
          </div>
          <div class="oneday" style="padding: 20px"><div class="forecast-date" id="day-7" style="font-size: 1.4rem"></div>
              <div class="icon"><img id="icon-7" width="100" height="100"></img></div>
              <div class="day-details"><span class="daily-temp-low"></span> - <span class="daily-temp-high"></span><br><span class="daily-rain"</span></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('component-forecast', ComponentForecast);
