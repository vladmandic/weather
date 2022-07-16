import { log } from './log';

const imgPath = '/assets/weather';

export async function updateToday(data) {
  log('updateToday');
  if (!data || !data.currently) return;
  const card = document.getElementById('weather-today');
  if (!card) return;
  card.setAttribute('time', Date.now().toString());
  const imgCurrent = document.getElementById('icon-current') as HTMLImageElement;
  imgCurrent.src = `${imgPath}/${data.currently.icon}.webp`;
  imgCurrent.alt = data.currently.icon;
  (card.querySelector('.temp-current') as HTMLDivElement).textContent = `${Math.round(10 * data.currently.temperature) / 10}°`;
  (card.querySelector('.temp-feel') as HTMLDivElement).innerHTML = `Feels like ${Math.round(data.currently.apparentTemperature)}°`;
  (card.querySelector('.temp-minmax') as HTMLDivElement).textContent = `Range ${Math.round(data.daily.data[0].temperatureLow)}° - ${Math.round(data.daily.data[0].temperatureHigh)}°`;
  (card.querySelector('.desc-current') as HTMLDivElement).textContent = data.currently.summary.replace('.', '');
  (card.querySelector('.desc-minute') as HTMLDivElement).textContent = data.minutely.summary.replace('.', '');
  (card.querySelector('.desc-hour') as HTMLDivElement).textContent = data.hourly.summary.replace('.', '');
  (card.querySelector('.desc-daily') as HTMLDivElement).textContent = data.daily.summary.replace('.', '');
}

class ComponentToday extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-today" style="margin: 8px">
        <div class="current" id="day-0" style="display: flex; justify-content: center">
          <div class="icon" style="margin-right: 20px"><img id="icon-current" width="140" height="140"></img></div>
          <div class="temperature" style="display: block; margin-right: 40px">
            <div class="temp-current" style="text-align: center; line-height: 70px; font-size: 2rem"></div>
            <div class="temp-feel" style="line-height: 2rem"></div>
            <div class="temp-minmax"></div>
          </div>
          <div class="description" style="line-height: 1.4rem; margin-top: 1.4rem; text-align: left">
            <div class="desc-current" style="font-size: 1.4rem; line-height: 2rem"></div> 
            <div class="desc-minute"></div>
            <div class="desc-hour"></div>
            <div class="desc-daily"></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('component-today', ComponentToday);
