import { DateTime } from 'luxon';
import { log } from './log';

function color(severity: string) {
  switch (severity.toLowerCase()) {
    case 'advistory': return 'yellowgreen';
    case 'watch': return 'coral';
    case 'warning': return 'darkred';
    default: return 'beige';
  }
}

export function updateAlerts(data) {
  log('updateAlerts', { alerts: data.alerts });
  const divAlerts = document.getElementById('component-alerts');
  if (!divAlerts) return;
  let html = '';
  if (data?.alerts) {
    html += '<span style="font-size: 1.8rem">Alerts</span><br><br>';
    for (const alert of data.alerts) {
      html += `
      <div style="text-align: justify" title="${JSON.stringify(alert, null, 2).replace(/{|}|"|,/g, '').replace('  ', ' ')}">
        <a href="${alert.uri}" target="_blank">
          <span style="color: bisque; -webkit-box-decoration-break: clone">▪ ${DateTime.fromSeconds(alert.time).toFormat('ccc LLL d T')} to ${DateTime.fromSeconds(alert.expires).toFormat('ccc LLL d T')}</span>
          <span style="padding: 2px; background: ${color(alert.severity)}"> ${alert.severity}</span><br>
          <span style="color: beige; -webkit-box-decoration-break: clone; margin-left: 10px">for ${alert.regions.join(', ')}</span><br>
          <span style="margin-left: 10px; -webkit-box-decoration-break: clone; font-weight: bold">${alert.title}</span><br>
          <div style="margin-left: 10px; max-height: 3.8rem; overflow-y: auto; -webkit-box-decoration-break: clone">${alert.description.toLowerCase()}</div>
        </a>
      </div>
    `;
    }
  }
  divAlerts.innerHTML = html;
}

class ComponentAlerts extends HTMLElement { // watch for attributes
  static get observedAttributes() { return ['loc']; }

  connectedCallback() { // triggered on insert
    this.innerHTML = '<div class="component-alerts" id="component-alerts"></div>';
  }
}

customElements.define('component-alerts', ComponentAlerts);
