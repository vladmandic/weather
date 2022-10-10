import { log } from './log';
import { keys } from './secrets';
import { updateGPSInfo } from './info'; // eslint-disable-line import/no-cycle
import { update } from './update'; // eslint-disable-line import/no-cycle
import { cors } from './cors';

export type Location = { lat: number, lon: number, accuracy: number, name: string }

export async function findByAddress(name: string, apiKey: string): Promise<Location> {
  let rec = { name: '', lat: 0, lon: 0, accuracy: 0 };
  if (apiKey === '') return rec;
  const json = await cors(`https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&address=${name}`, false);
  log('findByAddress', json);
  if (json.results && json.results[0]) {
    rec = {
      name: json.results[0].formatted_address,
      lat: json.results[0].geometry.location.lat,
      lon: json.results[0].geometry.location.lng,
      accuracy: 0,
    };
  } else {
    log('findByAddress failed');
  }
  return rec;
}

export async function findByLocation(lat: number, lon: number, apiKey: string) {
  let address = '';
  if (apiKey === '') return address;
  const json = await cors(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`, false);
  if (json.results) {
    const loc = json.results ? json.results.filter((r) => (r.types.includes('locality') || r.types.includes('neighborhood'))) : [];
    if (loc.length > 0) {
      const adr1 = loc[0].address_components.map((r) => r.short_name);
      const adr2 = [...new Set(adr1)];
      address = adr2.join(', ');
    }
    log('findByLocation', json, address);
  } else {
    log('findByLocation failed');
  }
  return address;
}

export async function getGPSLocation(): Promise<Location> {
  const empty = { lat: 0, lon: 0, accuracy: 0, name: '' };
  if (!navigator.geolocation) {
    log('getGPSLocation denied');
    return empty;
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      log('getGPSLocation timeout');
      resolve(empty);
    }, 10000);
    try {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => { // eslint-disable-line no-undef
          log('getGPSLocation', position);
          resolve({ lat: position.coords.latitude, lon: position.coords.longitude, name: '', accuracy: position.coords.accuracy });
        },
        (error: GeolocationPositionError) => { // eslint-disable-line no-undef
          log('getGPSLocation error', error);
          resolve(empty);
        },
      );
    } catch (err) {
      log('getGPSLocation exception', err);
      resolve(empty);
    }
  });
}

export async function getIPLocation(apiKey: string): Promise<Location> {
  const json = await cors('https://api.ipify.org?format=json', false);
  const ip = json.ip;
  let rec = { ip, accuracy: 0, lat: 25.76, lon: -80.19, name: '' }; // default to my neighbourhood
  if (apiKey === '') return rec;
  const res = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
    method: 'POST',
    body: JSON.stringify({ considerIp: true }),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  rec = { ip, accuracy: data?.accuracy || rec.accuracy, lat: data?.location?.lat || rec.lat, lon: data?.location?.lng || rec.lon, name: '' };
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
      <div id="weather-info-text" title="click to detect gps location" style="margin: 20px 0 0 0; font-size: 2rem; color: beige">${newValue}</div>
    `;
    const text = document.getElementById('weather-info-text') as HTMLDivElement; // register refresh on click
    text.onclick = async () => {
      text.innerHTML = 'detecting gps location';
      const locGPS = await getGPSLocation();
      if (locGPS.lat !== 0) {
        locGPS.name = await findByLocation(locGPS.lat, locGPS.lon, keys.google);
        updateGPSInfo(locGPS);
        update(locGPS);
      } else {
        text.innerHTML = 'gps location failed';
      }
    };
  }
}

customElements.define('component-address', ComponentAddress);
