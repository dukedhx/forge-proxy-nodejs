const H2o2 = require('@hapi/h2o2')
const tokenManager = require('../managers/tokenManager')
const cacheManager = require('../managers/cacheManager')
const requestManager = require('../managers/requestManager')
const configManager = require('../managers/configManager')
const cache = require('../helpers/cache')

module.exports = {
  init: async server => server.register(H2o2),
  path: `${('/' + configManager.getConfig('path_prefix')).replace(new RegExp('^//'), '/').replace(new RegExp('/$'), '')}/{path*}`,
  handler: {
    proxy: {

      mapUri: async req => {
        const cacheObject = await requestManager.getCacheObjectFromRequest(req)
        req.server.log('Received request for: ', req.params.path)
        if (cacheObject) { return { headers: { 'x-forge-proxyclientid': req.headers['x-forge-proxyclientid'] }, uri: new URL('/' + cache.cachePathPrefix + '/' + req.params.path, requestManager.getHost(req)).href } }

        const token = await tokenManager.getTokenAsync(requestManager.getAuthProfileFromRequest(req))
        return { headers: { authorization: 'Bearer ' + token }, uri: new URL(req.params.path, configManager.getConfig('forge_host')).href }
      },
      onResponse: async function (err, res, request, h, settings, ttl) {
        request.server.log('Received response for: ', request.params.path)
        if (requestManager.checkIfShouldCache(res)) {
          const cacheConfig = await requestManager.getCacheConfigFromRequest(request)
          cacheConfig && cacheManager.putStream(requestManager.getCacheObjectFromResponse(request, res, cacheConfig))
        }
        return res
      }
    }

  }
}
