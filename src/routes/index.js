const proxy = require('../components/helpers/proxy')
const cache = require('../components/helpers/cache')

module.exports = async server => {
  await proxy.init(server);

  ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].forEach(method => {
    server.route({
      config: {
        cors: {
          origin: ['*'] } },
      method,
      path: proxy.path,
      handler: proxy.handler
    })
    server.route({
      method,
      path: cache.path,
      handler: cache.handler
    })
  })
}
