import { posix } from 'path'
import snakeCase = require( 'lodash.snakecase' )
import { StringMap } from './types'

const { normalize, parse, join } = posix

export const normalizedModuleName = ( path: string, paths: StringMap ) => {
  const normalPath = normalize( path )

  if ( normalPath in paths ) return normalPath

  if ( normalPath.endsWith( '/' ) ) {
    const indexPath = normalPath + 'index.js'

    if ( indexPath in paths ) return indexPath

    return null
  }

  const jsPath = normalPath + '.js'

  if ( jsPath in paths ) return jsPath

  const indexPath = normalPath + '/index.js'

  if ( indexPath in paths ) return indexPath

  return null
}

export const moduleNameToIdentifier =
  ( path: string, moduleName: string, paths: StringMap ) => {
    const parsed = parse( path )
    const fullPath = join( parsed.dir, moduleName )
    const normalized = normalizedModuleName( fullPath, paths )

    if ( !normalized ) throw Error( `No module found ${ fullPath }` )

    return pathToIdentifier( normalized )
  }

export const pathToIdentifier = ( path: string ) => {
  return `__${ snakeCase( path.replace( /\.js$/, '' ) ) }`
}
