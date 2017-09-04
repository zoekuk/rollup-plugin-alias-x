import { isFunction } from 'lodash'
import path from 'path'

import alias from '..'

describe('lib', () => {

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

  describe('works in rollup', () => {

    test('todo')
  })
})
