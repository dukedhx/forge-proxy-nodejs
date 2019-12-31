const EXPIRATION_WINDOW_IN_SECONDS = 300
const storeIdPrefix = 'token:'
const cacheManager = require('../managers/cacheManager')
const CacheObject = cacheManager.CacheObject
const fetchPromises = require('../stores/promiseStore').createStore('tokens')
const oauth2 = require('simple-oauth2')

async function fetchToken (id, secret, scope) {
  const credentials = {
    client: {
      id,
      secret
    },
    auth: {
      tokenHost: 'https://developer.api.autodesk.com',
      tokenPath: '/authentication/v1/authenticate'
    },
    options: { authorizationMethod: 'body' }
  }
  const client = oauth2.create(credentials)
  const result = await client.clientCredentials.getToken({ scope: scope || 'data:read data:write bucket:read data:create code:all' }, {})
  return client.accessToken.create(result).token
}

module.exports = {
  getTokenAsync: async (profile, scope, forceRefresh) => {
    const token = await cacheManager.getString(storeIdPrefix + profile.id)
    if (token && !forceRefresh) {
      return token
    } else {
      return fetchPromises.put(profile.id, async resolve => {
        const tokenResult = await fetchToken(profile.clientId, profile.clientSecret, profile.scope)
        cacheManager.putString(new CacheObject(storeIdPrefix + profile.id, tokenResult.access_token, tokenResult.expires_in - EXPIRATION_WINDOW_IN_SECONDS))
        resolve(tokenResult.access_token)
      })
    }
  }
}
