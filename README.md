# web-app

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### To generate splash screen and icon for mobile deployment

If you need to do this, make sure you have cordova-res installed with `npm i -g cordova-res`

Then put your icon and splash files in `resources/icon.png` and `resources/splash.png` respectively (see the files for minimum sizes) and then run:

```
cordova-res android --skip-config --copy && cordova-res ios --skip-config --copy
```

### To build assets for mobile deployment

Do not forget to put your config file at `public/config.json` otherwise the build will exit with an error

```
npm run build:mobile && npx cap sync
```

### To run in ios or android simulator
```
npx cap run ios|android
```

### To open in editor for building binary
npx cap open ios|android
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

