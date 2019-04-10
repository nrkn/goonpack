import { GenerateOptions } from 'escodegen';
import { StringMap } from './types';
export declare const replaceImports: (path: string, paths: StringMap, options?: GenerateOptions | undefined) => string;
export declare const replaceExports: (path: string, paths: StringMap, options?: GenerateOptions | undefined) => string;
