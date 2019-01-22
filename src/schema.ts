import { DotenvConfigOptions } from 'dotenv';

export interface IEnvironmentSchema {
    src: string;
    dotenvConfigOptions: DotenvConfigOptions;
    model: string;
    modelPath: string;
    template: string;
    output: string;
    templateVariables: object;
}

export interface IEnvironmentModule {
    environment: object;
}
