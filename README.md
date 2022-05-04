# Web-app

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

You'll need to provide a `public/config.json` along the live assets.
Yon can find an example in `public/config.example.json`.

### Compiles and minifies for production (web or mobile)

```
npm run build
```

This will create `dist` folder with all files needed for the app.
You'll need to provide a `config.json` along with the release file.
Note that if you provided a `public/config.json` file prior to running
the build command, you'll end up having a copy in `dist/config.json`
along your release file.

You can find an example of a valid config file in
`public/config.example.json`.

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

## Build core files

This will compile and produce the final javascript and css files in
`dist/` from the typescript files in `src/` and assets of the `public/`.

```
npm run build
```

Note: if you had a `public/config.json` file setup for development, it'll
be copied to `dist/config.json` automatically.

## Generating splash screens and icons

Put your icon and splash files in `resources/icon.png` and
`resources/splash.png` respectively (see the files for minimum sizes)
and then run:

```
npx cordova-res --skip-config --copy
```

## Theme customization

You can customize the app's theme by setting properties in the
`dist/config.json` file (see the `src/assets/custom-variables.scss`
for a reference of what you can customize).

See the `public/config.example.json` for a complete
example of customizing your theme in the main config file.

## Prepare app for build

This will copy the assets from `dist/` folder into the android and iOS
directories and make sure the platforms have all their needed
dependencies

```
npx cap sync
```

## Run in simulator or physical device

The following command will prompt you to choose from a list of
installed simulators or your physical device(s) if connected via USB
cable and properly set up.

```
npx cap run
```

## Using full platform specific user interfaces

If you have installed the required studios (graphical user interface),
you can open it through:

```
npx cap open
```

From there you can sign package, upload to store, etc... the way you
would do it for any mobile app.
