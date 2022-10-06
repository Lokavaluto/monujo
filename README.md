Monujo sources used to build the web-app, and mobile (android, ios) app.


# Requirements

Monujo uses
[browserlist](https://github.com/browserslist/browserslist) to produce
web-app compatible with most browsers (see our
[targets](https://github.com/Lokavaluto/monujo/blob/main/.browserslistrc)).

On the mobile side, [capacitor](https://capacitorjs.com/) builds packages
compatible with:

  - iPhone 6s or SE or later (>= iOS 13)
  - Android 5.1 or later (SDK >= 22)

To build the packages from these current sources, you'll need:

  - for iOS: Xcode 13 or better (requires BigSur)
  - for Android: android SDK 22+ (requires Java 11+)


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

# Translation

By default, the current files are set up to maintain a french
translation but the translation itself is not stored in the
repository.

In the following section you'll get to learn how to add or maintain a
translation for monujo.

## Preparing for translation in a new language

Monujo uses [gettext
standard](https://en.wikipedia.org/wiki/Gettext). You can create (and
maintain) ready-for-translation PO files with:

```
npm run gettext:extract
```

It parses the full code for any strings (and changes to strings) and
produces (or updates), these files:

```
src/i18n/LINGUA
src/i18n/message.pot
src/i18n/fr-FR/app.po
```

You can configure the exact set of PO language files (here
``fr-FR/app.po``) to prepare/update in ``gettext.config.js`` in the
``output.locales`` value. Many languages can be maintained at the same
time.

For more information about this configuration file, you may want to
have a look at [vue3-gettext documentation of
it](https://jshmrtn.github.io/vue3-gettext/extraction.html#configuration),
and the defaults we provide in the current code.

## Edit the PO file with the actual translation

The previous extraction will have made changes to each ``app.po``, you
must then either fill the missing translation, review the "fuzzy"
entries. And finally save your file.

Many dedicated PO editors exists for easing the process of translating
apps. [POEdit](https://poedit.net/) is cross platform and up to the
task, or you might have a look at other softwares advertised in
[gettext
manual](https://www.gnu.org/software/gettext/manual/gettext.html#Editing).

## Integrating a translated PO to monujo

Once the PO file is ready (all the new entries were translated and all
the modified entries were unfuzzied), you need to produce a ``json``
file so monujo can read it. This is done with:

```
npm run gettext:compile
```

This will produce files in ``public/i18n/fr-FR.json`` (using the default
`gettext.config.json` provided with the source code).

You then need to tell monujo (or make sure it is already done), that
this language translation is available: you can force a language,
provide a default or give the choice to the user among any number of
languages in the ``config.json`` (you may want to look at the
``config.sample.json``, in the ``locales`` value).

Each language (except the one listed as ``appStringsLanguage`` require
it's ``url`` field to be set to the corresponding translation file
(the ``json`` file). Note that these translation files can be served
along with the current monujo deployment, or from any other location.
