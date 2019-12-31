
const Hapi = require('@hapi/hapi')
const logger = require('./components/helpers/logger')
const routes = require('./routes');

(async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    compression: false
  })

  await logger.init(server)
  await routes(server)

  await server.start()
  const startMsg = 'Server running on ' + server.info.uri
  console.log(startMsg)
  server.log(startMsg)
  if (process.argv[2] == 'test')server.stop()
})()
