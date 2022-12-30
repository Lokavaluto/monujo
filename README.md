# Monujo

a wallet app for your local currency. `Monujo` works on your mobile
and on the web to let you connect to your digital account and spend
and receive money in your local complementary currency.

Monujo use an administrative backend (`odoo` is available thanks to
[lokavaluto-addons](https://github.com/Lokavaluto/lokavaluto-addons)),
and one or more financial backends (`cyclos` and `comchain` are
available) to provide end-users with a simple interface for their
daily use of their local complementary currency accounts.

Monujo supports:

- Lookup recipient of payment thanks to the community user directory
- Send money to any member
- Top up your account with credit cards
- Bio-metric authentication on your device when available
- ... more to come ...

You'll find here additional information for local complementary
currency community managers, and developers.

## What you'll find here

As an **end user**, your local community should provide you with all
the resource you need on their own website. If you don't know what you
are doing, you should probably be better off these pages and should
probably refer to your local complementary community resources pages.

As a **local complementary currency community manager**, you'll find here
both the mobile app resources to provide to your community and the
code to deploy on your web server.

As a **developer**, you'll find here enough technical information to get
you going to come give us a hand for the development of Monujo.

## Install

### Requirements

On the mobile side, Monujo is compatible with:

  - iPhone 6s or SE or later
  - Android 5.1 or later

On the browser side for the web deployment version, Monujo should be
compatible with most modern web browsers.

### Download

In the release page, you'll find all packages required for the mobile
deployment (currently only android packages are provided):

[Download the latest package](https://github.com/Lokavaluto/monujo/releases)

Along with the `.tar.bz2` archive file to deploy to your web server.

## Developer Information

Monujo is a Vuejs 3 application and use capacitor to make mobile compatible
app. It is written in Typescript.

### Requirements

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

### Web-app

The following will give you instructions for getting ready to test and
code on the web-app version.

#### Project setup

```
npm install
```

##### Compiles and hot-reloads for development

```
npm run serve
```

You'll need to provide a `public/config.json` along the live assets.
Yon can find an example in `public/config.example.json`.

##### Compiles and minifies for production (web or mobile)

Code is transpiled from typescript to compatible javascript by webpack.

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

#### Lints and fixes files

```
npm run lint
```

### Mobile app

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

#### Build core files

This will compile and produce the final javascript and css files in
`dist/` from the typescript files in `src/` and assets of the `public/`.

```
npm run build
```

Note: if you had a `public/config.json` file setup for development, it'll
be copied to `dist/config.json` automatically.

#### Generating splash screens and icons

Put your icon and splash files in `resources/icon.png` and
`resources/splash.png` respectively (see the files for minimum sizes)
and then run:

```
npx cordova-res --skip-config --copy
```

#### Theme customization

You can customize the app's theme by setting properties in the
`dist/config.json` file (see the `src/assets/custom-variables.scss`
for a reference of what you can customize).

See the `public/config.example.json` for a complete
example of customizing your theme in the main config file.

#### Prepare app for build

This will copy the assets from `dist/` folder into the android and iOS
directories and make sure the platforms have all their needed
dependencies

```
npx cap sync
```

#### Run in simulator or physical device

The following command will prompt you to choose from a list of
installed simulators or your physical device(s) if connected via USB
cable and properly set up.

```
npx cap run
```

#### Using full platform specific user interfaces

If you have installed the required studios (graphical user interface),
you can open it through:

```
npx cap open
```

From there you can sign package, upload to store, etc... the way you
would do it for any mobile app.

### Tests
Make sure that the application is running on ``http://localhost:8080`` before running the tests.

To run in local existing tests:

```
npx cypress run --project test
```
It is also possible to run and to create new tests in GUI mode, the following commande will open a browser window and run the tests:
```
npx cypress open --project test
```
To add a new E2E test, create a new file in the ``test/cypress/e2e`` folder and write your test cases, 
for more information on how to write E2E tests with Cypress, you can check out the Cypress documentation 
(https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test#Write-your-first-test)

### Translation

By default, the current files are set up to maintain a french
translation but the translation itself is not stored in the
repository.

In the following section you'll get to learn how to add or maintain a
translation for Monujo.

#### Preparing for translation in a new language

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

#### Edit the PO file with the actual translation

The previous extraction will have made changes to each ``app.po``, you
must then either fill the missing translation, review the "fuzzy"
entries. And finally save your file.

Many dedicated PO editors exists for easing the process of translating
apps. [POEdit](https://poedit.net/) is cross platform and up to the
task, or you might have a look at other softwares advertised in
[gettext
manual](https://www.gnu.org/software/gettext/manual/gettext.html#Editing).

#### Integrating a translated PO to Monujo

Once the PO file is ready (all the new entries were translated and all
the modified entries were unfuzzied), you need to produce a ``json``
file so Monujo can read it. This is done with:

```
npm run gettext:compile
```

This will produce files in ``public/i18n/fr-FR.json`` (using the default
`gettext.config.json` provided with the source code).

You then need to tell Monujo (or make sure it is already done), that
this language translation is available: you can force a language,
provide a default or give the choice to the user among any number of
languages in the ``config.json`` (you may want to look at the
``config.sample.json``, in the ``locales`` value).

Each language (except the one listed as ``appStringsLanguage`` require
it's ``url`` field to be set to the corresponding translation file
(the ``json`` file). Note that these translation files can be served
along with the current Monujo deployment, or from any other location.

### Build release assets

To build the final assets (signed packages for mobiles and for the web
app) and optionally create a github release (if you have the
appropriate rights), you can use `bin/release`.

For that you'll need to install some dependencies:

```bash
pip install gitchangelog  ## to generate CHANGELOG information from git log
npm install -g semver     ## install 'semver' utility to sort versions according
                          ## to semantic versionning
apt-get install yq jq     ## or use `brew` on macosx
```

To create the release on github, you'll need `hub`:

```
apt-get install hub       ## or use `brew` on macosx
```

#### Getting help

```
$ bin/release --help
release [-t TAG|--tag TAG] [-f|--force] [-p|--platform PLATFORM]

    ## android build options:

    [-r REV|--rev REV] [-a APP|--app APP]
    [--keystore-password PASSWORD] [--keystore-password-file FILE]
    [--keystore FILE]

    ## publish options

    [-P|--publish] [-d|--draft]

```

#### Basic usage

```
bin/release
```

Will attempt to find the tag of the current commit, and build all the
assets. If something is missing on the way, you'll be informed by a
hopefully useful error message.

If you want to build a specific version, for a specific platform, of a
custom app you can:

```
bin/release -t 1.0.0-rc.7 -p android -a roue
```

