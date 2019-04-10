"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const escodegen_1 = require("escodegen");
const esprima_1 = require("esprima");
const estraverse_1 = require("estraverse");
const utils_1 = require("./utils");
exports.replaceImports = (path, paths, options) => {
    const source = paths[path];
    const ast = esprima_1.parseModule(source);
    estraverse_1.replace(ast, {
        enter: node => {
            if (node.type === 'ImportDeclaration') {
                const from = node.source.value;
                const names = [];
                node.specifiers.forEach(specifier => {
                    if (specifier.type === 'ImportSpecifier') {
                        const { local, imported } = specifier;
                        if (local.name === imported.name) {
                            names.push(local.name);
                        }
                        else {
                            throw Error(`Expected local name to match imported name`);
                        }
                    }
                    else {
                        throw Error(`Unexpected ${specifier.type}`);
                    }
                });
                const id = utils_1.moduleNameToIdentifier(path, from, paths);
                return createVariableDeclaration(names, id);
            }
        }
    });
    return escodegen_1.generate(ast, options);
};
const createVariableDeclaration = (names, id) => {
    const properties = names.map(createProperty);
    const declaration = {
        type: 'VariableDeclaration',
        declarations: [
            {
                type: 'VariableDeclarator',
                id: {
                    type: 'ObjectPattern',
                    properties
                },
                init: {
                    type: 'Identifier',
                    name: id
                }
            }
        ],
        kind: 'const'
    };
    return declaration;
};
exports.replaceExports = (path, paths, options) => {
    const source = paths[path];
    const ast = esprima_1.parseModule(source);
    const names = [];
    estraverse_1.replace(ast, {
        enter: node => {
            if (node.type === 'ExportNamedDeclaration') {
                node.specifiers.forEach(specifier => {
                    const { local, exported } = specifier;
                    if (local.name === exported.name) {
                        names.push(local.name);
                    }
                    else {
                        throw Error(`Expected local name to match exported name`);
                    }
                });
                const { declaration } = node;
                if (declaration) {
                    if (declaration.type === 'ClassDeclaration' ||
                        declaration.type === 'FunctionDeclaration') {
                        names.push(declaration.id.name);
                    }
                    if (declaration.type === 'VariableDeclaration') {
                        declaration.declarations.forEach(declarator => {
                            const { id } = declarator;
                            if (id.type === 'Identifier') {
                                names.push(id.name);
                            }
                            else {
                                throw Error(`Unexpected ${id.type}`);
                            }
                        });
                    }
                    return declaration;
                }
                return estraverse_1.VisitorOption.Remove;
            }
            if (node.type === 'ExportAllDeclaration' ||
                node.type === 'ExportDefaultDeclaration') {
                throw Error(`Unexpected ${node.type}`);
            }
        }
    });
    const returnStatement = createReturn(names);
    ast.body.push(returnStatement);
    const iife = createIife(utils_1.pathToIdentifier(path), ast);
    return escodegen_1.generate(iife, options);
};
const createReturn = (names) => {
    const properties = names.map(createProperty);
    const statement = {
        type: 'ReturnStatement',
        argument: {
            type: 'ObjectExpression',
            properties
        }
    };
    return statement;
};
const createIife = (name, program) => {
    const { body } = program;
    const callee = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
            type: 'BlockStatement',
            body: body
        },
        generator: false,
        expression: false,
        async: false
    };
    const iife = {
        type: 'VariableDeclaration',
        declarations: [
            {
                type: 'VariableDeclarator',
                id: {
                    type: 'Identifier',
                    name
                },
                init: {
                    type: 'CallExpression',
                    callee,
                    arguments: []
                }
            }
        ],
        kind: 'const'
    };
    program.body = [iife];
    return program;
};
const createProperty = (name) => {
    const prop = {
        type: 'Property',
        key: {
            type: 'Identifier',
            name
        },
        computed: false,
        value: {
            type: 'Identifier',
            name
        },
        kind: 'init',
        method: false,
        shorthand: true
    };
    return prop;
};
//# sourceMappingURL=replace.js.map