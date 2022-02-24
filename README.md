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

## For the mobile app

In order to be able to build the mobile app, you will need to follow these instructions first:
[capacitor environment setup instructions](https://capacitorjs.com/docs/getting-started/environment-setup)

### To generate the splash screens and the icons for mobile deployment

If you need to do this, make sure you have cordova-res installed with `npm i -g cordova-res`

Then put your icon and splash files in `resources/icon.png` and `resources/splash.png` respectively (see the files for minimum sizes) and then run:

```
cordova-res android --skip-config --copy && cordova-res ios --skip-config --copy
```

### To build the assets (the web app) for mobile deployment

*!IMPORTANT* : Do not forget to put your config file at `<project root>/public/config.json` otherwise the build will exit with an error

```
npm run build:mobile // This will build the assets with the content of the aforementioned config file
npx cap sync // this will copy the assets into the android and ios directories and make sure the platforms have all their needed dependencies
```

### To run in ios or android simulator
```
npx cap run ios|android
```

### To open in editor for building the binary or for debugging the app
```
npx cap open ios|android
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

