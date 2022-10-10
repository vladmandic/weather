import { log } from './log';

export class keys {
  public static tomorrow = '';
  public static google = '';
  public static darksky = '';
  public static aqicn = '';

  public static async init() {
    const res = await fetch('../secrets.json');
    if (res?.ok) {
      const json = await res.json();
      log('secrets', { json });
      keys.tomorrow = json['tomorrow'];
      keys.google = json['google'];
      keys.darksky = json['darksky'];
      keys.aqicn = json['aqicn'];
    }
    const searchParams = new URLSearchParams(window.location.search);
    log('params', { search: searchParams.toString() });
    if (searchParams.has('tomorrow')) keys.tomorrow = searchParams.get('tomorrow') as string;
    if (searchParams.has('google')) keys.google = searchParams.get('google') as string;
    if (searchParams.has('darksky')) keys.darksky = searchParams.get('darksky') as string;
    if (searchParams.has('aqicn')) keys.aqicn = searchParams.get('aqicn') as string;
    log('keys', { tomorrow: keys.tomorrow, google: keys.google, darksky: keys.darksky, aqicn: keys.aqicn });
  }
}
