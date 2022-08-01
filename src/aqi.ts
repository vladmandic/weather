import { log } from './log';
import { cors } from './cors';

export async function updateAQI(lat: number, lon: number, apiKey) {
  const div = document.getElementById('weather-aqi');
  if (!div) return;
  const aqi = await cors(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`);
  log('updateAQI', { lat, lon, aqi });

  const code = (v) => {
    if (v > 300) return `<span style="background: purple; padding: 2px">${v} - Hazardous</span>`;
    if (v > 200) return `<span style="background: maroon; padding: 2px">${v} - Very Unhealthy</span>`;
    if (v > 150) return `<span style="background: darkred; padding: 2px">${v} - Unhealthy</span>`;
    if (v > 100) return `<span style="background: coral; padding: 2px">${v} - Moderatly Unhealthy</span>`;
    if (v > 50) return `<span style="background: yellowgreen; padding: 2px">${v} - Moderate</span>`;
    return `<span style="background: darkgreen; padding: 0px 8px 1px 8px">${v} - Good</span>`;
  };

  let title = aqi.data.attributions?.[0].name || '';
  title += '\n' + (aqi.data?.city?.name || '');
  let text = `<span style="font-size: 1.4rem; color: beige" title="${title}">Air Quality Index ${code(aqi.data.aqi)}</span><br>`;

  text += '<span style="margin-right: 20px">';
  for (const [key, val] of Object.entries(aqi.data.iaqi)) {
    if (key === 'co') text += `<span title="Carbon Monoxide" style="margin-right: 20px">${key} <span style="color: beige">${(val as { v: number }).v}</span></span>`;
    if (key === 'no2') text += `<span title="Nitrogen Dioxide" style="margin-right: 20px">${key} <span style="color: beige">${(val as { v: number }).v}</span></span>`;
    if (key === 'so2') text += `<span title="Sulfur Dioxide" style="margin-right: 20px">${key} <span style="color: beige">${(val as { v: number }).v}</span></span>`;
    if (key === 'o3') text += `<span title="Ground-level Ozone" style="margin-right: 20px">${key} <span style="color: beige">${(val as { v: number }).v}</span></span>`;
    if (key === 'pm10') text += `<span title="Particulates < 10 microns" style="margin-right: 20px">${key} <span style="color: beige">${(val as { v: number }).v}</span></span>`;
    if (key === 'pm25') text += `<span title="Particulates < 2.5 microns" style="margin-right: 20px">${key} <span style="color: beige">${(val as { v: number }).v}</span></span>`;
  }
  text += '</span>';
  div.innerHTML = text;
}

class ComponentAQI extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div style="width: fit-content">
        <div id="weather-aqi" style="margin: 40px 0 20px 0; text-align: center; line-height: 1.6rem"></div>
      </div>
    `;
  }
}

customElements.define('component-aqi', ComponentAQI);
