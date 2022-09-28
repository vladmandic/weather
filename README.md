# Weather

Yet another weather app

## Platforms

Fully rendered in browser, no server-side components required

Two layouts:
- As full PWA: `public/index.html`
- For nightstand displays: `public/nightstand.html`

## Install

1. Run `npm install`

2. Create `secrets.json` in project root containing API keys:

```json
{
  "google": "xxxx",
  "darksky": "xxxx",
  "aqicn": "xxxx"
}
```

2. Run `npm dev`

```js
INFO:  @vladmandic/weather version 0.1.0
INFO:  User: vlado Platform: linux Arch: x64 Node: v18.7.0
INFO:  Application: { name: '@vladmandic/weather', version: '0.1.0' }
INFO:  Environment: { profile: 'development', config: '.build.json', package: 'package.json', tsconfig: true, eslintrc: true, git: true }
INFO:  Toolchain: { build: '0.7.8', esbuild: '0.14.51', typescript: '4.7.4', typedoc: '0.23.9', eslint: '8.20.0' }
INFO:  Build: { profile: 'development', steps: [ 'serve', 'watch', 'lint', 'compile' ] }
STATE: WebServer: { ssl: false, port: 10060, root: '' }
STATE: WebServer: { ssl: true, port: 10061, root: '', sslKey: 'node_modules/@vladmandic/build/cert/https.key', sslCrt: 'node_modules/@vladmandic/build/cert/https.crt' }
STATE: Watch: { locations: [ 'src/**/*' ] }
STATE: Lint: { locations: [ '*.json', 'src/**/*.ts' ], files: 26, errors: 0, warnings: 0 }
STATE: Compile: { name: 'darksky', format: 'esm', platform: 'browser', input: 'src/darksky.ts', output: 'public/darksky.js', files: 21, inputBytes: 77870, outputBytes: 465595 }
STATE: Compile: { name: 'nightstand', format: 'esm', platform: 'browser', input: 'src/nightstand.ts', output: 'public/nightstand.js', files: 17, inputBytes: 70703, outputBytes: 460132 }
STATE: Compile: { name: 'service-worker', format: 'esm', platform: 'browser', input: 'src/pwa-serviceworker.ts', output: 'public/pwa-serviceworker.js', files: 1, inputBytes: 3828, outputBytes: 1476 }
INFO:  Listening...
```

## Run

- Navigate to  
  <https://localhost:10061>  
  *Note*: API keys will be auto-loaded from `/secrets.json`  
- Alternatively, provide API keys as URL parameters  
  <https://wyse:10061/?google=xxx&darksky=xxx&aqicn=xxx>  
- Additionally, you can skip auto-location and search for forecast for a specific location given as URL parameter  
  <https://wyse:10061/?location=miami>  

## References

- [DarkSky](https://darksky.net/dev/docs)
- [Tomorrow.io](https://docs.tomorrow.io/reference/welcome)
- [Leaflet](https://leafletjs.com/reference.html)
- [Google Maps](https://developers.google.com/maps/documentation/geocoding/requests-geocoding)
- [AQIcn](https://aqicn.org/json-api/doc/)

## Screenshot

![screenshot](assets/screenshot.jpg)


https://wyse:10061/?google=AIzaSyAzOgb1KMAg18FWTHFq9GumOIWq57AgYUA&darksky=862dc32f1159c63282b1e2aa3c71acda&aqicn=52f660d7150a418e560757663d4ac7d845d062ac&location=mavrinci
