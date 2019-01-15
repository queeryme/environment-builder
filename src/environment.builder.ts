import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { getSystemPath } from '@angular-devkit/core';
import { Observable, of } from 'rxjs';
import * as ts from 'typescript';
import { CompilerOptions, Diagnostic, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';
import { IEnvironmentSchema } from './schema';

// noinspection JSUnusedGlobalSymbols
export default class TimestampBuilder implements Builder<IEnvironmentSchema> {
    // noinspection JSUnusedGlobalSymbols
    constructor(private context: BuilderContext) {}

    public run(builderConfig: BuilderConfiguration<Partial<IEnvironmentSchema>>): Observable<BuildEvent> {
        const root = this.context.workspace.root;
        const { src } = builderConfig.options as IEnvironmentSchema;
        const timestampFileName = `${getSystemPath(root)}/${src}`;

        // TODO: use ts.convertCompilerOptionsFromJson() to convert from a JSON file to the correct format.
        const compilerOptions: CompilerOptions = {
            moduleResolution: ModuleResolutionKind.NodeJs,
            module: ModuleKind.CommonJS,
            target: ScriptTarget.ESNext,
            strict: true,
            allowSyntheticDefaultImports: true,
            suppressImplicitAnyIndexErrors: true,
            forceConsistentCasingInFileNames: true,
            strictPropertyInitialization: false,
            strictNullChecks: false,
            pretty: true,
            sourceMap: true,
            declaration: true,
            stripInternal: true,
            skipLibCheck: true,
            declarationDir: 'typings',
        };
        this.compile([src], compilerOptions);

        // require(`${getSystemPath(root)}/${src}`);

        // const writeFileObservable = bindNodeCallback(writeFile);
        // return writeFileObservable(timestampFileName, 'Hello world!').pipe(
        //     map(() => ({ success: true })),
        //     tap(() => this.context.logger.info('Hello world created')),
        //     catchError(e => {
        //         this.context.logger.error('Failed to create hello world', e);
        //         return of({ success: false });
        //     }),
        // );
        return of({ success: false });
    }

    /**
     * @see https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
     * @param fileNames
     * @param options
     */
    private compile(fileNames: string[], options: CompilerOptions): void {
        const program = ts.createProgram(fileNames, options);
        const emitResult = program.emit();

        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

        allDiagnostics.forEach((diagnostic: Diagnostic) => {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            } else {
                console.log(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
            }
        });
    }
}
