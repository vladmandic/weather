import { color } from './color';
import { log } from './log';

export async function updateLegend(data) {
  log('updateLegend');
  if (!data || !data.currently) return;
  const x = data.currently;
  const rain = x.precipProbability < 0.02 ? 'none' : `<b>${Math.round(100 * x.precipProbability)}% for ${Math.round(100 * x.precipIntensity) / 100} in</b>`;
  const storm = x.nearestStormDistance ? `<b>${x.nearestStormDistance} mi <span style="display:inline-block;transform:rotate(${x.nearestStormBearing}deg);"> ↑ </span></b>` : 'none';
  const div = document.getElementById('weather-legend');
  if (!div) return;
  let text = '';
  text += color.hex(`Temperature <b>${Math.round(data.daily.data[0].temperatureLow)}° - ${Math.round(data.daily.data[0].temperatureHigh)}°</b><br>`, 'ffe100');
  text += color.hex(`Feels like <b>${Math.round(data.currently.apparentTemperature)}°</b><br>`, 'cca100');
  text += color.hex(`Humidity <b>${Math.round(100 * x.humidity)}%</b><br>`, 'ff9696');
  text += color.hex(`Cloud cover <b>${Math.round(100 * x.cloudCover)}%</b><br>`, 'cccccc');
  text += color.hex(`Rain ${rain}<br>`, '52ff97');
  text += color.hex(`Wind <b>${Math.round(x.windSpeed)} to ${Math.round(x.windGust)} mph <span style="display:inline-block;transform:rotate(${x.windBearing}deg);"> ↑ </span></b><br>`, '00bbff');
  text += color.hex(`UV index <span style="background-color: rgba(${15 * x.uvIndex}, ${15 * (15 - x.uvIndex)}, ${0}, 1)"><b>&nbsp${x.uvIndex}&nbsp</b></span><br>`, 'ebebeb');
  text += color.hex(`Visibility <b>${x.visibility} mi</b><br>`, 'ebebeb');
  text += color.hex(`Dew point <b>${Math.round(x.dewPoint)}°</b><br>`, 'ebebeb');
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
