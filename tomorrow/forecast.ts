import * as queryString from 'query-string';
import { log } from './log';
import type { Data } from './types';

export const options = {
  url: 'https://api.tomorrow.io/v4/timelines',
  fields: [
    'temperatureMin',
    'temperatureMax',
    'temperatureAvg',
    'temperatureMinTime',
    'temperatureMaxTime',
    'temperatureApparent',
    'dewPoint',
    'humidity',
    'windSpeed',
    'windGust',
    'windDirection',
    'pressureSurfaceLevel',
    'pressureSeaLevel',
    'precipitationIntensity',
    'precipitationType',
    'precipitationProbability',
    'sunriseTime',
    'sunsetTime',
    'visibility',
    'cloudCover',
    'cloudBase',
    'cloudCeiling',
    'moonPhase',
    'uvIndex',
    'weatherCodeFullDay',
    'weatherCodeDay',
    'weatherCodeNight',
    'weatherCode',
  ],
  units: 'imperial',
  // timesteps: ['current', '1m', '5m', '15m', '30m', '1h', '1d'],
  timesteps: ['current', '15m', '1h', '1d'],
};

export async function getForecast(lat: number, lon: number, apikey: string) {
  let data: Data[] = [];
  const getTimelineParameters = queryString.stringify({
    apikey,
    location: [lat, lon],
    fields: options.fields,
    units: options.units,
    timesteps: options.timesteps,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    // startTime: moment.utc(now).add(0, 'minutes').toISOString(),
    // endTime: moment.utc(now).add(5, 'days').toISOString(),
  }, { arrayFormat: 'comma' });
  const res = await fetch(options.url + '?' + getTimelineParameters);
  if (res) {
    const rateLimits: Record<string, number> = {};
    // @ts-ignore
    for (const [key, val] of res.headers.entries()) {
      if (key === 'x-ratelimit-limit-day') rateLimits.dayTotal = parseInt(val);
      if (key === 'x-ratelimit-limit-hour') rateLimits.hourTotal = parseInt(val);
      if (key === 'x-ratelimit-remaining-day') rateLimits.dayRemaining = parseInt(val);
      if (key === 'x-ratelimit-remaining-hour') rateLimits.hourRemaining = parseInt(val);
    }
    log('weather response:', rateLimits);
  }
  if (res && res.ok) {
    const results = await res.json();
    if (results && results.data && results.data.timelines) data = results.data.timelines;
    log('weather data:', results, data);
  } else {
    log('weather data error:', res.status, res.statusText);
  }
  return data;
}