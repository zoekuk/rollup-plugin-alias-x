import { isFunction } from 'lodash'
import path from 'path'
import { rollup } from 'rollup'

import alias from '..'

describe('plugin', () => {

  test('returns a resolveId function', () => {
    const result = alias()
    expect(result).toBeTruthy()
    expect(result.resolveId).toBeDefined()
    expect(isFunction(result.resolveId)).toBeTruthy()
  })

  test('resolveId is noop if no aliases specified', () => {
    const plugin = alias()
    expect(plugin).toBeTruthy()
    const result = plugin.resolveId('lib/main', __filename)
    expect(result).toBeNull()
  })

  describe ('alias', () => {
    let plugin

    beforeAll(() => {
      plugin = alias({
        lib: path.resolve(__dirname, './files')
      })
    })

    test('is resolved to .js', () => {
      const result = plugin.resolveId('lib/main', __filename)
      expect(result).toEqual(path.resolve(__dirname, './files/main.js'))
    })
  
    test('is resolved to index.js', () => {
      const result = plugin.resolveId('lib/folder', __filename)
      expect(result).toEqual(path.resolve(__dirname, './files/folder/index.js'))
    })
  
    test('is resolves file first', () => {
      const result = plugin.resolveId('lib/file-first', __filename)
      expect(result).toEqual(path.resolve(__dirname, './files/file-first.js'))
    })
  
    test('is unresolved if file not on filesystem', () => {  
      const result = plugin.resolveId('lib/not-exist', __filename)
      expect(result).toEqual(path.resolve(__dirname, './files/not-exist'))
    })

    test('resolves deep folders', () => {  
      const result = plugin.resolveId('lib/deep/and/deeper', __filename)
      expect(result).toEqual(path.resolve(__dirname, './files/deep/and/deeper/index.js'))
    })

  })

  describe('resolve property', () => {

    let plugin
    
    beforeAll(() => {
      plugin = alias({
        lib: path.resolve(__dirname, './files'),
        resolve: ['.jsx']
      })
    })

    test('custom extension are resolved', () => {
      const result = plugin.resolveId('lib/component', __filename)
      expect(result).toEqual(path.resolve(__dirname, './files/component.jsx'))
    })
    
    test('.js takes precdence over custom extension', () => {
      const result = plugin.resolveId('lib/componentA', __filename)
      expect(result).toEqual(path.resolve(__dirname, './files/componentA.js'))
    })
    
  })

  describe('using rollup', () => {

    // test(t =>
    //   rollup({
    //     entry: './files/index.js',
    //     plugins: [alias({
    //       fancyNumber: './aliasMe',
    //       './anotherFancyNumber': './localAliasMe',
    //       numberFolder: './folder',
    //       './numberFolder': './folder',
    //     })],
    //   }).then(stats => {
    //     t.is(stats.modules[0].id.endsWith('/files/nonAliased.js'), true);
    //     t.is(stats.modules[1].id.endsWith('/files/aliasMe.js'), true);
    //     t.is(stats.modules[2].id.endsWith('/files/localAliasMe.js'), true);
    //     t.is(stats.modules[3].id.endsWith('/files/folder/anotherNumber.js'), true);
    //     t.is(stats.modules[4].id.endsWith('/files/index.js'), true);
    //     t.is(stats.modules.length, 5);
    //   })
    
    test('works within rollup', () => {
      return rollup({
        input: path.resolve(__dirname, './files/main.js'),
        plugins: [
          alias ({
            resolve: ['.jsx'],
            app: path.resolve(__dirname, 'files'),
            deepAnd: path.resolve(__dirname, 'files/deep/and')
          })
        ]
      }).then(stats => {
        expect(stats).toBeTruthy()

        const { modules } = stats
        expect(Array.isArray(modules)).toBeTruthy()
        expect(modules.length).toEqual(4)
        expect(modules[0].id).toEqual(path.resolve(__dirname, './files/folder/index.js'))
        expect(modules[1].id).toEqual(path.resolve(__dirname, './files/deep/and/deeper/index.js'))
        expect(modules[2].id).toEqual(path.resolve(__dirname, './files/component.jsx'))
        expect(modules[3].id).toEqual(path.resolve(__dirname, './files/main.js'))
      })
    })
  })
})
