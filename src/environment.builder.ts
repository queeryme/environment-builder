import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { getSystemPath } from '@angular-devkit/core';
import { writeFile } from 'fs';
import { bindNodeCallback, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { IEnvironmentSchema } from './schema';

// noinspection JSUnusedGlobalSymbols
export default class TimestampBuilder implements Builder<IEnvironmentSchema> {
    // noinspection JSUnusedGlobalSymbols
    constructor(private context: BuilderContext) {}

    public run(builderConfig: BuilderConfiguration<Partial<IEnvironmentSchema>>): Observable<BuildEvent> {
        const root = this.context.workspace.root;
        const { src } = builderConfig.options;
        const timestampFileName = `${getSystemPath(root)}/${src}`;
        const writeFileObservable = bindNodeCallback(writeFile);
        return writeFileObservable(timestampFileName, 'Hello world!').pipe(
            map(() => ({ success: true })),
            tap(() => this.context.logger.info('Hello world created')),
            catchError(e => {
                this.context.logger.error('Failed to create hello world', e);
                return of({ success: false });
            }),
        );
    }
}
