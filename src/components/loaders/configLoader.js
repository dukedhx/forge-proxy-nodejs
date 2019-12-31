const config = require('config')

module.exports = {
  getConfig: id => config.has(id) ? config.get(id) : '',
  buildCollection: function (colName) {
    return config.get(colName).reduce((o, e) => {
      o[e.id] = e
      delete o[e.id].id
      return o
    }, {})
  }
}
