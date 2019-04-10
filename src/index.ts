import { GenerateOptions } from 'escodegen'
import { StringMap } from './types'
import { replaceImports, replaceExports } from './replace'

export const pack = ( map: StringMap, options?: GenerateOptions ) => {
  if( !( 'index.js' in map ) )
    throw Error( 'Expected index.js entry point' )

  let imports: string[] = []

  Object.keys( map ).forEach( key => {
    map[ key ] = replaceImports( key, map, options )

    if ( key !== 'index.js' ) {
      map[ key ] = replaceExports( key, map, options )
      imports.push( `// ${ key }\n` )
      imports.push( map[ key ] )
      imports.push( '\n\n' )
    }
  } )

  return imports.join( '' ) + '// index.js\n' + map[ 'index.js' ]
}
