# rollup-plugin-alias-x

Rollup plugin that supports module aliases and works cross-platform. Use it to avoid relative path import hell — go from this:

```js
import moduleA from '../../../modules/moduleA'
```

to this:

```js
import moduleA from 'modules/moduleA'
```

Useful when refactoring.

## Installation

```sh
$ npm install --save-dev rollup-plugin-alias-x
```

## Usage

```js
import { rollup } from 'rollup'
import alias from 'rollup-plugin-alias-x'

//...
rollup({
  input: path.resolve(__dirname, './src/app.js'),
  plugins: [
    alias ({
      app: path.resolve(__dirname, './src'),
      packages: path.resolve(__dirname, './packages')
    })
  ]
})
//...
```

This defines `app` and `packages` aliases and allows you to import modules as follows:

```js
import router from 'app/router'
import packageA from 'packages/packageA'
```

### Resolving additional extensions

Out of the box rollup-plugin-alias-x supports `.js` extension and node.js default behaviour on folders (importing `./index.js` in the folders).



```js
//...
rollup({
  input: path.resolve(__dirname, './src/app.js'),
  plugins: [
    alias ({
      resolve: ['.jsx'],
      app: path.resolve(__dirname, './src'),
      packages: path.resolve(__dirname, './packages')
    })
  ]
})
//...
```

**Note**:  
> Internal the `.js` and `./index.js` behaviour is implemented as though resolve is set to `['.js', './index.js']`, any resolve passed in the options is concatenated to this internal resolve.
>
> So in the above example importing `app/main.jsx' the plugin attempts to resolve files in this order:
>
> 1. ./src/main.js
> 2. ./src/main/index.js
> 3. ./src/main.jsx