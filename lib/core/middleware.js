import Middleware from '../middleware'
import { routeOption, getMatchedComponents } from './utilities'
import __get from 'lodash/get'
import __merge from 'lodash/merge'

const getLoginUrls = (auth) => {
  let loginUrls = []
  let url = __get(auth.options, 'redirect.login', false)
  if (url) loginUrls.push(url.split('?')[0])
  Object.keys(auth.strategies).map(key => {
    url = __get(auth.strategies[key].options, 'redirect.login', false)
    if (url) loginUrls.push(url.split('?')[0])
  })
  return loginUrls
}

Middleware.auth = function (ctx) {
  // Disable middleware if options: { auth: false } is set on the route
  if (routeOption(ctx.route, 'auth', false)) {
    return
  }

  // Disable middleware if no route was matched to allow 404/error page
  const matches = []
  const Components = getMatchedComponents(ctx.route, matches)
  if (!Components.length) {
    return
  }

  const meta = ctx.route.meta[0].auth
  const routeStrategy = _.get(meta, 'strategy.main', '')
  const callback = _.get(ctx.app.$auth, '.strategies[\'' + routeStrategy + '\'].options.redirect.callback', false) ||
    _.get(ctx.app.$auth.options, 'redirect.callback', false)
  // const login = _.get(ctx.app.$auth, '.strategies[\'' + routeStrategy + '\'].options.redirect.login', false) ||
  //   _.get(ctx.app.$auth.options, 'redirect.login', false)

  if (!ctx.app.$auth.$state.loggedIn) {
    // -- Guest --
    // Redirect to login page if not authorized and not inside callback page
    // (Those passing `callback` at runtime need to mark their callback component
    // with `auth: false` to avoid an unnecessary redirect from callback to login)
    // if (login && !(ctx.route.path === login.split('?')[0])) {
    if (!callback || ctx.route.path !== callback.split('?')[0]) {
      ctx.app.$auth.redirect('login', false, routeStrategy)
    }
    return
  }

  // include/exclude strategy
  const allowedStrategies = __get(meta, 'strategy.allow', [])
  const restrictedStrategies =  __get(meta, 'strategy.restrict', [])
  let validStrategies = []
  if (allowedStrategies.length) validStrategies = __merge(allowedStrategies, routeStrategy ? [routeStrategy] : [])
  if (allowedStrategies.length && !validStrategies.includes(ctx.app.$auth.$state.strategy)) {
    ctx.app.$auth.redirect('home', false, ctx.app.$auth.$state.strategy)
  } else if (restrictedStrategies.length && restrictedStrategies.includes(ctx.app.$auth.$state.strategy)) {
    ctx.app.$auth.redirect('home', false, ctx.app.$auth.$state.strategy)
  }

  // Make sure we're not on any login page
  const loginUrls = getLoginUrls(ctx.app.$auth)
  if (loginUrls.includes(ctx.route.path)) {
    ctx.app.$auth.redirect('home', false, ctx.app.$auth.$state.strategy)
  }
}
