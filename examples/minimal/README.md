# Minimal

Copy `.env.sample` to `.env` to allow dotenv configuration.

The following changes are made for minimal setup:
1. Run `yarn add --dev @types/node dotenv @types/dotenv` to install required dependencies
2. Run `yarn add @flatxph/environment` to install the Environment Builder
3. Added file `src/environments/environment.build.ts`
4. Added architect on `angular.json`
    ```
    ...
          "architect": {
            "environment": {
              "builder": "@flatxph/environment:file",
              "options": {
              }
    ...
    ```
5. Excluded `environment.build.ts` on `src/tsconfig.app.json`
    ```
      "exclude": [
        "test.ts",
        "**/*.spec.ts",
        // Added this part to ignore environment.build.ts due to missing "process" error on build
        "**/environment.build.ts"
      ]
    ```

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.2.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
