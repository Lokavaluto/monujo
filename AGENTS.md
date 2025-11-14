# Repository Guidelines

## Project Structure & Module Organization

Monujo is a Vue 3 + Capacitor app written in TypeScript.

Application code lives in `src/`, with feature views under `src/views/`, shared
components in `src/components/`, Vuex stores in `src/store/`, and
reusable helpers in `src/services/` and `src/utils/`.

Translations stay in `src/i18n/`.

Static assets and the required deployment config
(`public/config.json`) belong in `public/`; `dist/` is generated
output and should remain untracked.

Mobile wrapper projects reside in `android/` and `ios/`, while Cypress
scenarios and support code live in `tests/e2e/`.

## Build, Test, and Development Commands

Run `npm install` (triggers `./autogen.sh`) to prepare gettext tooling
and install dependencies.

Use `npm run serve` for hot-reload web
development, and `npm run build` to produce release bundles in
`dist/`.

Check typescript compilation with `npx tsc`.

Check lint rules with `npm run lint`; format TypeScript and
Vue files via `../prettierx/node_modules/.bin/prettier -w src/`.

Execute browser end-to-end tests with `npx cypress run` (headless) or
`npx cypress open` for interactive debugging, configuring credentials
through `cypress.env.json`.

## Coding Style & Naming Conventions

Follow the ESLint + Prettierx configuration: 2-space indentation,
double quotes in typeScript, and semicolons omitted. Vue components
and stores use PascalCase filenames (`PaymentList.vue`) and camelCase
exports.

Keep business logic inside services; components should stay
presentation-focused.

Import aliases use `@/` to reference `src/`.

Localized strings must go through `v-translate` or `gettext` helpers
so gettext scripts can pick them up.

## Testing Guidelines

Cypress specs belong in `tests/e2e/*.cy.ts`; mirror feature names (for
example, `auth.cy.ts`) to keep reports readable. Mock external
gateways with fixtures rather than hitting live services.

Ensure new behavior includes a happy-path Cypress test and, when
possible, failure-state coverage. Keep `cypress.env.json` free of
secrets.

## Commit & Pull Request Guidelines

Before committing, ensure valid typescript.

The history favors conventional prefixes (`fix:`, `chg:`, `new:`);
follow `<type>: <short imperative>` and keep scope focused. Reference
issues or tickets in the body, and note configuration or translation
impacts explicitly.

Before opening a PR, run lint, build, and Cypress locally, attach
screenshots or recordings for UI changes, and describe configuration
steps (such as required `config.json` keys). Request review from the
relevant module owner and confirm gettext bundles are regenerated when
strings change.

## Localization & Assets

When altering copy or adding locales, run `npm run gettext:extract`
then `npm run gettext:compile` to refresh `.po` files under
`src/i18n/`.

Place shared SCSS in `src/assets/` and avoid editing generated files
in `dist/`.
