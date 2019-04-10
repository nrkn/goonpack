"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replace_1 = require("./replace");
exports.pack = (map, options) => {
    if (!('index.js' in map))
        throw Error('Expected index.js entry point');
    let imports = [];
    Object.keys(map).forEach(key => {
        map[key] = replace_1.replaceImports(key, map, options);
        if (key !== 'index.js') {
            map[key] = replace_1.replaceExports(key, map, options);
            imports.push(`// ${key}\n`);
            imports.push(map[key]);
            imports.push('\n\n');
        }
    });
    return imports.join('') + '// index.js\n' + map['index.js'];
};
//# sourceMappingURL=index.js.map