import { DotenvConfigOptions } from 'dotenv';

export interface IEnvironmentSchema {
    src: string;
    dotenvConfigOptions: DotenvConfigOptions;
    model: string;
    modelPath: string;
    template: string;
}

export interface IEnvironmentModule {
    environment: object;
}
