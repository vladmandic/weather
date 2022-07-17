import { log } from './log';
import { cors } from './cors';

export async function updateAQI(lat: number, lon: number, apiKey) {
  const div = document.getElementById('weather-aqi');
  if (!div) return;
  const aqi = await cors(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`);
  log('updateAQI', { lat, lon, aqi });

  const code = (v) => {
    if (v > 300) return `<span style="background: #7e0023; padding: 2px">${v} - Hazardous</span>`;
    if (v > 200) return `<span style="background: #660099; padding: 2px">${v} - Very Unhealthy</span>`;
    if (v > 150) return `<span style="background: #cc0033; padding: 2px">${v} - Unhealthy</span>`;
    if (v > 100) return `<span style="background: #ff9933; padding: 2px">${v} - Moderatly Unhealthy</span>`;
    if (v > 50) return `<span style="background: #ffde33; padding: 2px">${v} - Moderate</span>`;
    return `<span style="background: #009966; padding: 2px">${v} - Good</span>`;
  };

  let text = `<span style="font-size: 1.4rem">Air Quality Index ${code(aqi.data.aqi)}</span><br>`;
  for (const data of Object.entries(aqi.data.iaqi)) {
    // @ts-ignore
    text += ` | ${data[0]} ${data[1].v}`.toUpperCase();
  }
  text += ' |';
  div.innerHTML = text;
}

class ComponentAQI extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div style="width: fit-content">
        <div id="weather-aqi" style="margin: 30px 0 20px 0; text-align: center; line-height: 2rem"></div>
      </div>
    `;
  }
}

customElements.define('component-aqi', ComponentAQI);
