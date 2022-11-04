# Weather: Yet another weather app

## Notes

Fully rendered in browser, no external dependencies  
Written in `TypeScript`, transpiled to `JavaScript` **ECMAScript2020**, no frameworks  
Can self host without any server-side components needed  

## Variations

Two layouts:
- As full PWA for both desktop and mobile: `/public/index.html`
- For nightstand displays (with auto-scroll and auto-refresh): `/public/nightstand.html`

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
INFO:  User: vlado Platform: linux Arch: x64 Node: v18.7.0
INFO:  Application: { name: '@vladmandic/weather', version: '0.9.0' }
INFO:  Environment: { profile: 'development', config: '.build.json', package: 'package.json', tsconfig: true, eslintrc: true, git: true }
INFO:  Toolchain: { build: '0.7.14', esbuild: '0.15.12', typescript: '4.8.4', typedoc: '0.23.19', eslint: '8.26.0' }
INFO:  Build: { profile: 'development', steps: [ 'serve', 'watch', 'lint', 'compile' ] }
STATE: WebServer: { ssl: true, port: 10061, root: '', sslKey: 'node_modules/@vladmandic/build/cert/https.key', sslCrt: 'node_modules/@vladmandic/build/cert/https.crt' }
STATE: Watch: { locations: [ 'src/**/*' ] }
STATE: Lint: { locations: [ '*.json', 'src/*' ], files: 34, errors: 0, warnings: 0 }
STATE: Compile: { name: 'application', format: 'esm', platform: 'browser', input: 'src/index.ts', output: 'dist/weather.js', files: 27, inputBytes: 99244, outputBytes: 516761 }
STATE: Compile: { name: 'service-worker', format: 'esm', platform: 'browser', input: 'src/pwa-serviceworker.ts', output: 'dist/pwa-serviceworker.js', files: 1, inputBytes: 4152, outputBytes: 1699 }
INFO:  Listening...

```

## Run

- Navigate to  
  <https://localhost:10061>  
  *Note*: API keys will be auto-loaded from `/secrets.json`  
- Alternatively, provide API keys as URL parameters  
  <https://localhost:10061/?google=xxx&darksky=xxx&aqicn=xxx>  
- Additionally, you can skip auto-location and search for forecast for a specific location given as URL parameter  
  <https://localhost:10061/?location=miami>  

## References

- [DarkSky](https://darksky.net/dev/docs)
- [Tomorrow.io](https://docs.tomorrow.io/reference/welcome)
- [Leaflet](https://leafletjs.com/reference.html)
- [Google Maps](https://developers.google.com/maps/documentation/geocoding/requests-geocoding)
- [AQIcn](https://aqicn.org/json-api/doc/)

## Screenshot

![screenshot](assets/screenshot.jpg)
