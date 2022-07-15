import * as L from 'leaflet';
import { log } from './log';

export async function getMap(lat: number, lon: number, apikey: string) {
  let div = document.getElementById('map') as HTMLDivElement;
  if (!div) {
    log('create element: map');
    div = document.createElement('div');
    div.id = 'map';
    document.body.append(div);
  }
  log('upodate element: map');
  const map = new L.Map(div, {
    center: new L.LatLng(lat, lon),
    zoom: 8,
    attributionControl: false,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);
  const timeStamp = (new Date()).toISOString();
  L.tileLayer(`https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/precipitationIntensity/${timeStamp}.png?apikey=${apikey}`, {}).addTo(map);
}
