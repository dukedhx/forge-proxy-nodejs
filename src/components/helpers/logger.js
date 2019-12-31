process.on('unhandledRejection', err => {
  console.log(err)
})

module.exports = {
  init: async server => {
    await server.register({
      plugin: require('hapi-error')
    })

    await server.register({
      plugin: require('@hapi/good'),
      options: {

        reporters: {
          myReporter: [
            {
              module: '@hapi/good-squeeze',
              name: 'SafeJson'
            },
            {
              module: 'rotating-file-stream',
              args: ['./logs/server.log', {
                size: '1M'
              }]
            }
          ]
        }
      }
    })
  }
}
