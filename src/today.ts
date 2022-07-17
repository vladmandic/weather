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
  (card.querySelector('.temp-feel') as HTMLDivElement).innerHTML = `Feels like <b>${Math.round(data.currently.apparentTemperature)}</b>°`;
  (card.querySelector('.temp-minmax') as HTMLDivElement).innerHTML = `Range <b>${Math.round(data.daily.data[0].temperatureLow)}° - ${Math.round(data.daily.data[0].temperatureHigh)}°</b>`;
  (card.querySelector('.desc-current') as HTMLDivElement).textContent = data.currently.summary.replace('.', '');
  (card.querySelector('.desc-minute') as HTMLDivElement).textContent = data.minutely.summary.replace('.', '');
  (card.querySelector('.desc-hour') as HTMLDivElement).textContent = data.hourly.summary.replace('.', '');
  (card.querySelector('.desc-daily') as HTMLDivElement).textContent = data.daily.summary.replace('.', '');

  const div1 = document.getElementById('weather-today-details1');
  if (!div1) return;
  let text = '';
  text += `Humidity <b>${Math.round(100 * data.currently.humidity)}%</b><br>`;
  text += `Dew point <b>${Math.round(data.currently.dewPoint)}°</b><br>`;
  text += `Cloud cover <b>${Math.round(100 * data.currently.cloudCover)}%</b><br>`;
  text += `Wind <b>${Math.round(data.currently.windSpeed)} to ${Math.round(data.currently.windGust)} mph &nbsp<span style="display:inline-block;transform:rotate(${data.currently.windBearing}deg);"> ↑ </span></b><br>`;
  div1.innerHTML = text;
  const div2 = document.getElementById('weather-today-details2');
  if (!div2) return;
  text = '';
  const rain = data.currently.precipProbability < 0.02 ? 'none' : `<b>${Math.round(100 * data.currently.precipProbability)}% for ${Math.round(100 * data.currently.precipIntensity) / 100} in</b>`;
  const storm = data.currently.nearestStormDistance ? `<b>${data.currently.nearestStormDistance} mi <span style="display:inline-block;transform:rotate(${data.currently.nearestStormBearing}deg);"> ↑ </span></b>` : 'none';
  text += `Rain ${rain}<br>`;
  text += `UV index <span style="background-color: rgba(${15 * data.currently.uvIndex}, ${15 * (15 - data.currently.uvIndex)}, ${0}, 1)"><b>&nbsp${data.currently.uvIndex}&nbsp</b></span><br>`;
  text += `Visibility <b>${data.currently.visibility} mi</b><br>`;
  text += `Nearest storm &nbsp${storm}<br>`;
  div2.innerHTML = text;
}

class ComponentToday extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-today" style="margin: 20px 0 0 0; font-size: 1.2rem">
        <div class="current" id="day-0" style="display: flex; justify-content: center">
          <div class="icon" style="margin-right: 20px"><img id="icon-current" width="140" height="140"></img></div>
          <div class="temperature" style="display: block; margin-right: 40px">
            <div class="temp-current" style="text-align: center; line-height: 70px; font-size: 2.4rem"></div>
            <div class="temp-feel" style="line-height: 2rem"></div>
            <div class="temp-minmax"></div>
          </div>
          <div id="weather-today-details1" class="weather-details" style="margin: 30px 10px 0 20px; line-height: 1.3rem">
          </div>
          <div id="weather-today-details2" class="weather-details" style="margin: 30px 10px 0 20px; line-height: 1.3rem">
          </div>
        </div>
        <div class="description" style="font-size: 1.2rem; line-height: 1.5rem; margin-top: 1.4rem; text-align: center">
          <div class="desc-current" style="font-size: 1.6rem; line-height: 2rem"></div> 
          <div class="desc-minute"></div>
          <div class="desc-hour"></div>
          <div class="desc-daily"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('component-today', ComponentToday);
