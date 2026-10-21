import ts from 'typescript';
import type { Plugin } from 'vite';

// Nest's dependency injection and ValidationPipe need the decorator metadata
// emitted by TypeScript. Vite's default transformer does not emit it.
export function nestTypescript(): Plugin {
  return {
    name: 'nest-typescript-metadata',
    enforce: 'pre',
    transform(source, id) {
      if (!id.endsWith('.ts') || id.includes('/node_modules/')) {
        return;
      }

      const result = ts.transpileModule(source, {
        fileName: id,
        compilerOptions: {
          target: ts.ScriptTarget.ES2023,
          module: ts.ModuleKind.ESNext,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          esModuleInterop: true,
          sourceMap: true,
          inlineSources: true,
        },
      });

      return { code: result.outputText, map: result.sourceMapText };
    },
  };
}
