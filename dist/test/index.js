"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const files_1 = require("@mojule/files");
const __1 = require("..");
const utils_1 = require("../utils");
const replace_1 = require("../replace");
const readJs = async (path) => {
    const bufferMap = await files_1.readPathBufferMap(path);
    const jsPaths = {};
    Object.keys(bufferMap).forEach(path => {
        if (!path.endsWith('.js'))
            return;
        jsPaths[path] = bufferMap[path].toString('utf8');
    });
    return jsPaths;
};
describe('goonpack', () => {
    describe('pack', () => {
        it('packs', async () => {
            const map = await readJs('./src/test/fixtures');
            const source = __1.pack(map);
            const fn = Function(source + '; return [ a, b, c, d, e ]');
            const result = fn();
            assert.deepEqual(result, ['a', 'b', 'c', 'd', 'e']);
        });
        it('Expected index.js entry point', () => {
            assert.throws(() => __1.pack({}), {
                message: 'Expected index.js entry point'
            });
        });
    });
    describe('replace', () => {
        describe('replaceImports', () => {
            it('Unexpected ImportNamespaceSpecifier', () => {
                const map = {
                    'index.js': 'import * as foo from "foo"',
                    'foo.js': 'export const foo = 1'
                };
                assert.throws(() => replace_1.replaceImports('index.js', map), {
                    message: 'Unexpected ImportNamespaceSpecifier'
                });
            });
            it('Expected local name to match imported name', () => {
                const map = {
                    'index.js': 'import { foo as bar } from "foo"',
                    'foo.js': 'export const foo = 1'
                };
                assert.throws(() => replace_1.replaceImports('index.js', map), {
                    message: 'Expected local name to match imported name'
                });
            });
        });
        describe('replaceExports', () => {
            it('Unexpected ExportDefaultDeclaration', () => {
                const map = {
                    'index.js': 'import { foo } from "foo"',
                    'foo.js': 'const foo = 1; export default foo'
                };
                assert.throws(() => replace_1.replaceExports('foo.js', map), {
                    message: 'Unexpected ExportDefaultDeclaration'
                });
            });
            it('Unexpected ArrayPattern', () => {
                const map = {
                    'index.js': 'import { a, b, c } from "foo"',
                    'foo.js': 'const foo = [ 1, 2, 3 ]; export const [ a, b, c ] = foo'
                };
                assert.throws(() => replace_1.replaceExports('foo.js', map), {
                    message: 'Unexpected ArrayPattern'
                });
            });
            it('Expected local name to match imported name', () => {
                const map = {
                    'index.js': 'import { bar } from "foo"',
                    'foo.js': 'const foo = 1; export { foo as bar }'
                };
                assert.throws(() => replace_1.replaceExports('foo.js', map), {
                    message: 'Expected local name to match exported name'
                });
            });
        });
    });
    describe('utils', () => {
        const map = {
            'index.js': '',
            'bar/bar.js': ''
        };
        describe('normalizedModuleName', () => {
            it('not in paths', () => {
                assert.strictEqual(utils_1.normalizedModuleName('foo', map), null);
            });
            it('ends with / but not index.js', () => {
                assert.strictEqual(utils_1.normalizedModuleName('bar/', map), null);
            });
        });
        describe('moduleNameToIdentifier', () => {
            it('not in paths', () => {
                assert.throws(() => utils_1.moduleNameToIdentifier('foo', 'bar', map), {
                    message: 'No module found bar'
                });
            });
        });
    });
});
//# sourceMappingURL=index.js.map