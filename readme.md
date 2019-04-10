# goonpack

A module bundler, like [webpack](https://webpack.js.org/) or
[browserify](http://browserify.org/), except *extremely* basic

## install

`npm install goonpack`

## features

- ✔️ basic af
- ✔️ produces readable output
- ✔️ TypeScript types
- ✔️ 100% test coverage
- ✔️ not horribly slow
- ❌ single entry point
- ❌ only supports ES modules
- ❌ only supports very simple imports and exports
- ❌ JSON imports? Nope.
- ❌ no filesystem support, do that yourself
- ❌ source maps? Ahahaha, no.

## why would I use this, who is it for?

No sane or reasonable person, you should really use webpack or browserify or
whatever.

That aside, sometimes, not often, but sometimes I have a very simple little app
with no external dependencies, and I want to bundle it into a single file for
the browser or whatever. The output from webpack et al is pretty ugly, and I
thought it would be fun to write something that produced a fairly clean and
readable output file.

I'm lazy, so I limited the scope very heavily to make it easy to implement.

## usage

```js
const { pack } = require( 'goonpack' )
// or import { pack } from 'goonpack'

/*
  yep, no filesystem support, if your modules are on disk, read them into a
  structure like this
*/
const map = {
  "index.js": "import { foo } from './foo'\nconsole.log( foo )",
  "foo/index.js": "export const foo = 'foo'"
}

// just a string with the bundle source
const source = pack( map )
```

You can also pass
[escodegen options](https://github.com/estools/escodegen/wiki/API) to `pack` as
the second argument:

```js
const source = pack( map, {
  format: {
    indent: '  '
  },
  semicolons: false
})
```

This will produce an output script something like this:

```js
// foo/index.js
const __foo_index = (()=>{
  const foo = 'foo'

  return { foo }
})()

// index.js
const { foo } = __foo_index
console.log( foo )
```

## is there an easy way to turn a folder into the map expected by pack?

`npm install @mojule/files`

```js
const { readPathBufferMap } = require( '@mojule/files' )

const readFolder = async ( path ) => {
  const bufferMap = await readPathBufferMap( path )

  const map = {}

  Object.keys( bufferMap ).forEach( path => {
    if ( !path.endsWith( '.js' ) ) return

    map[ path ] = bufferMap[ path ].toString( 'utf8' )
  } )

  return map
}
```

## support

### exports

- ✔️ `export { name1, name2, …, nameN };`
- ❌ `export { variable1 as name1, variable2 as name2, …, nameN };`
- ️✔️️️ `export let name1, name2, …, nameN; // also var, const`
- ✔️ `export let name1 = …, name2 = …, …, nameN; // also var, const`
- ✔️ ️`export function FunctionName(){...}`
- ✔️ `export class ClassName {...}`
- ❌ `export default expression;`
- ❌ `export default function (…) { … } // also class, function*`
- ❌ `export default function name1(…) { … } // also class, function*`
- ❌ `export { name1 as default, … };`
- ❌ `export * from …;`
- ❌ `export { name1, name2, …, nameN } from …;`
- ❌ `export { import1 as name1, import2 as name2, …, nameN } from …;`
- ❌ `export { default } from …;`

### imports

- ❌ `import defaultExport from "path";`
- ❌ `import * as name from "path";`
- ️️️✔️ `import { export } from "path";`
- ❌ `import { export as alias } from "path";`
- ✔️ `import { export1 , export2 } from "path";`
- ❌ `import { export1 , export2 as alias2 , [...] } from "path";`
- ❌ `import defaultExport, { export [ , [...] ] } from "path";`
- ❌ `import defaultExport, * as name from "path";`
- ❌ `import "path";`

## license

MIT License

Copyright (c) 2018 Nik Coughlin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.