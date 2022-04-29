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

And download all dependencies:

```
npm install
```

This will install `cap` and `cordova-res` which we will use in the
next steps. Please note that these commands all accept the platform
(`ios` or `android`) as first argument, and will ask for it if it
can't apply to all platform at once.

## Generating splash screens and icons

Put your icon and splash files in `resources/icon.png` and
`resources/splash.png` respectively (see the files for minimum sizes)
and then run:

```
npx cordova-res --skip-config --copy
```

## Build core files

This will compile and produce the final javascript and css files in
`dist/` from the typescript files in `src/` and assets of the `public/`.

```
npm run build
```

## Theme customization

You can customize the app's theme by setting properties in the
`public/config.json` file (see the `src/assets/custom-variables.scss`
for a reference of what you can customize).

See the `public/config.example.json` for a complete
example of customizing your theme in the main config file.

## Prepare app for build

```
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
