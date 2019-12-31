module.exports = {
  convertToObject: obj => (typeof obj === 'string' ? JSON.parse(obj) : obj),
  getRandomString: (s, e) => Math.random().toString(36).substr(s, e),
  convertToString: obj => (typeof obj === 'object' ? JSON.stringify(obj) : new String(obj).toString())
}
