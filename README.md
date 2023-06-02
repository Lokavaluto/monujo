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
- Export transaction list on a given time range
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

We use both `ESLint` and `prettierx` to ensure a solid
consistent style and some coding guidelines.

To check (and correct when possible) coding guidelines:

```
npm run lint
```

To format the code according with `prettierx`:

```
npx prettierx -w src/
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

#### End-to-End tests with cypress

##### Setup

For most tests, you might want to provide some important environment
variables:

In a local file `cypress.env.json` (in the root of the project), you can add:
```json
{
  "email":"me@email.com",
  "password":"pass"
}
```

These are the credentials that will be used to login in the end-to-end
tests. You might want to double check your ``config.json`` and more
specifically your ``lokapiHost`` value, as it is toward this odoo
server that these credentials will be used.

Note that you can also provide credentials also this way:

```shell
CYPRESS_email="me@email.com" CYPRESS_password="pass" npx cypress run
## or
npx cypress run --env email="me@email.com",password="pass"
```

##### Running tests

To run end-to-end tests on the content of the `dist/` code (it needs
to have been created prior to running this, through `npm run build`):

```
npx cypress run
```

You may rather want to run the tests directly on the development
server provided by `npm run serve`. You'll then need to provide a
`baseUrl` configuration.

```shell
CYPRESS_BASE_URL=http://localhost:8080 npx cypress run
## or
npx cypress run --config baseUrl=http://localhost:8080
```

Any test output (reports, screenshots and videos) will be created under
the folder `.cypress/`.

Note that it is also possible to run and to create new tests in GUI
mode, the following command will open a browser window and run the
tests:

```
npx cypress open
```

To add a new E2E test, create a new file in the
`tests/e2e/<FILENAME>.cy.ts` folder and write your test cases, for
more information on how to write E2E tests with Cypress, you can check
out the [Cypress
documentation](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test#Write-your-first-test)

#### Screenshots

End-to-end tests from cypress can be used to generate screenshots intended
to publication to stores. You can do that with the following call:

```shell
npx cypress run \
    --config viewportWidth=375,viewportHeight=667,defaultCommandTimeout=20000 \
    --env screenshot=true \
    --spec tests/e2e/spec.cy.ts
```

This will run the tests and if everything went well, should produce the
screenshots in the directory `.cypress/screenshots/spec.cy.ts/`.

To provide a scale factor, you must add an environment variable
`scaleFactor` (which default is `1`), and force the browser to be
`chrome`, for instance:

```shell
npx cypress run \
    --config viewportWidth=375,viewportHeight=667,defaultCommandTimeout=20000 \
    --env screenshot=true,scaleFactor=2 \
    --spec tests/e2e/spec.cy.ts \
    --browser chrome
```

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

##### Emacs PO Editor mode

With Emacs PO Editor mode, the `ufo` cycle to review a PO file:

- Check all untranslated entries with `u`/`U` (next/previous
  untranslated entry, knowing that it'll cycle once it reach the
  bottom/top, so you can just use `u` until it tells you it can't find
  any more untranslated entries).

  These are new strings for which no translation was yet provided.

  - On an untranslated entry, just use `ENTER` key. Edit the
    translation, then accept with `C-c C-c`.

- Check all fuzzy entries with `f`/`F` (next/previous fuzzy entry,
  knowing that it'll cycle once it reach the bottom/top, so you can
  just use `f` until it tells you it can't find any more fuzzy
  entries),

  These are entries whose message id have been modified and should be
  reviewed for probable adaptation.

  - correct if necessary with `ENTER` key as specified for
    untranslated entries.
  - unfuzzy the entries once you've reviewed it and/or finished
    editing it with `<TAB>` key.

- Check all obsolete entries with `o`/`O` (next/previous obsolete
  entry, knowing that it'll cycle once it reach the bottom/top, so you
  can just use `o` until it tells you it can't find any more obsolete
  entries),

  These are entries that are not used anymore. You should usually
  delete them.

  - Use `<BACKSPACE>` to delete the entry.

Once you've finished the `ufo` cycle, the `PO` file is ready !

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
appropriate rights), `fastlane` is used.

First, you need `ruby` on your system (note that you might require
also `ruby-dev` package on debian related system).

For that you'll need to install some dependencies:

```bash
bundle install            ## to install all ruby dependencies
pip install gitchangelog  ## to generate CHANGELOG information from git log
```

#### General usage

These following commands will create a release as long as your current
commit is tagged with a valid tag identifier (following
`X.Y.Z(-rc.R)` syntax).

```
bundle exec fastlane web build      ## Build web deployment package
bundle exec fastlane android build  ## Build android APK and AAB
bundle exec fastlane ios build      ## Build ios IPA
```

Will produce build outputs in `release/$TAG` directory.


##### create and publish all assets

```
bundle exec fastlane android publish_store  ## TBD
bundle exec fastlane ios publish_store
```

- publish changelog, screenshots and application on platform's store
  (Google play store for android, and Apple Store for ios)
- the ios platform will require a Mac host.

```
bundle exec fastlane {web,android} publish_github
```

- publish changelog and application files on github release pages

This is only supported on the Apple Store for now and requires a Apple
host to support the final publication on Apple Store.

Many arguments are supported from the inner lanes to drive
the build of artifacts (screenshots, packages).

For instance:

```
bundle exec fastlane ios publish_store \
    tag:1.0.0-rc.11 app:agnel,pive \
    host:demo.lokavaluto.fr \
    db:odoo \
    login:demo@example.com \
    password:demo \
    language:fr-FR,en-US \
    device:IPHONE_55,IPAD_PRO_129
