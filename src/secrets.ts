import { log } from './log';

export class keys {
  public static tomorrow = '';
  public static google = '';
  public static darksky = '';
  public static aqicn = '';

  public static async init() {
    // first try secrets file
    const res = await fetch('../secrets.json');
    if (res?.ok) {
      const json = await res.json();
      log('secrets', { json });
      keys.tomorrow = json['tomorrow'];
      keys.google = json['google'];
      keys.darksky = json['darksky'];
      keys.aqicn = json['aqicn'];
    }
    // second try url params
    const searchParams = new URLSearchParams(window.location.search);
    log('params', { search: searchParams.toString() });
    if (searchParams.has('tomorrow')) keys.tomorrow = searchParams.get('tomorrow') as string;
    if (searchParams.has('google')) keys.google = searchParams.get('google') as string;
    if (searchParams.has('darksky')) keys.darksky = searchParams.get('darksky') as string;
    if (searchParams.has('aqicn')) keys.aqicn = searchParams.get('aqicn') as string;
    // third try cookies and if we have keys, set them for future usage
    if (localStorage) {
      if (keys.tomorrow !== '') localStorage.setItem('tomorrow', keys.tomorrow);
      else keys.tomorrow = localStorage.getItem('tomorrow') || '';
      if (keys.google !== '') localStorage.setItem('google', keys.google);
      else keys.google = localStorage.getItem('google') || '';
      if (keys.darksky !== '') localStorage.setItem('darksky', keys.darksky);
      else keys.darksky = localStorage.getItem('darksky') || '';
      if (keys.aqicn !== '') localStorage.setItem('aqicn', keys.tomorrow);
      else keys.aqicn = localStorage.getItem('aqicn') || '';
    }
    // current keys
    log('keys', { tomorrow: keys.tomorrow, google: keys.google, darksky: keys.darksky, aqicn: keys.aqicn });
  }
}
