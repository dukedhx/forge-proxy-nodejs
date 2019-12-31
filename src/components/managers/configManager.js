const UrlPattern = require('url-pattern')
const config = require('../loaders/configLoader')
const collections = ['clientProfile', 'authProfile', 'cacheConfig'].reduce((o, e) => (Object.assign(o, { [e]: config.buildCollection(e) })), {})

function getConfigFromCollection (id, colName) {
  const obj = collections[colName]
  return Object.assign(collections[obj.parent] || {}, obj)
}

function checkPath (path, pattern) {
  return new UrlPattern(pattern).match(path)
}

module.exports = {
  getCacheConfigByPath: (cacheProfile, path) => {
    let cacheConfig
    cacheProfile.cacheConfig.forEach(e => {
      if (!cacheConfig) {
        (e.path.forEach ? e.path : [e.path]).forEach(pattern => {
          if (!cacheConfig && checkPath(path, pattern)) { cacheConfig = e }
        })
      }
    })
    return cacheConfig
  },
  getCacheConfigByClientId: id => getConfigFromCollection(getConfigFromCollection(id, 'clientProfile').cacheConfig, 'cacheConfig')[id],
  getConfig: config.getConfig,
  getAuthProfileByClientId: id => getConfigFromCollection(getConfigFromCollection(id, 'clientProfile').authProfile, 'authProfile')[id]
}
