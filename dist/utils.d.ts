import { StringMap } from './types';
export declare const normalizedModuleName: (path: string, paths: StringMap) => string | null;
export declare const moduleNameToIdentifier: (path: string, moduleName: string, paths: StringMap) => string;
export declare const pathToIdentifier: (path: string) => string;
