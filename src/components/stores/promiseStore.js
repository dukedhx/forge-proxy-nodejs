class promiseStore {
  constructor (name) {
    this.store = {}
    this.name = name
  }
  put (id, cb, force, err, fin) {
    return (!force && this.get(id)) || (this.store[id] = (new Promise(cb)).catch(err || (err => { console.log(err) })).finally(() => {
      delete this.store[id]
      fin && fin()
    }))
  }
  get (id) {
    return this.store[id]
  }
}
module.exports = {
  createStore: name => (new promiseStore(name))
}
