const serializer = require('../helpers/serializer')
const mappings = {}
const mpprefix = 'keyMappings:'
function updateMappings (name, item) {
  const key = mpprefix + name
  const mapping = mappings[name]
  serializer.putDBObject(key, Object.assign(serializer.get(key) || {}, { [item[mapping.key]]: item[mapping.value] }))
}
module.exports = {
  createMapping: (name, value) => {
    mappings[name] = value
  },
  removeMapping: name => {
    delete mappings[name]
    serializer.removeDBEntry(mpprefix + name)
  },
  getMappedValues: name => {},
  delete: serializer.deleteObject,
  getString: serializer.getDBString,
  getObject: async id => serializer.getDBObject(id),
  putString: (key, value, mappingName) => {
    if (mappings[mappingName]) { updateMappings(value) }
    serializer.putDBString(key, value)
  },
  putObject: (key, value, mappingName) => {
    if (mappings[mappingName]) { updateMappings(value) }
    serializer.putDBObject(key, value)
  },
  removeEntry: serializer.removeDBEntry,
  backup: () => {},
  reset: () => {}
}
