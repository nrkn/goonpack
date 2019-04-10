import { GenerateOptions, generate } from 'escodegen'
import { parseModule } from 'esprima'
import { replace, VisitorOption } from 'estraverse'

import {
  Property, ReturnStatement, Program, ArrowFunctionExpression,
  VariableDeclaration, AssignmentProperty
} from 'estree'

import { StringMap } from './types'
import { moduleNameToIdentifier, pathToIdentifier } from './utils'

export const replaceImports =
  ( path: string, paths: StringMap, options?: GenerateOptions ) => {
    const source = paths[ path ]
    const ast = parseModule( source )

    replace( ast, {
      enter: node => {
        if ( node.type === 'ImportDeclaration' ) {
          const from = <string>node.source.value
          const names: string[] = []

          node.specifiers.forEach( specifier => {
            if ( specifier.type === 'ImportSpecifier' ) {
              const { local, imported } = specifier

              if ( local.name === imported.name ) {
                names.push( local.name )
              } else {
                throw Error( `Expected local name to match imported name` )
              }
            } else {
              throw Error( `Unexpected ${ specifier.type }` )
            }
          } )

          const id = moduleNameToIdentifier( path, from, paths )

          return createVariableDeclaration( names, id )
        }
      }
    } )

    return generate( ast, options )
  }

const createVariableDeclaration = ( names: string[], id: string ) => {
  const properties = <AssignmentProperty[]>names.map( createProperty )

  const declaration: VariableDeclaration = {
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
  }

  return declaration
}

export const replaceExports =
  ( path: string, paths: StringMap, options?: GenerateOptions ) => {
    const source = paths[ path ]
    const ast = parseModule( source )
    const names: string[] = []

    replace( ast, {
      enter: node => {
        if ( node.type === 'ExportNamedDeclaration' ) {
          node.specifiers.forEach( specifier => {
            const { local, exported } = specifier

            if ( local.name === exported.name ) {
              names.push( local.name )
            } else {
              throw Error( `Expected local name to match exported name` )
            }
          } )

          const { declaration } = node

          if ( declaration ) {
            if (
              declaration.type === 'ClassDeclaration' ||
              declaration.type === 'FunctionDeclaration'
            ) {
              names.push( declaration.id!.name )
            }

            if ( declaration.type === 'VariableDeclaration' ) {
              declaration.declarations.forEach( declarator => {
                const { id } = declarator

                if( id.type === 'Identifier' ){
                  names.push( id.name )
                } else {
                  throw Error( `Unexpected ${ id.type }`)
                }
              })

            }

            return declaration
          }

          return VisitorOption.Remove
        }

        if(
          node.type === 'ExportAllDeclaration' ||
          node.type === 'ExportDefaultDeclaration'
        ){
          throw Error( `Unexpected ${ node.type }` )
        }
      }
    } )

    const returnStatement = createReturn( names )

    ast.body.push( returnStatement )

    const iife = createIife( pathToIdentifier( path ), ast )

    return generate( iife, options )
  }

const createReturn = ( names: string[] ) => {
  const properties = names.map( createProperty )

  const statement: ReturnStatement = {
    type: 'ReturnStatement',
    argument: {
      type: 'ObjectExpression',
      properties
    }
  }

  return statement
}

const createIife = ( name: string, program: Program ) => {
  const { body } = program

  const callee: ArrowFunctionExpression = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: {
      type: 'BlockStatement',
      body: <any>body
    },
    generator: false,
    expression: false,
    async: false
  }

  const iife: VariableDeclaration = {
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
  }

  program.body = [ iife ]

  return program
}

const createProperty = ( name: string ) => {
  const prop: Property = {
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
  }

  return prop
}

type LocalExportedName = [ string, string ]