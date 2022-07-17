import { log } from './log';

export type Loc = { lat: number, lon: number, name: string }

export async function findLocation(name: string, apiKey: string): Promise<Loc> {
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
  return { lat: 0, lon: 0, name: '' };
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

export async function getLocation(): Promise<Loc> {
  if (!navigator.geolocation) {
    log('getLocation denied');
    return { lat: 0, lon: 0, name: '' };
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => { // eslint-disable-line no-undef
        log('getLocation', position);
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude, name: '' });
      },
      (error: GeolocationPositionError) => { // eslint-disable-line no-undef
        log('getLocation error', error);
        resolve({ lat: 0, lon: 0, name: '' });
      },
    );
  });
}

export function updateAddress(address: string) {
  log('updateAddress', address);
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
      <div style="margin: 20px 0 0 0; font-size: 2rem">${newValue}</div>
    `;
  }
}

customElements.define('component-address', ComponentAddress);
