import { log } from './log';

export async function findLocation(name: string, apiKey: string) {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&address=${name}`);
  if (res && res.ok) {
    const json = await res.json();
    log('findLocation', json);
    if (json.results && json.results[0]) {
      return {
        name: json.results[0].formatted_address,
        lat: json.results[0].geometry.location.lat,
        lon: json.results[0].geometry.location.lng,
      };
    }
  } else {
    log('findLocation', res.status, res.statusText);
  }
  return {};
}

export async function findAddress(lat: number, lon: number, apiKey: string) {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`);
  let address = '';
  if (res && res.ok) {
    const json = await res.json();
    const loc = json.results ? json.results.filter((r) => (r.types.includes('locality') || r.types.includes('neighborhood'))) : [];
    const adr1 = loc[0].address_components.map((r) => r.short_name);
    const adr2 = [...new Set(adr1)];
    address = adr2.join(', ');
    log('findAddress', json, address);
  } else {
    log('findAddress error', res.status, res.statusText);
  }
  return address;
}

export async function getLocation(): Promise<{lat: number, lon: number}> {
  if (!navigator.geolocation) {
    log('getLocation denied');
    return { lat: 0, lon: 0 };
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => { // eslint-disable-line no-undef
        log('getLocation', position);
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      (error: GeolocationPositionError) => { // eslint-disable-line no-undef
        log('getLocation error', error);
        resolve({ lat: 0, lon: 0 });
      },
    );
  });
}

export function updateAddress(address: string) {
  log('updateAddress');
  const collection = document.getElementsByTagName('component-address');
  for (let i = 0; i < collection.length; i++) {
    collection[i].setAttribute('address', address);
  }
}

class ComponentAddress extends HTMLElement { // watch for attributes
  static get observedAttributes() { return ['address']; }

  connectedCallback() { // triggered on insert
    this.innerHTML = '';
  }

  attributeChangedCallback(name, _oldValue, newValue) { // triggered on attribute change
    if (name !== 'address') return;
    this.innerHTML = `
      <div style="margin: 8px">${newValue}</div>
    `;
  }
}

customElements.define('component-address', ComponentAddress);
