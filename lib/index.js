import fs from 'fs'
import without from 'lodash/fp/without'
import path from 'path'

const noop = () => null;

const existsOnFilesystem = function (uri) {
  try {
    return fs.statSync(uri).isFile();
  } catch (e) {
    return false;
  }
}

const removeAlias = (alias, importee) => importee.replace(alias, '')

const hasSlashAfterKey = (key, importee) => 
  importee.substring(key.length).startsWith('/')

const aliasUsedInImportee = (importee) => (key) => {
  if (importee === key) return true
  return importee.startsWith(key) && hasSlashAfterKey(key, importee)
}

const isExtension = (ext) => path.basename(ext) === ext

const addExtension = (filePath, ext) => path.format({
  dir: path.dirname(filePath),
  name: path.basename(filePath),
  ext
})

const addResolveeToPath = (importeePath) => (resolvee) => {
  return isExtension(resolvee) ? 
    addExtension(importeePath, resolvee) :
    path.join(importeePath, resolvee)
}


const plugin = (options = {}) => {

  let resolve = ['.js', './index.js']
  if (Array.isArray(options.resolve)) resolve = resolve.concat(options.resolve)

    const aliasKeys = without(['resolve'], Object.keys(options)) 
  
  // No aliases?
  if (!aliasKeys.length) return { resolveId: noop }

  return {
    resolveId(importee, importer) {

      const alias = aliasKeys.find(aliasUsedInImportee(importee))
      if(!alias) return null

      const targetPath = options[alias]
      
      const absolutePathToImportee = path.join(targetPath, removeAlias(alias, importee))

      const found = resolve.map(addResolveeToPath(absolutePathToImportee))
        .find(existsOnFilesystem)

      if (found) return found

      return absolutePathToImportee
    }
  }
}

export default plugin