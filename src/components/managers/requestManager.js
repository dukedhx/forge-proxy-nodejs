const configManager = require('./configManager')
const cacheManager = require('./cacheManager')
const CacheObject = cacheManager.CacheObject
const cacheHeaderName = 'x-forge-cache'

function getHeader (req, name) {
  return (req.headers || {})[name] || ''
}

function setHeaders (entity, name, value) {
  if (typeof entity.headers === 'object')entity.headers[name] = value
  else if (typeof entity.header === 'function')entity.header(name, value)
}

function getClientId (req) {
  return getHeader(req, 'x-forge-proxyclientid')
}

function getCacheIdFromRequest (req) {
  return getClientId(req) + ':' + req.params.path
}

function getCacheConfigFromRequest (req) {
  const cacheProfile = configManager.getCacheConfigByClientId(getClientId(req))
  if (cacheProfile) { return configManager.getCacheConfigByPath(cacheProfile, req.params.path) }
}

async function getCacheObjectFromRequest (req) {
  if (getCacheConfigFromRequest(req)) { return cacheManager.getCacheObject(getCacheIdFromRequest(req)) }
}

module.exports = {
  setHeaders: (entity, header, value) => {
    if (typeof header === 'object') {
      const namevals = Object.entries(header)
      let i = 0
      while (i < namevals.length) { setHeaders(entity, namevals[i++], namevals[i++]) }
    } else setHeaders(entity, header, value)
  },
  getHeader,
  getCacheIdFromRequest,
  getHost: req => req.url.protocol + '//' + req.url.host,
  checkIfShouldCache: res => res.headers[cacheHeaderName] != 'true' && res.statusCode < 300,
  getCacheObjectFromRequest,
  getCacheConfigFromRequest,
  getCacheObjectFromResponse: (req, res, config) => new CacheObject({ content: res, id: getCacheIdFromRequest(req), age: config.age, cacheType: config.type, contentType: res.headers['Content-Type'] }),
  getResponseFromCache: async (req, h) => {
    const cacheObject = await getCacheObjectFromRequest(req)
    const response = h.response(await cacheManager.get(cacheObject)).header(cacheHeaderName, 'true')
    return cacheObject.contentType ? response.headers('Content-Type', cacheObject.contentType) : response
  },
  getAuthProfileFromRequest: req => configManager.getAuthProfileByClientId(getClientId(req))
}
