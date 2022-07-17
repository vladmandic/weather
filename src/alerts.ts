import { DateTime } from 'luxon';
import { log } from './log';

export function updateAlerts(data) {
  log('updateAlerts', { alerts: data.alerts });
  const divAlerts = document.getElementById('weather-alerts');
  if (!divAlerts) return;
  let text = '';
  if (data.alerts) {
    text += '<span style="font-size: 1.8rem">Alerts</span><br>';
    for (const alert of data.alerts) {
      text += `
      <div style="text-align: left">
        ▪ from ${DateTime.fromSeconds(alert.time).toFormat('ccc LLL d T')} to ${DateTime.fromSeconds(alert.expires).toFormat('ccc LLL d T')} ${alert.severity} for ${alert.regions.join(', ')}<br>
        &nbsp ${alert.title} - ${alert.description}
      </div>
    `;
    }
  }
  divAlerts.innerHTML = text;
}

class ComponentAlerts extends HTMLElement { // watch for attributes
  static get observedAttributes() { return ['loc']; }

  connectedCallback() { // triggered on insert
    this.innerHTML = '<div class=alerts" id="weather-alerts" style="margin-top: 20px; width: 800px; overflow-wrap: "></div>';
  }
}

customElements.define('component-alerts', ComponentAlerts);
