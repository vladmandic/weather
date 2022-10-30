import { log } from './log';
import { cors } from './cors';
import { escape } from './xss';

export async function updateAQI(lat: number, lon: number, apiKey) {
  const div = document.getElementById('component-aqi');
  if (!div) return;
  if (apiKey === '') return;
  const aqi = await cors(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`, false);
  log('updateAQI', { lat, lon, aqi });
  if (!aqi.data?.city) return;

  const code = (v) => {
    if (v > 300) return `<span style="color: white; background: purple; padding: 2px">${v} - hazardous</span>`;
    if (v > 200) return `<span style="color: white; background: maroon; padding: 2px">${v} - very Unhealthy</span>`;
    if (v > 150) return `<span style="color: white; background: darkred; padding: 2px">${v} - unhealthy</span>`;
    if (v > 100) return `<span style="color: white; background: coral; padding: 2px">${v} - moderatly unhealthy</span>`;
    if (v > 50) return `<span style="color: white; background: yellowgreen; padding: 2px">${v} - moderate</span>`;
    if (v > 0) return `<span style="color: white; background: darkgreen; padding: 0px 8px 1px 8px">${v} - good</span>`;
    return '<span style="color: white; background: maroon; padding: 2px">error</span>';
  };

  const title = escape(`${aqi.data.attributions?.[0].name || ''}\n${(aqi.data?.city?.name || '')}`);
  let html = `<span style="font-size: 1.4rem" title="${title}"><a href="https://en.wikipedia.org/wiki/Air_quality_index">air quality index</a> ${code(aqi.data.aqi)}</span><br>`;

  html += '<span style="margin-right: 20px">';
  for (const [key, val] of Object.entries(aqi?.data?.iaqi || {})) {
    const v = escape((val as { v: number }).v);
    if (key === 'co') html += `<span title="Carbon Monoxide" style="margin-right: 20px">CO <span style="color: white">${v}</span></span>`;
    if (key === 'no2') html += `<span title="Nitrogen Dioxide" style="margin-right: 20px">NO<span style="font-size: 0.5rem">2</span> <span style="color: white">${v}</span></span>`;
    if (key === 'so2') html += `<span title="Sulfur Dioxide" style="margin-right: 20px">SO<span style="font-size: 0.5rem">2</span> <span style="color: white">${v}</span></span>`;
    if (key === 'o3') html += `<span title="Ground-level Ozone" style="margin-right: 20px">O<span style="font-size: 0.5rem">3</span> <span style="color: white">${v}</span></span>`;
    if (key === 'pm10') html += `<span title="Particulates < 10 microns" style="margin-right: 20px">PM<span style="font-size: 0.5rem">10.0</span> <span style="color: white">${v}</span></span>`;
    if (key === 'pm25') html += `<span title="Particulates < 2.5 microns" style="margin-right: 20px">PM<span style="font-size: 0.5rem">2.5</span> <span style="color: white">${v}</span></span>`;
  }
  html += '</span>';
  div.innerHTML = html;
}

class ComponentAQI extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="component-aqi" style="margin: 40px 0 20px 0; text-align: center; line-height: 1.6rem; color: beige"></div>
    `;
  }
}

customElements.define('component-aqi', ComponentAQI);
