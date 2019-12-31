const path = require('path')

const kvStore = require('../stores/kvStore')
const flatStore = require('../stores/flatStore')
const tools = require('../../utils/tools')
const cachePromises = require('../stores/promiseStore').createStore('cache')
const allowTypes = ['string', 'binary']
const cachePath = path.join(path.dirname(require.main.filename), '../cache')
const serializer = require('../helpers/serializer')

class CacheObject {
  init (obj) {
    this.id = obj.id
    this.content = obj.content
    this.contentType = obj.contentType
    this.cacheType = allowTypes.includes(obj.cacheType) ? obj.cacheType : allowTypes[0]
    this.age = obj.age || Infinity
  }
  constructor (id, content, age, cacheType, contentType) {
    this.init(typeof id === 'object' ? id : { id, content, age, cacheType, contentType })
  }
}

function putStoreObject (id, obj) {
  kvStore.putObject(id, obj)
  return obj
}

async function getStoreObject (id) {
  return kvStore.getObject(id)
}

async function getValidStoreObject (id) {
  const result = typeof id === 'string' ? await getStoreObject(id) : id
  if (result && checkAge(result.age)) { return result }
}

function getAge (age, unit) {
  let exponent = 1000
  switch (unit) {
    case 'm': exponent *= 60; break
    case 'd': exponent *= 60 * 24; break
    case 't': exponent = 1
  }
  return Date.now() + age * exponent
}

function deleteObject (id) {
  kvStore.delete(id)
}

function deleteStream (id, path) {
  deleteObject(id)
  flatStore.delete(path)
}

async function processContent (cacheObject) {
  const result = cacheObject.content
  return result instanceof Promise ? cachePromises.put(cacheObject.id, result) : result
}

function getCachePath (fileName) {
  return path.join(cachePath, fileName || tools.getRandomString(1))
}

function checkAge (age) {
  return isNaN(age) ? false : (age === null || age > Date.now())
}

function serializeCacheObject ({ age, contentType, cacheType }, obj) {
  return Object.assign({ age: getAge(age), contentType, cacheType }, obj || {})
}

module.exports = {
  CacheObject,
  getCacheObject: getValidStoreObject,
  get: async function (id) {
    const result = await getValidStoreObject(id)
    if (result) { return result.cacheType == 'binary' ? flatStore.getFileStream(getCachePath(result.content)) : tools.convertToString(result.content) }
    deleteObject(id)
  },
  getString: async function (id) {
    const result = await getValidStoreObject(id)
    if (result) { return tools.convertToString(result.content) }
    deleteObject(id)
  },
  getObject: async function (id) {
    const result = await getValidStoreObject(id)
    if (result) { return tools.convertToObject(result.content) }
    deleteObject(id)
  },
  getStream: function (id) {
    const result = getValidStoreObject(id)
    if (result) { return result.cacheType == 'binary' ? flatStore.getFileStream(result.content) : serializer.getStream(getCachePath(result.content)) }
    deleteObject(id)
  },
  putString: async function (cacheObject) {
    return putStoreObject(cacheObject.id, serializeCacheObject(cacheObject, { cacheType: 'string', content: (await processContent(cacheObject)).toString() }))
  },
  putStream: async function (cacheObject) {
    const fileName = tools.getRandomString(1)
    const filePath = getCachePath(fileName)
    const result = await flatStore.writeFile(filePath, await processContent(cacheObject))
    return putStoreObject(cacheObject.id, serializeCacheObject(cacheObject, { cacheType: 'binary', content: fileName }))
  },
  putObject: async function (cacheObject) {
    const content = await processContent(cacheObject)
    return putStoreObject(cacheObject.id, serializeCacheObject(cacheObject, { cacheType: 'string', content: tools.convertToObject(content) }))
  },
  put: async function (cacheObject) {
    return putStoreObject(cacheObject.id, serializeCacheObject(cacheObject, { content: await processContent(cacheObject) }))
  },
  delete: deleteObject,
  clearDBExpired: () => {},
  clearFlatExpired: () => {}
}
