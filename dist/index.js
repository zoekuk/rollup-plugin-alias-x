'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _without = require('lodash/fp/without');

var _without2 = _interopRequireDefault(_without);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const noop = () => null;

const existsOnFilesystem = function (uri) {
  try {
    return _fs2.default.statSync(uri).isFile();
  } catch (e) {
    return false;
  }
};

const removeAlias = (alias, importee) => importee.replace(alias, '');

const hasSlashAfterAlias = (key, importee) => importee.substring(key.length).startsWith('/');

const aliasUsedInImportee = importee => alias => {
  if (importee === alias) return true;
  return importee.startsWith(alias) && hasSlashAfterAlias(alias, importee);
};

const isExtension = ext => _path2.default.basename(ext) === ext;

const addExtension = (filePath, ext) => _path2.default.format({
  dir: _path2.default.dirname(filePath),
  name: _path2.default.basename(filePath),
  ext
});

const addResolveeToPath = importeePath => resolvee => {
  return isExtension(resolvee) ? addExtension(importeePath, resolvee) : _path2.default.join(importeePath, resolvee);
};

const plugin = (options = {}) => {

  let resolve = ['.js', './index.js'];
  if (Array.isArray(options.resolve)) resolve = resolve.concat(options.resolve);

  const aliasKeys = (0, _without2.default)(['resolve'], Object.keys(options));

  if (!aliasKeys.length) return { resolveId: noop };

  return {
    resolveId(importee, importer) {

      const alias = aliasKeys.find(aliasUsedInImportee(importee));
      if (!alias) return null;

      const targetPath = options[alias];

      const absolutePathToImportee = _path2.default.join(targetPath, removeAlias(alias, importee));

      const found = resolve.map(addResolveeToPath(absolutePathToImportee)).find(existsOnFilesystem);

      if (found) return found;

      return absolutePathToImportee;
    }
  };
};

exports.default = plugin;