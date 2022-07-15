import { log } from './log';
import { tomorrow } from './options';
import { metric, imperial, weatherCode, uvIndex } from './enums';
import type { Data, Value } from './types';

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

export async function printCurrent(allData: Data[]) {
  const data = allData.find((entry) => entry.timestep === 'current') as Data;
  if (!data || !data.intervals) {
    log('missing current data');
    return;
  }
  const val: Value = data.intervals[0].values;
  log('current data:', val);

  let div = document.getElementById('current') as HTMLDivElement;
  if (!div) {
    log('create element: current');
    div = document.createElement('div');
    div.id = 'current';
    document.body.append(div);
  }
  log('upodate element: current');
  const units = tomorrow.units === 'metric' ? metric : imperial;
  const cloudsData = val.cloudBase ? `(${val.cloudBase}${units.cloudBase} - ${val.cloudCeiling}${units.cloudCeiling})` : '';
  const precipitationData = val.precipitationIntensity === 0 && val.precipitationProbability === 0 ? 'none' : `${units.precipitationType[val.precipitationType]} change ${val.precipitationProbability}% ${val.precipitationIntensity}${units.precipitationIntensity}<br>`;
  div.innerHTML = `
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

/**
moonPhase: 4
sunriseTime: "2022-07-14T10:44:00Z"
sunsetTime: "2022-07-15T00:08:00Z"
*/
