import { DateTime } from 'luxon';
import { log } from './log';

const imgPath = '../assets/weather';

export async function updateToday(data) {
  log('updateToday', { currently: data.currently });
  if (!data || !data.currently) return;
  const card = document.getElementById('weather-today');
  if (!card) return;
  card.setAttribute('time', Date.now().toString());
  const imgCurrent = document.getElementById('icon-current') as HTMLImageElement;
  imgCurrent.src = `${imgPath}/${data.currently.icon}.webp`;
  imgCurrent.alt = data.currently.icon;
  let title = '';
  for (const entry of Object.entries(data.currently)) {
    if (entry[0].toLowerCase().endsWith('time')) entry[1] = DateTime.fromSeconds(entry[1] as number).toFormat('HH:mm');
    title += `${entry[0]}: ${entry[1]}\n`;
  }
  imgCurrent.title = title;

  (card.querySelector('.temp-current') as HTMLDivElement).textContent = `${Math.round(10 * data.currently.temperature) / 10}°`;
  (card.querySelector('.temp-feel') as HTMLDivElement).innerHTML = `Feels like <b>${Math.round(data.currently.apparentTemperature)}</b>°`;
  (card.querySelector('.temp-minmax') as HTMLDivElement).innerHTML = `Range <b>${Math.round(data.daily.data[0].temperatureLow)}° - ${Math.round(data.daily.data[0].temperatureHigh)}°</b>`;
  if (data.currently?.summary) (card.querySelector('.desc-current') as HTMLDivElement).textContent = data.currently.summary.replace('.', '');
  if (data.minutely?.summary) (card.querySelector('.desc-minute') as HTMLDivElement).textContent = data.minutely.summary.replace('.', '');
  if (data.hourly?.summary) (card.querySelector('.desc-hour') as HTMLDivElement).textContent = data.hourly.summary.replace('.', '');
  if (data.daily?.summary) (card.querySelector('.desc-daily') as HTMLDivElement).textContent = data.daily.summary.replace('.', '');

  const div1 = document.getElementById('weather-today-details1');
  if (!div1) return;
  let text = '';
  const rain = data.currently.precipProbability < 0.02 ? 'none' : `<b>${Math.round(100 * data.currently.precipProbability)}% for ${Math.round(100 * data.currently.precipIntensity) / 100} in</b>`;
  text += `Humidity <b>${Math.round(100 * data.currently.humidity)}%</b><br>`;
  text += `Dew point <b>${Math.round(data.currently.dewPoint)}°</b><br>`;
  text += `Cloud cover <b>${Math.round(100 * data.currently.cloudCover)}%</b><br>`;
  text += `Pressure <b>${data.currently.pressure} mb</b><br>`;
  text += `Precipation <b>${rain}</b><br>`;
  div1.innerHTML = text;
  const div2 = document.getElementById('weather-today-details2');
  if (!div2) return;
  text = '';
  const storm = data.currently.nearestStormDistance ? `<b>${data.currently.nearestStormDistance} mi &nbsp<span style="display:inline-block;transform:rotate(${data.currently.nearestStormBearing}deg);"> ↑ </span></b>` : 'none';
  text += `UV index <span style="background-color: rgba(${15 * data.currently.uvIndex}, ${15 * (15 - data.currently.uvIndex)}, ${0}, 1)"><b>&nbsp${data.currently.uvIndex}&nbsp</b></span><br>`;
  text += `Visibility <b>${data.currently.visibility} mi</b><br>`;
  text += `Wind <b>${Math.round(data.currently.windSpeed)} to ${Math.round(data.currently.windGust)} mph &nbsp&nbsp<span style="display:inline-block;transform:rotate(${data.currently.windBearing}deg);"> ↑ </span></b><br>`;
  text += `Nearest storm ${storm}<br>`;
  div2.innerHTML = text;
}

class ComponentToday extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-today" style="margin: 20px 0 0 0; font-size: 1.2rem">
        <div class="current" id="day-0" style="display: flex; justify-content: center">
          <div class="icon" style="margin-right: 20px"><img id="icon-current" width="200" height="200"></img></div>
          <div class="temperature" style="display: block; margin-right: 20px">
            <div class="temp-current" style="text-align: center; margin: 20px 0 0 0; font-size: 3.4rem"></div>
            <div class="temp-feel" style="line-height: 2rem"></div>
            <div class="temp-minmax"></div>
          </div>
          <div id="weather-today-details1" class="weather-details" style="margin: 30px 10px 0 20px; line-height: 1.5rem">
          </div>
          <div id="weather-today-details2" class="weather-details" style="margin: 30px 10px 0 20px; line-height: 1.5rem">
          </div>
        </div>
        <div class="description" style="font-size: 1.4rem; line-height: 1.8rem; text-align: center; margin-top: 20px">
          <div class="desc-current" style="font-size: 1.8rem; line-height: 2rem"></div> 
          <div class="desc-minute"></div>
          <div class="desc-hour"></div>
          <div class="desc-daily"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('component-today', ComponentToday);
