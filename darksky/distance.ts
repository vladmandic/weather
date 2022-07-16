import { log } from './log';

export function updateLocation(lat, lon, distance) {
  log('updateLocation', { lat, lon, distance });
  const collection = document.getElementsByTagName('component-location');
  for (let i = 0; i < collection.length; i++) {
    collection[i].setAttribute('loc', `${lat},${lon},${distance}`);
  }
}

class ComponentLocation extends HTMLElement { // watch for attributes
  static get observedAttributes() { return ['loc']; }

  connectedCallback() { // triggered on insert
    this.innerHTML = '';
  }

  attributeChangedCallback(name, _oldValue, newValue) { // triggered on attribute change
    if (name !== 'loc') return;
    const [lat, lon, distance] = newValue.split(',');
    this.innerHTML = `
      <div style="margin: 20px 0 0 0">
        ${Math.round(1000 * lat) / 1000}°, ${Math.round(1000 * lon) / 1000}° nearest station ${distance !== 'Infinity' ? distance + 'mi' : 'N/A'}
      </div>
    `;
  }
}

customElements.define('component-location', ComponentLocation);
