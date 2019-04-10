"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const snakeCase = require("lodash.snakecase");
const { normalize, parse, join } = path_1.posix;
exports.normalizedModuleName = (path, paths) => {
    const normalPath = normalize(path);
    if (normalPath in paths)
        return normalPath;
    if (normalPath.endsWith('/')) {
        const indexPath = normalPath + 'index.js';
        if (indexPath in paths)
            return indexPath;
        return null;
    }
    const jsPath = normalPath + '.js';
    if (jsPath in paths)
        return jsPath;
    const indexPath = normalPath + '/index.js';
    if (indexPath in paths)
        return indexPath;
    return null;
};
exports.moduleNameToIdentifier = (path, moduleName, paths) => {
    const parsed = parse(path);
    const fullPath = join(parsed.dir, moduleName);
    const normalized = exports.normalizedModuleName(fullPath, paths);
    if (!normalized)
        throw Error(`No module found ${fullPath}`);
    return exports.pathToIdentifier(normalized);
};
exports.pathToIdentifier = (path) => {
    return `__${snakeCase(path.replace(/\.js$/, ''))}`;
};
//# sourceMappingURL=utils.js.map