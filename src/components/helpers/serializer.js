const PassThrough = require('stream').PassThrough
const Readable = require('stream').Readable
const hypertrie = require('hypertrie')
const db = hypertrie('./db', { valueEncoding: 'json' })
const fs = require('fs')

function getDBItem (id) {
  return new Promise(resolve => db.get(id, (err, result) => resolve((result || {}).value)))
}

module.exports = {
  getDBObject: async id => getDBItem(id),
  getStream: content => {
    const stream = new Readable()
    stream.push(content)
    stream.push(null)
    return stream
  },
  putDBObject: (id, payload) => db.put(id, payload, { condition: (oldNode, newNode, cb) => { cb(null, true) } }),
  deleteObject: id => db.del(id),
  writeStreamToPath: (path, stream) => {
    const pt = new PassThrough()
    stream.pipe(pt)
    pt.pipe(fs.createWriteStream(path))
    return pt
  },
  getStreamFromPath: path => fs.createReadStream(path),
  deleteFile: path => fs.unlink(path)

}
