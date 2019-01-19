import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { getSystemPath } from '@angular-devkit/core';
import * as ejs from 'ejs';
import { writeFile } from 'fs';
import * as json5 from 'json5';
import * as path from 'path';
import { bindNodeCallback, from, Observable, of, throwError } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
import * as ts from 'typescript';
import { CompilerOptions, Diagnostic, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';
import { IEnvironmentModule, IEnvironmentSchema } from './schema';

export const DEFAULT_TEMPLATE = 'environment.ts.ejs';

// noinspection JSUnusedGlobalSymbols
export default class EnvironmentBuilder implements Builder<IEnvironmentSchema> {
    /**
     * Loads the environment source file by requiring it then returning the corresponding environment.
     * This will give you a full access to the NodeJS and is a potential security risk.
     * Only run trusted scripts here.
     * @param srcModule
     */
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

    private static render(environment: object, model?: string, modelPath?: string, template?: string): Promise<string> {
        // TODO: make json5 options configurable
        const options = {
            quote: '\'',
            space: 4,
        };
        const outputJson = json5.stringify(environment, options);
        const data = { model, modelPath, environment: outputJson };
        let templateToUse = template;
        if (!templateToUse) {
            templateToUse = path.join(__dirname, DEFAULT_TEMPLATE);
        }
        return ejs.renderFile<string>(templateToUse, data);
    }

    // TODO: make compilerOptions configurable and move defaults to a json file to be read for cleanliness
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
        const { src, dotenvConfigOptions, model, modelPath, template, output } = builderConfig.options;

        // This allows a .dotenv file to configure the environment
        require('dotenv').config(dotenvConfigOptions);

        const srcFile = `${getSystemPath(root)}/${src}.ts`;
        this.compile([srcFile], this.compilerOptions);

        const srcModule = `${getSystemPath(root)}/${src}`;
        const environment = EnvironmentBuilder.load(srcModule);

        const renderPromise = EnvironmentBuilder.render(environment, model, modelPath, template);
        const renderObservable = from<string>(renderPromise);

        return renderObservable.pipe(
            flatMap((renderedString, error) => {
                if (error || !output) {
                    return throwError('Invalid Input File');
                }
                const outputFile = `${getSystemPath(root)}/${output}`;
                const writeFileObservableBuilder = bindNodeCallback(writeFile);
                return writeFileObservableBuilder(outputFile, renderedString);
            }),
            map(() => ({ success: true })),
            catchError(() => of({ success: false })),
        );
    }

    /**
     * Compiles a list of typescript files into its javascript equivalent.
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
