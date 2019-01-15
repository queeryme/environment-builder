import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { Observable, of } from 'rxjs';
import { IEnvironmentSchema } from './schema';

export default class TimestampBuilder implements Builder<IEnvironmentSchema> {
    constructor(private context: BuilderContext) {}

    public run(builderConfig: BuilderConfiguration<Partial<IEnvironmentSchema>>): Observable<BuildEvent> {
        return of({ success: true });
    }
}
