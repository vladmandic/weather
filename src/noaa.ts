// https://nowcoast.noaa.gov/help/#!section=rest-usage

import { log } from './log';

const map = {
  server: 'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast',
  services: ['obs_meteocean_insitu_sfc_time', 'obs_meteoceanhydro_insitu_pts_geolinks'], // 'analysis_meteohydro_sfc_rtma_time', 'analysis_ocean_sfc_sst_time', 'guidance_model_coastalocean_estofs_time', 'guidance_model_ocean_grtofs_time'],
  options: 'MapServer/identify?f=json&tolerance=1000&imageDisplay=1000,1000,96&layers=visible:1',
  geometry: '',
  mapExtent: '',
};

type OceanData = {
  service: string,
  provider: string,
  station: string,
  location: [number, number],
  distance: number,
  seatemp: number,
  attributes: Record<string, unknown>,
};

const gpsToWebMercator = (lat, lon) => {
  const num = lon * 0.017453292519943295;
  const x = 6378137.0 * num;
  const a = lat * 0.017453292519943295;
  const y = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
  return [x, y];
};

function getDistance(lat1, lon1, lat2, lon2) { // calculating distance using Vincenty Formula
  const toRad = (value) => value * Math.PI / 180;
  const a = 6378137; const b = 6356752.314245;
  const f = 1 / 298.257223563;
  const L = toRad(lon2 - lon1);
  const U1 = Math.atan((1 - f) * Math.tan(toRad(lat1)));
  const U2 = Math.atan((1 - f) * Math.tan(toRad(lat2)));
  const sinU1 = Math.sin(U1);
  const cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2);
  const cosU2 = Math.cos(U2);
  let lambda = L; let lambdaP;
  let iterLimit = 100;
  let cosSqAlpha = 0;
  let sinSigma = 0;
  let cosSigma = 0;
  let cos2SigmaM = 0;
  let sigma = 0;
  do {
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
    if (sinSigma === 0) return 0;
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    const sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
    cosSqAlpha = 1 - sinAlpha * sinAlpha;
    cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
    if (Number.isNaN(cos2SigmaM)) cos2SigmaM = 0;
    const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    lambdaP = lambda;
    lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);
  if (iterLimit === 0) return Number.NaN;
  const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
  const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
  const s = b * A * (sigma - deltaSigma);
  return s;
}

export async function updateNOAA(lat: number, lon: number) {
  map.geometry = `geometry=${gpsToWebMercator(lat, lon).join(',')}`;
  map.mapExtent = `mapExtent=${gpsToWebMercator(lat - 1, lon - 1).join(',')},${gpsToWebMercator(lat + 1, lon + 1).join(',')}`;
  const data: OceanData[] = [];
  for (const service of map.services) {
    const url = `${map.server}/${service}/${map.options}&${map.geometry}&${map.mapExtent}`;
    const res = await fetch(url);
    if (!res || !res.ok) continue;
    const json = await res.json();
    for (const entry of json?.results || []) {
      const location: [number, number] = [Number(entry?.attributes?.clat || entry?.attributes?.LATITUDE), Number(entry?.attributes?.clon || entry?.attributes?.LONGITUDE)];
      data.push({
        service,
        provider: entry.attributes.provider as string,
        station: entry?.attributes?.stsn || entry?.attributes?.ID,
        location,
        distance: Math.round(getDistance(lat, lon, location[0], location[1])),
        seatemp: Number(entry?.attributes?.sst1_f || 0),
        attributes: entry?.attributes,
      });
    }
  }
  data.sort((a, b) => a.distance - b.distance);
  const seaTemp = data?.find((d) => d.seatemp > 0)?.seatemp;
  log('updateNOAA', { data, seaTemp });
}
