import { log } from './log';

export async function printLocation(name: string) {
  let div = document.getElementById('location') as HTMLDivElement;
  if (!div) {
    div = document.createElement('div');
    div.id = 'location';
    (document.getElementById('header') as HTMLDivElement).append(div);
  }
  log('upodate element: location');
  div.innerHTML = name;
}

export async function findLocation(name: string, apiKey: string) {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&address=${name}`);
  if (res && res.ok) {
    const json = await res.json();
    log('google location data:', json);
    if (json.results && json.results[0]) {
      return {
        name: json.results[0].formatted_address,
        lat: json.results[0].geometry.location.lat,
        lon: json.results[0].geometry.location.lng,
      };
    }
  } else {
    log('google location error:', res.status, res.statusText);
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
    log('google address data:', json, address);
  } else {
    log('google location error:', res.status, res.statusText);
  }
  return address;
}

export async function getLocation(): Promise<{lat: number, lon: number}> {
  if (!navigator.geolocation) {
    log('no access to geolocation');
    return { lat: 0, lon: 0 };
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => { // eslint-disable-line no-undef
        log('geolocation position:', position);
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      (error: GeolocationPositionError) => { // eslint-disable-line no-undef
        log('geolocation error:', error);
        resolve({ lat: 0, lon: 0 });
      },
    );
  });
}
