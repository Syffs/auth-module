import { encodeQuery, parseQuery, randomString } from '../utilities'

const DEFAULTS = {
  tokenRequired: true,
  tokenType: 'Bearer',
  globalToken: true
}

export default class ApiScheme {
  constructor (auth, options) {
    this.auth = auth
    this.name = options._name

    this.options = Object.assign({}, DEFAULTS, options)
  }

  _setToken (token) {
    if (this.options.globalToken) {
      // Set Authorization token for all axios requests
      this.auth.ctx.app.$axios.setToken(token, this.options.tokenType)
    }
  }

  _clearToken () {
    if (this.options.globalToken) {
      // Clear Authorization token for all axios requests
      this.auth.ctx.app.$axios.setToken(false)
    }
  }

  async mounted () {
    if (this.options.tokenRequired) {
      const token = this.auth.syncToken(this.name)
      this._setToken(token)
    }

    // Handle callbacks on page load
    const redirected = await this._handleCallback()

    if (!redirected) {
      return this.auth.fetchUserOnce()
    }
  }

  login () {
    // State might be worth implementing for more security?
    // const opts = {
    //   redirect_uri: this._redirectURI,
    //   state: randomString()
    // }

    // this.auth.setLocalStorage(this.name + '.state', opts.state)

    const url = this.options.authorization_endpoint

    window.location = url
  }

  async fetchUser (endpoint) {
    // User endpoint is disabled.
    if (!this.auth.options.api.endpoints.user) {
      this.auth.setUser({})
      return
    }

    // Token is required but not available
    if (this.options.tokenRequired && !this.auth.getToken(this.name)) {
      return
    }

    // Try to fetch user and then set
    const user = await this.auth.requestWith(
      this.name,
      endpoint,
      this.auth.options.api.endpoints.user
    )
    this.auth.setUser(user)
  }

  async logout (endpoint) {
    if (!this.auth.options.api.endpoints.logout) {
      return
    }

    await this.auth
      .requestWith(this.name, endpoint, this.auth.options.api.endpoints.logout)
      .catch(() => { })

    if (this.options.tokenRequired) {
      this._clearToken()
    }

    return this.auth.reset()
  }

  async _handleCallback (uri) {
    // Callback flow is not supported in server side
    if (process.server) {
      return
    }

    // Parse query from both search and hash fragments
    const hash = parseQuery(window.location.hash.substr(1))
    const search = parseQuery(window.location.search.substr(1))
    const parsedQuery = Object.assign({}, search, hash)

    // accessToken
    let accessToken = parsedQuery.access_token

    if (!accessToken || !accessToken.length) {
      return
    }

    // Validate state
    const state = this.auth.getLocalStorage(this.name + '.state')
    this.auth.setLocalStorage(this.name + '.state', null)
    if (state && parsedQuery.state !== state) {
      return
    }

    // Store token
    if (this.options.tokenRequired) {
      accessToken = this.options.tokenType
        ? this.options.tokenType + ' ' + accessToken
        : accessToken

      this.auth.setToken(this.name, accessToken)
      this._setToken(accessToken)
    }

    // Redirect to home
    this.auth.redirect('home', true)

    return true // True means a redirect happened
  }
}
