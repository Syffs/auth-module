const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '../..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  build: {
    extractCSS: true
  },
  serverMiddleware: ['../api'],
  modules: ['bootstrap-vue/nuxt', '@nuxtjs/axios', '@@'],
  axios: {
    proxy: true
  },
  proxy: {
    '/api': 'http://localhost:3000'
  },
  auth: {
    redirect: {
      callback: '/callback'
    },
    api: {
      endpoints: {
        user: { url: '/api/user' }
      }
    },
    strategies: {
      local: {
        endpoints: {
          user: { url: '/api/user' }
        }
      },
      pro: {
        _scheme: 'local',
        endpoints: {
          login: {
            url: '/api/pro/login',
            method: 'post',
            propertyName: 'access_token'
          },
          logout: {
            url: '/api/pro/logout',
            method: 'post'
          },
          user: {
            url: '/api/user',
            method: 'get',
            propertyName: 'user'
          }
        },
        redirect: {
          login: '/login-pro'
        }
      },
      auth0: {
        domain: 'nuxt-auth.auth0.com',
        client_id: 'q8lDHfBLJ-Fsziu7bf351OcYQAIe3UJv'
      },
      facebook: {
        client_id: '1671464192946675',
        userinfo_endpoint: 'https://graph.facebook.com/v2.12/me?fields=about,name,picture{url},email,birthday',
        scope: ['public_profile', 'email', 'user_birthday']
      },
      google: {
        client_id:
          '956748748298-kr2t08kdbjq3ke18m3vkl6k843mra1cg.apps.googleusercontent.com'
      },
      github: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET
      },
      twitter: {
        client_id: 'FAJNuxjMTicff6ciDKLiZ4t0D'
      },
      facebookApi: {
        authorization_endpoint: '/api/auth/social/facebook'
      },
      googleApi: {
        authorization_endpoint: '/api/auth/social/google'
      }
    }
  }
}
