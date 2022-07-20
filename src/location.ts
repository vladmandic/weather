import { log } from './log';

export type Location = { lat: number, lon: number, accuracy: number, name: string }

export async function findByAddress(name: string, apiKey: string): Promise<Location> {
  let rec = { name: '', lat: 0, lon: 0, accuracy: 0 };
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&address=${name}`);
  if (res && res.ok) {
    const json = await res.json();
    log('findByAddress', json);
    if (json.results && json.results[0]) {
      rec = {
        name: json.results[0].formatted_address,
        lat: json.results[0].geometry.location.lat,
        lon: json.results[0].geometry.location.lng,
        accuracy: 0,
      };
    }
  } else {
    log('findByAddress', res.status, res.statusText);
  }
  return rec;
}

export async function findByLocation(lat: number, lon: number, apiKey: string) {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`);
  let address = '';
  if (res && res.ok) {
    const json = await res.json();
    const loc = json.results ? json.results.filter((r) => (r.types.includes('locality') || r.types.includes('neighborhood'))) : [];
    const adr1 = loc[0].address_components.map((r) => r.short_name);
    const adr2 = [...new Set(adr1)];
    address = adr2.join(', ');
    log('findByLocation', json, address);
  } else {
    log('findByLocation error', res.status, res.statusText);
  }
  return address;
}

export async function getGPSLocation(): Promise<Location> {
  if (!navigator.geolocation) {
    log('getGPSLocation denied');
    return { lat: 0, lon: 0, accuracy: 0, name: '' };
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => { // eslint-disable-line no-undef
        log('getGPSLocation', position);
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude, name: '', accuracy: position.coords.accuracy });
      },
      (error: GeolocationPositionError) => { // eslint-disable-line no-undef
        log('getGPSLocation error', error);
        resolve({ lat: 0, lon: 0, name: '', accuracy: 0 });
      },
    );
  });
}

export async function getIPLocation(apiKey: string): Promise<Location> {
  let res = await fetch('https://api.ipify.org?format=json');
  const json = await res.json();
  const ip = json.ip;
  res = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
    method: 'POST',
    body: JSON.stringify({ considerIp: true }),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  const rec = { ip, accuracy: data.accuracy, lat: data.location.lat, lon: data.location.lng, name: '' };
  log('getIPLocation', rec);
  return rec;
}

export function updateAddress(address: string) {
  log('updateAddress', { address });
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
      <div style="margin: 20px 0 0 0; font-size: 2rem; color: beige">${newValue}</div>
    `;
  }
}

customElements.define('component-address', ComponentAddress);
