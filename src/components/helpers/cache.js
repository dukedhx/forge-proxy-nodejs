const requestManager = require('../managers/requestManager')
const tools = require('../../utils/tools')

const cachePathPrefix = tools.getRandomString(2)

module.exports = {
  handler: async function (request, h) {
    request.server.log('Cache served for: ', request.params.path)
    return requestManager.getResponseFromCache(request, h)
  },
  path: '/' + cachePathPrefix + '/{path*}',
  cachePathPrefix
}
