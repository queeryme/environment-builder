import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { getSystemPath } from '@angular-devkit/core';
import { Observable, of } from 'rxjs';
import * as ts from 'typescript';
import { CompilerOptions, Diagnostic, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';
import { IEnvironmentModule, IEnvironmentSchema } from './schema';
import * as json5 from 'json5';
import * as ejs from 'ejs';

// noinspection JSUnusedGlobalSymbols
export default class EnvironmentBuilder implements Builder<IEnvironmentSchema> {
    // TODO: make compilerOptions configurable
    private readonly compilerOptions: CompilerOptions = {
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

    // noinspection JSUnusedGlobalSymbols
    constructor(private context: BuilderContext) {
    }

    public run(builderConfig: BuilderConfiguration<Partial<IEnvironmentSchema>>): Observable<BuildEvent> {
        const root = this.context.workspace.root;
        const { src, dotenvConfigOptions, model, modelPath } = builderConfig.options;
        require('dotenv').config(dotenvConfigOptions);

        const srcFile = `${getSystemPath(root)}/${src}.ts`;
        this.compile([srcFile], this.compilerOptions);

        const srcModule = `${getSystemPath(root)}/${src}`;
        const environment = EnvironmentBuilder.load(srcModule);

        const options = {
            quote: '\'',
            space: 4,
        };
        const outputJson = json5.stringify(environment, options);
        const data = { model, modelPath, environment: outputJson };
        const renderPromise = ejs.renderFile('./src/environment.ts.ejs', data, (error, str) => {
            console.log('Value is', str);
        });

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

    private static load(srcModule: string): object {
        let srcRequired: IEnvironmentModule;
        try {
            srcRequired = require(srcModule);
            if (!srcRequired.environment) {
                return {};
            }
        } catch (e) {
            return {};
        }
        return srcRequired.environment;
    }

    /**
     * @param fileNames - a list of files that ends with a `ts` to compile
     * @param options - Options used to compile the ts files
     * @see CompilerOptions
     * @see https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
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
