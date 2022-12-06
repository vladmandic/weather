import { log } from './log';
import { update } from './update';

export class units {
  static possible = ['eu', 'us', 'uk', 'si'];
  public static units = localStorage?.getItem('units') || 'eu';

  static get current() {
    if (units.units === 'uk') return 'uk2';
    if (units.units === 'eu') return 'ca';
    return units.units;
  }

  static get speed() {
    if (units.units === 'us' || units.units === 'uk') return 'mph';
    if (units.units === 'si') return 'm/s';
    return 'kph';
  }

  static get temp() {
    if (units.units === 'us') return 'f';
    return 'c';
  }

  static get distance() {
    if (units.units === 'us' || units.units === 'uk') return 'mi';
    return 'km';
  }

  static get pressure() {
    if (units.units === 'us' || units.units === 'uk') return 'mb';
    return 'hpa';
  }

  static get precip() {
    if (units.units === 'us' || units.units === 'uk') return 'in';
    return 'cm';
  }
}

class ComponentUnits extends HTMLElement {
  div: HTMLDivElement = document.createElement('div');

  rotate() {
    let idx = units.possible.indexOf(units.units);
    idx = ++idx % units.possible.length;
    units.units = units.possible[idx];
    this.div.textContent = units.units.toLocaleUpperCase();
    log('switchUnits', { idx, units: units.units });
    if (localStorage) localStorage.setItem('units', units.units);
    update();
  }

  connectedCallback() {
    this.div.style.cssText = 'position: fixed; bottom: 0; right: 0; padding-left: 4px; padding-right: 4px; color: black; background: beige; font-weight: 800; font-size: 0.8rem; font-family: monospace; line-height: 4rem; z-index: 100';
    this.div.textContent = units.units.toLocaleUpperCase();
    this.appendChild(this.div);
    this.onclick = () => this.rotate();
    this.title = 'possible units: eu, us, uk, si';
  }
}

customElements.define('component-units', ComponentUnits);

/*
  us: Imperial units (the default)
  si: SI units
  ca: same as si, except that windSpeed and windGust are in kilometers per hour
  uk2: same as si, except that nearestStormDistance and visibility are in miles, and windSpeed and windGust in miles per hour

  si:
  summary: Any summaries containing temperature or snow accumulation units will have their values in degrees Celsius or in centimeters (respectively).
  nearestStormDistance: Kilometers.
  precipIntensity: Millimeters per hour.
  precipIntensityMax: Millimeters per hour.
  precipAccumulation: Centimeters.
  temperature: Degrees Celsius.
  temperatureMin: Degrees Celsius.
  temperatureMax: Degrees Celsius.
  apparentTemperature: Degrees Celsius.
  dewPoint: Degrees Celsius.
  windSpeed: Meters per second.
  windGust: Meters per second.
  pressure: Hectopascals.
  visibility: Kilometers.
*/
