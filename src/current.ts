import { DateTime } from 'luxon';
import { log } from './log';
import { metric, imperial, weatherCode, uvIndex } from './enums';
import { options } from './forecast';
import type { Value, Interval } from './types';

const maxEntries = 20;

export function getDirection(val: number) {
  let d = '';
  if (val < 360) d = 'north';
  if (val < 315 + 22.5) d = 'northwest';
  if (val < 270 + 22.5) d = 'west';
  if (val < 225 + 22.5) d = 'southwest';
  if (val < 180 + 22.5) d = 'south';
  if (val < 135 + 22.5) d = 'southeast';
  if (val < 90 + 22.5) d = 'east';
  if (val < 45 + 22.5) d = 'northeast';
  if (val < 22.5) d = 'north';
  return d;
}

export async function printCurrent(val: Value) {
  log('current data:', val);
  const div = document.getElementById('current') as HTMLDivElement;

  log('upodate element: current');
  const units = options.units === 'metric' ? metric : imperial;
  const cloudsData = val.cloudBase ? `(${val.cloudBase}${units.cloudBase} - ${val.cloudCeiling}${units.cloudCeiling})` : '';
  const precipitationData = val.precipitationIntensity === 0 && val.precipitationProbability === 0 ? 'none' : `${units.precipitationType[val.precipitationType]} change ${val.precipitationProbability}% ${val.precipitationIntensity}${units.precipitationIntensity}<br>`;
  div.innerHTML = `
    Current<br>
    ${weatherCode[val.weatherCode]}<br>
    temperature ${val.temperatureAvg}° feels like ${Math.round(val.temperatureApparent)}°<br>
    precipitation ${precipitationData}<br>
    cloud cover ${val.cloudCover}% ${cloudsData}<br>
    humidity ${val.humidity}% dew point ${Math.trunc(val.dewPoint)}°<br>
    wind ${val.windSpeed}${units.windSpeed} gusts ${val.windGust}${units.windGust} ${getDirection(val.windDirection)} ${Math.round(val.windDirection)}°<br>
    uv index ${val.uvIndex} ${uvIndex[val.uvIndex]}<br>
    visibility ${val.visibility}${units.visibility}<br>
    pressure ${val.pressureSeaLevel}${units.pressureSeaLevel} sea ${val.pressureSurfaceLevel}${units.pressureSurfaceLevel} surface
  `;
}

export async function printForecast(name: string, data: Interval[]) {
  const div = document.getElementById('forecast') as HTMLDivElement;
  const id = `forecast-${name}`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    div.appendChild(el);
  }
  log('upodate forecast:', name);
  const changes: Array<{ code: string, time: DateTime, temp: number, tempFeels: number, tempMin: number, tempMax: number }> = [];
  const filterCode = (code: number) => weatherCode[code].replace('Mostly', '').replace('Partly', '').replace('Clear, ', '').trim();
  for (const entry of data) {
    if (filterCode(entry.values.weatherCode) !== changes[changes.length - 1]?.code) {
      changes.push({
        code: filterCode(entry.values.weatherCode),
        time: DateTime.fromISO(entry.startTime),
        temp: entry.values.temperatureAvg,
        tempFeels: entry.values.temperatureApparent,
        tempMin: entry.values.temperatureMin,
        tempMax: entry.values.temperatureMax,
      });
    }
  }
  log('weather changes:', changes);
  if (changes.length > maxEntries) changes.length = maxEntries;
  const changesStr: Array<string> = [];
  for (const val of changes) {
    let ts = '';
    if (name.includes('d')) ts = val.time.toFormat('ccc LL/dd');
    else if (name.includes('h')) ts = val.time.toFormat('ccc HH');
    else if (name.includes('m')) ts = val.time.toFormat('HH:mm');
    const temp = `temperature ${val.temp}° feels like ${Math.round(val.tempFeels)}°` + (name.includes('d') ? ` min ${Math.round(val.tempMin)}° max ${Math.round(val.tempMax)}°` : '');
    changesStr.push(`${val.code} at ${ts} ${temp}`);
  }
  const forecastName = name.includes('m') ? 'by Minute' : (name.includes('h') ? 'by Hour' : 'Daily');
  el.innerHTML = `
    Forecast ${forecastName}<br>
    ${changesStr.join('<br>')}
  `;
}

/**
moonPhase: 4
sunriseTime: "2022-07-14T10:44:00Z"
sunsetTime: "2022-07-15T00:08:00Z"
*/
