import { DateTime } from 'luxon';
import { log } from './log';

export function updateAlerts(data) {
  log('updateAlerts', { alerts: data.alerts });
  const divAlerts = document.getElementById('component-alerts');
  if (!divAlerts) return;
  let text = '';
  if (data.alerts) {
    text += '<span style="font-size: 1.8rem">Alerts</span><br>';
    for (const alert of data.alerts) {
      text += `
      <div style="text-align: left" title="${JSON.stringify(alert, null, 2).replace(/{|}|"|,/g, '').replace('  ', ' ')}">
        <a href="${alert.uri}">
          <span style="color: bisque; -webkit-box-decoration-break: clone">▪ ${DateTime.fromSeconds(alert.time).toFormat('ccc LLL d T')} to ${DateTime.fromSeconds(alert.expires).toFormat('ccc LLL d T')} ${alert.severity}</span><br>
          <span style="color: beige; -webkit-box-decoration-break: clone; margin-left: 10px">for ${alert.regions.join(', ')}</span><br>
          <span style="margin-left: 10px; -webkit-box-decoration-break: clone; font-weight: bold">${alert.title}</span><br>
          <span style="margin-left: 10px; -webkit-box-decoration-break: clone">${alert.description.toLowerCase()}</span>
        </a>
      </div>
    `;
    }
  }
  divAlerts.innerHTML = text;
}

class ComponentAlerts extends HTMLElement { // watch for attributes
  static get observedAttributes() { return ['loc']; }

  connectedCallback() { // triggered on insert
    this.innerHTML = '<div class="component-alerts" id="component-alerts"></div>';
  }
}

customElements.define('component-alerts', ComponentAlerts);
