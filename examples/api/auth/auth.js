const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const jwt = require('jsonwebtoken')

const users = require( '../model/users')

/**
 * Refer to doc for facebook profile fields
 * @ref https://developers.facebook.com/docs/graph-api/reference/v2.12/user
 * @type {{clientID: string, clientSecret: string, callbackURL: string, profileFields: [string,string,string,string,string,string,string,string,string,string]}}
 */
const facebook = {
  clientID: '1671464192946675',
  clientSecret: 'secret',
  callbackURL: 'http://localhost:3000/api/auth/social/facebook/callback',
  profileFields: ['id', 'first_name', 'last_name', 'location', 'gender', 'birthday', 'emails', 'relationship_status', 'friends', 'picture{url}']
}

const google = {
  clientID: '956748748298-kr2t08kdbjq3ke18m3vkl6k843mra1cg.apps.googleusercontent.com',
  clientSecret: 'secret',
  callbackURL: 'http://localhost:3000/api/auth/social/google/callback'
}

const jwtSecret = 'myAwesomes3cret?!?'

const jwtExpiration = '3600'

const callback = 'http://localhost:3000/callback'

const generateUserToken = (username) => {
  return jwt.sign({
    username
  }, jwtSecret)
  // jsonwebtoken.sign(
  //   {
  //     username,
  //     picture: 'https://github.com/nuxt.png',
  //     name: 'User ' + username,
  //     scope: ['test', 'user']
  //   },
  //   'dummy'
  // )
}

const sendUserToken = (req, res) => {
  console.log("SendUserToken ", req.user)
  const accessToken = generateUserToken(req.user.name)
  res.redirect(callback + '?access_token=' + accessToken)
}

var passport = (passport) => {

  // https://graph.facebook.com/v2.12/debug_token?input_token=
  passport.use(new FacebookStrategy(
    facebook, function (accessToken, refreshToken, json, profile, done) {
      let user = users.getUserByExternalId('facebook', profile.id);
      if (!user) {
        user = users.createUser(profile.emails[0].value, 'facebook', profile.id);
      }
      console.log("accessToken: ", accessToken)
      console.log("refreshToken: ", refreshToken)
      console.log("json: ", json)
      console.log("profile", profile)
      return done(null, user)
    }))

  passport.use(new GoogleStrategy(
    google, (accessToken, refreshToken, json, profile, done) => {
      let user = users.getUserByExternalId('google', profile.id);
      if (!user) {
        user = users.createUser(profile.emails[0].value, 'google', profile.id)
      }
      console.log("accessToken: ", accessToken)
      console.log("refreshToken: ", refreshToken)
      // console.log("profile: ", profile)
      console.log("json: ", json)
      return done(null, user)
    }))
}

// export default passport
module.exports = {
  passport,
  facebook,
  google,
  jwtSecret,
  generateUserToken,
  sendUserToken
}
