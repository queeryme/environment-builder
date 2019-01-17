# Environment builder for Angular build facade
[![npm version](https://img.shields.io/npm/v/@flatxph/environment.svg) ![npm](https://img.shields.io/npm/dm/@flatxph/environment.svg)](https://www.npmjs.com/package/@flatxph/environment)  

This builder converts the dotenv to its equivalent environment.ts that can be used by the angular cli

This builder followed and improved on [Angular CLI 6 under the hood — builders demystified](https://medium.com/@meltedspark/angular-cli-6-under-the-hood-builders-demystified-f0690ebcf01).
This also follows [Step by step: Building and publishing an NPM Typescript package.](https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c)
## Usage

  1. In the root of your Angular application:
        ```
        npm i -D @flatxph/environment
        npm i -D dotenv
        npm i -D @types/dotenv
        ```
  2. In your _angular.json_ add the following to _architect_ section of the relevant project:
        ```
        "environment": {
          "builder": "@flatxph/environment:file",
          "options": {}
        },
        ```
  3. Create a file name _environment.build.ts_ on _src/environments_. This file will have access to the NodeJS environment.
        This is a sample environment.build.ts
        ```
        import { Environment } from './model';

        export const environment: Environment = {
            production: !!process.env.PRODUCTION || false,
            maps: {
                apiKey: process.env.MAPS_API_KEY,
                libraries: process.env.MAPS_LIBRARIES ? process.env.MAPS_LIBRARIES.split(',') : [],
            },
            title: process.env.TITLE || '',
            description: process.env.DESCRIPTION || '',
            fbAppId: parseInt(process.env.FB_APP_ID, 10) || 0,
            url: process.env.URL || '',
            twitter: process.env.TWITTER || '',
            image: process.env.IMAGE || '',
            imageWidth: parseInt(process.env.IMAGE_WIDTH, 10) || 0,
            imageHeight: parseInt(process.env.IMAGE_HEIGHT, 10) || 0,
            appId: process.env.APP_ID || '',
        };
        ```
  4. Run: `ng run [relevant-project]:environment`
     Where _[relevant-project]_ is the project to which you've added the target 

## Options

 - `src` - path to the file with build environment, Defaults to `src/environments/environment.build`. The `.ts` part of the file should be omitted.
 - `dotenvConfigOptions` - This is a DotenvConfigOption based on package `@types/dotenv`. Defaults to `{}`
 - `model` - The model used as environment check. Typically named `Environment`. Defaults to `null`
 - `modelPath` - This is the path of the model for the environment. Typically `app/environments/model`. Defaults to `null`
 - `template` - This is the template file to use to render the environment. Defaults to `null`
 - `output` - This is the output file. Default to `src/environments/environment.ts`

## Development

If you want to create your own builder like this, to upload to npm, run `yarn public` to publish.