```

##### Specifying which version to build

If the checkout of your current code is on a commit that has a TAG of the
form `X.Y.Z` (optionally with `-rc.R` postfixed, as `1.0.0-rc.9` or
`2.1.0` for instance) it'll be automatically used as the version name.

You can force the build of another tag by adding a `tag:1.0.0-rc.9`
argument on the command line.

For instance:

```
bundle exec fastlane android build tag:1.0.0-rc.9
```

##### build changelog for current version

```
bundle exec fastlane changelog
```

Will create a file `release/<TAG>/CHANGELOG` with the changes since
last version.

##### create screenshots for release by specifying resolution

These screenshots will showcase the most important part of the
app. These are intended for publication along the releases in app
stores to illustrate the app features.

If you use the `screenshot` action `fastlane`, screenshots will be
built. If you do so, you probably want to configure some important
aspect of this tour through several options:

- the real odoo screenshot server to connect to:
  - command line argument `host`, or
  - environment variable `SCREENSHOT_HOST`
  - configuration file `.screenshot.json`, field `host`.
  - if not specified, it will use the value provided in the
    `config.json` as `lokapiHost`.
- the database to connect to on the screenshot host:
  - command line argument `db`, or
  - environment variable `SCREENSHOT_DB`
  - configuration file `.screenshot.json`, field `db`.
  - if not specified, it will leave the value provided in the
    `config.json` as `lokapiDb`.
- the login/email to log into the given screenshot host:
  - command line argument `login`, or
  - environment variable `SCREENSHOT_LOGIN`, or
  - configuration file `.screenshot.json`, field `login`.
  - the file `cypress.env.json` in the key `email`
  - if not specified, the command will fail with an explanatory
    message.
- the password to log into the given screenshot host:
  - command line argument `password`, or
  - environment variable `SCREENSHOT_PASSWORD`
  - configuration file `.screenshot.json`, field `password`.
  - the file `cypress.env.json` in the key `password`
  - if not specified, the command will fail with an explanatory
    message.
- the language to shoot the screenshots in:
  - command line argument `language`, comma separated if needed or
  - environment variable `SCREENSHOT_LANGUAGE`, comma separated if needed or
  - configuration file `.screenshot.json`, field `languages` as an array.
  - if not specified, every key of declared languages in `config.json`
    in `locales.availableLanguages` will be used to create
    screenshots for all languages.
- the resolution to shoot the screenshots in:
  - command line argument `resolution`, comma separated if needed or
  - environment variable `SCREENSHOT_RESOLUTION`, comma separated if needed or
  - configuration file `.screenshot.json`, field `resolutions` as an array.
  - if not specified, every key of declared languages in `config.json`
    in `locales.availableLanguages` will be used to create
    screenshots for all languages.

For instance:

```
bundle exec fastlane screenshot \
    tag:1.0.0-rc.11 app:agnel,pive \
    host:demo.lokavaluto.fr \
    db:odoo \
    login:demo@example.com \
    password:demo \
    language:fr-FR,en-US \
    resolution:375x667x3,1080x810
```

Results will be outputted along the built files in
`release/$TAG/screenshots/$APP/$LANG/$RESOLUTION`. Notice that if the directory exists
already, it won't try to build screenshots. You must provide a
`force:true` option to force the deletion of the directory
and replacement with a new one.

The quickest way to build/complete all snapshots of the app would be
to setup your `.screenshot.json` and then run:

```
bundle exec fastlane screenshot
```

Note that screenshot resolution can specify a scaling factor as third
number. For instance, `393x852x3` is a valid resolution with `3` as
scaling factor.

##### create and publish screenshots for release by specifying device

This is only supported on the Apple Store for now and requires a
Apple host to support the final publication on Apple Store.

All arguments of previous section applies. With the addition of:

- the device name to target for the screenshots in:
  - command line argument `device`, comma separated if needed of one or more
    of the following `IPHONE_55`, `IPHONE_65`, `IPHONE_67`, `IPAD_PRO_129`,
    `IPAD_PRO_3GEN_129`, ... or
  - environment variable `SCREENSHOT_DEVICE`, comma separated if needed or
  - configuration file `.screenshot.json`, field `resolutions` as an array.
  - if not specified, the minimum required list of device needed to
    make a valid release for the store will be chosen. (which is
    currenty: `IPHONE_55`, `IPHONE_65`, `IPHONE_67`, `IPAD_PRO_129`,
    `IPAD_PRO_3GEN_129`)

For instance:

```
bundle exec fastlane ios publish_screenshots \
    tag:1.0.0-rc.11 app:agnel,pive \
    host:demo.lokavaluto.fr \
    db:odoo \
    login:demo@example.com \
    password:demo \
    language:fr-FR,en-US \
    device:IPHONE_55,IPAD_PRO_129

