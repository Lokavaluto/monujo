# Web-app

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

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

# Mobile app

In order to be able to build the mobile app, you will need to follow
these instructions first:

[capacitor environment setup instructions](https://capacitorjs.com/docs/getting-started/environment-setup)

## To generate the splash screens and the icons for mobile deployment

If you need to do this, make sure you have cordova-res installed with `npm i -g cordova-res`

Then put your icon and splash files in `resources/icon.png` and
`resources/splash.png` respectively (see the files for minimum sizes)
and then run:

```
cd project root
cordova-res android --skip-config --copy && cordova-res ios --skip-config --copy
```

## Theme customization

You can customize the app's theme by setting properties in the
`<project root>/public/config.json` file (see the `<project
root>/src/assets/custom-variables.scss` for a reference of what you
can customize). Note that if you choose to customize your theme from
the main config file `<project root>/public/config.json`, be sure not
to include the leading `$` of the sass variables.

See the `<project root>/public/config.example.json` for a complete
example of customizing your theme in the main config file.

## To build the assets (the web app) for mobile deployment

**!IMPORTANT** : Do not forget to put your config file at `<project
root>/public/config.json` otherwise the build will exit with an error

## Prepare app for build

```
npm run build:mobile // This will build the assets with the content of the aforementioned config file
npx cap sync // this will copy the assets into the android and ios directories and make sure the platforms have all their needed dependencies
```

## Run in simulator or physical device

This will prompt you to choose from a list of installed simulators or
your physical device(s).

```
npx cap run ios|android
```

## Build

To open in editor for building the binary or for debugging the app

```
npx cap open ios|android
```

From there you can sign package, upload to store, etc the way you
would do it for any mobile app.
