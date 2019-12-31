const serializer = require('../helpers/serializer')

module.exports = {
  writeFile: async (path, stream) => {
    const fileStream = serializer.writeStreamToPath(path, stream)
    return new Promise(resolve => fileStream.on('end', () => resolve()))
  },
  getFileStream: serializer.getStreamFromPath,
  deleteFile: serializer.deleteFile
}
