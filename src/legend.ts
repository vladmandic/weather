import { color } from './color';
import { log } from './log';

export async function updateLegend(data) {
  log('updateLegend');
  if (!data || !data.currently) return;
  const div = document.getElementById('weather-legend');
  if (!div) return;
  let text = '';
  const rain = data.currently.precipProbability < 0.02 ? 'none' : `<b>${Math.round(100 * data.currently.precipProbability)}% for ${Math.round(100 * data.currently.precipIntensity) / 100} in</b>`;
  const storm = data.currently.nearestStormDistance ? `<b>${data.currently.nearestStormDistance} mi <span style="display:inline-block;transform:rotate(${data.currently.nearestStormBearing}deg);"> ↑ </span></b>` : 'none';
  text += color.hex(`Temperature <b>${Math.round(data.daily.data[0].temperatureLow)}° - ${Math.round(data.daily.data[0].temperatureHigh)}°</b><br>`, 'ff9696');
  text += color.hex(`Feels like <b>${Math.round(data.currently.apparentTemperature)}°</b><br>`, 'cca100');
  text += color.hex(`Humidity <b>${Math.round(100 * data.currently.humidity)}%</b><br>`, 'ffe100');
  text += color.hex(`Cloud cover <b>${Math.round(100 * data.currently.cloudCover)}%</b><br>`, 'cccccc');
  text += color.hex(`Rain ${rain}<br>`, '52ff97');
  text += color.hex(`Wind <b>${Math.round(data.currently.windSpeed)} to ${Math.round(data.currently.windGust)} mph <span style="display:inline-block;transform:rotate(${data.currently.windBearing}deg);"> ↑ </span></b><br>`, '00bbff');
  text += color.hex(`UV index <span style="background-color: rgba(${15 * data.currently.uvIndex}, ${15 * (15 - data.currently.uvIndex)}, ${0}, 1)"><b>&nbsp${data.currently.uvIndex}&nbsp</b></span><br>`, 'ebebeb');
  text += color.hex(`Visibility <b>${data.currently.visibility} mi</b><br>`, 'ebebeb');
  text += color.hex(`Dew point <b>${Math.round(data.currently.dewPoint)}°</b><br>`, 'ebebeb');
  text += color.hex(`Nearest storm ${storm}<br>`, 'ebebeb');
  div.innerHTML = text;
}

class ComponentLegend extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div style="width: fit-content">
        <div id="weather-legend" style="margin: 8px; text-align: center; line-height: 1.6rem"></div>
      </div>
    `;
  }
}

customElements.define('component-legend', ComponentLegend);
