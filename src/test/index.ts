import * as assert from 'assert'
import { readPathBufferMap } from '@mojule/files'
import { StringMap } from '../types'
import { pack } from '..'
import { normalizedModuleName, moduleNameToIdentifier } from '../utils'
import { replaceImports, replaceExports } from '../replace'

const readJs = async ( path: string ) => {
  const bufferMap = await readPathBufferMap( path )

  const jsPaths: StringMap = {}

  Object.keys( bufferMap ).forEach( path => {
    if ( !path.endsWith( '.js' ) ) return

    jsPaths[ path ] = bufferMap[ path ].toString( 'utf8' )
  } )

  return jsPaths
}

describe( 'goonpack', () => {
  describe( 'pack', () => {
    it( 'packs', async () => {
      const map = await readJs( './src/test/fixtures' )

      const source = pack( map )

      const fn = Function( source + '; return [ a, b, c, d, e ]' )

      const result = fn()

      assert.deepEqual( result, [ 'a', 'b', 'c', 'd', 'e' ] )
    } )

    it( 'Expected index.js entry point', () => {
      assert.throws(
        () => pack( {} ),
        {
          message: 'Expected index.js entry point'
        }
      )
    } )
  } )

  describe( 'replace', () => {
    describe( 'replaceImports', () => {
      it( 'Unexpected ImportNamespaceSpecifier', () => {
        const map = {
          'index.js': 'import * as foo from "foo"',
          'foo.js': 'export const foo = 1'
        }

        assert.throws(
          () => replaceImports( 'index.js', map ),
          {
            message: 'Unexpected ImportNamespaceSpecifier'
          }
        )
      } )

      it( 'Expected local name to match imported name', () => {
        const map = {
          'index.js': 'import { foo as bar } from "foo"',
          'foo.js': 'export const foo = 1'
        }

        assert.throws(
          () => replaceImports( 'index.js', map ),
          {
            message: 'Expected local name to match imported name'
          }
        )
      } )
    } )

    describe( 'replaceExports', () => {
      it( 'Unexpected ExportDefaultDeclaration', () => {
        const map = {
          'index.js': 'import { foo } from "foo"',
          'foo.js': 'const foo = 1; export default foo'
        }

        assert.throws(
          () => replaceExports( 'foo.js', map ),
          {
            message: 'Unexpected ExportDefaultDeclaration'
          }
        )
      } )

      it( 'Unexpected ArrayPattern', () => {
        const map = {
          'index.js': 'import { a, b, c } from "foo"',
          'foo.js': 'const foo = [ 1, 2, 3 ]; export const [ a, b, c ] = foo'
        }

        assert.throws(
          () => replaceExports( 'foo.js', map ),
          {
            message: 'Unexpected ArrayPattern'
          }
        )
      } )

      it( 'Expected local name to match imported name', () => {
        const map = {
          'index.js': 'import { bar } from "foo"',
          'foo.js': 'const foo = 1; export { foo as bar }'
        }

        assert.throws(
          () => replaceExports( 'foo.js', map ),
          {
            message: 'Expected local name to match exported name'
          }
        )
      } )
    } )
  } )

  describe( 'utils', () => {
    const map = {
      'index.js': '',
      'bar/bar.js': ''
    }

    describe( 'normalizedModuleName', () => {
      it( 'not in paths', () => {
        assert.strictEqual( normalizedModuleName( 'foo', map ), null )
      } )

      it( 'ends with / but not index.js', () => {
        assert.strictEqual( normalizedModuleName( 'bar/', map ), null )
      } )
    } )

    describe( 'moduleNameToIdentifier', () => {
      it( 'not in paths', () => {
        assert.throws(
          () => moduleNameToIdentifier( 'foo', 'bar', map ),
          {
            message: 'No module found bar'
          }
        )
      } )
    } )
  } )
} )