```

Or if you have correctly setup files, and want to target all apps in
all languages on all required devices for the current tag:

```
bundle exec fastlane ios publish_screenshots
```

##### Build is happening in a temporary directory

You don't need to clean your directory or care about the state of your
current work dir: the source will be cloned in a temporary directory
prior to any package building.

##### Platforms supported

This will be the first argument after your `bundle exec fastlane ...`
command.

Current infrastructure can drive the builds for:

###### web

This is a simple html/js/css web server archive ready for deployment
and should be buildable in all environment.

###### iOS

It is required to use a mac. We are using [fastlane code signing
guidelines and tools](https://codesigning.guide/).

You need to have your Apple certificates and keys ready. The nice default
setup is to create a directory 'keys/ios/', having:

- `keys/ios/api_key.json`: Your App Store Connect API keys JSON file
   as documented in [fastlane
   docs](https://docs.fastlane.tools/app-store-connect-api/#using-fastlane-api-key-json-file).

- `keys/ios/match_password` the match password that encrypts your
  certificates

You can change these paths, or even provide these information without
using files, you'll get direction for this if you don't provide the
previous file.

Then, it'll download certificates from our github private certificate
repository (you'll need access to that set up). And will need to
decrypt these with our certificate password (you'll need this also),
it should ask for this password only the first time you need it and
will try to keep it in your machine's key-chain (it might ask you to
create a password for this).

Finally, provided that you have the correct dependencies ready... it will
produce the IPA file that needs to be shipped to the App Store to make
a release. Please note that fastlane can do this for you also, please
have a look at the release section.

Note that you can provide a revision number for the released ios
package by adding an argument to the command line as `rev:N` (that
will be 0 by default).

###### android

You need to have your Android signing keys ready. The nice default
setup is to create a directory 'keys/android/', having:

- `keys/android/keystore` the binary keystore
- `keys/android/keystore-password` the password to the keystore

You can change these paths, or even provide these information without
using files, you'll get direction for this if you don't provide the
previous files.

Then, provided that you have the correct dependencies ready... it will
produce:

- APK files for direct installs on android mobile phones.
- AAB files to provide to the google playstore for deployment on it.

Note that you can provide a revision number for the released android
package by adding an argument to the command line as `rev:N`
(that will be 0 by default).

##### Applications

Multiple variations of the application are automatically built for the
`android` and `ios` platforms depending on the content of [this
external resource](https://docker.0k.io/downloads/lokavaluto-releases.yml).

You can limit your build to one or more of these by adding an
`app:APP1,[APP2, ...]` argument to the command line. By default, if
you don't specify any `app` argument, all apps will be built.

For instance:

```
bundle exec fastlane android build app:roue,pive
```

### Publishing Release

This is about the process of send the build artifacts (web `tar.bz2`,
`IPA` files) to public platform (github release page, apple store) for
distribution.

#### Publish to github

In this section, it'll be about publishing the build assets on the
github release page.

```
bundle exec fastlane web publish_github
bundle exec fastlane android publish_github
bundle exec fastlane ios publish_github
```

Will build packages in `release/$TAG` and create/update github release
provided that you have the credentials for this.

To setup your credentials, you'll be required to setup the
`GITHUB_API_TOKEN` environment variable with an api token that you'll
create in your github account.

You can change the default github repository on which the release are
created/updated by adding a `github_repository:OWNER/REPOS` command
line argument.

For instance:

```
bundle exec fastlane android publish_github \
    tag:1.0.0-rc.8 github_repository:vaab/monujo \
    app:monujo rev:1
```

.. will build android packages (APK and AAB) from source code of tag
`1.0.0-rc.8` with the added revision 1 in the android version code,
only for application "monujo" and create/update the github release
`1.0.0-rc.8` of the github repository "vaab/monujo".

Note that you'll need to add `changelog:true` to force creation of
changelog and use it to create the description of the release with the
changelog.

#### Publish to Apple Store

The following will only work on a MacOSX system.

```
bundle exec fastlane ios publish_store
```

Will build packages in `release/$TAG` and create/send the release
provided that you have the credentials for this. The result should
be available in testflight.

Please refer to the ios build section to provide any options that
you'd like. If `IPA` was already built, it'll be used.

For instance:

```
bundle exec fastlane ios publish_store \
    tag:1.0.0-rc.11 \
    app:monujo rev:1
```

.. will build iOS packages (IPA) from source code of tag `1.0.0-rc.11`
with the added revision 1 in the iOS version code, only for the
application "monujo" and send this release to testflight.
