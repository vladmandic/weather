import { DateTime } from 'luxon';
import { log } from './log';

export function updateDistance(lat, lon, distance) {
  const collection = document.getElementsByTagName('component-distance');
  for (let i = 0; i < collection.length; i++) {
    collection[i].setAttribute('loc', `${lat},${lon},${distance}`);
  }
}

class ComponentDistance extends HTMLElement { // watch for attributes
  static get observedAttributes() { return ['loc']; }

  attributeChangedCallback(name, _oldValue, newValue) { // triggered on attribute change
    if (name !== 'loc') return;
    const [lat, lon, distance] = newValue.split(',');
    log('updateLocation', { lat, lon, distance });
    this.innerHTML = `
      <div style="margin: 20px 0 0 0; color: beige">
        ${DateTime.now().toLocaleString(DateTime.DATETIME_HUGE)}<br>
        ${Math.round(1000 * lat) / 1000}°, ${Math.round(1000 * lon) / 1000}° nearest station ${distance !== 'Infinity' ? distance + 'mi' : 'N/A'}
      </div>
    `;
  }

  connectedCallback() { // triggered on insert
    this.innerHTML = '';
  }
}

customElements.define('component-distance', ComponentDistance);
