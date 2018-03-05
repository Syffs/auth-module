const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressJwt = require('express-jwt')
const passport = require('passport')

const passportConfig = require('./passport')
const users = require('./users').userDB

// Create app
const app = express()

// Install middleware
app.use(cookieParser())
app.use(bodyParser.json())

app.use(passport.initialize())

// Set up passport auth config
passportConfig.passport(passport)

// JWT middleware
app.use(
  expressJwt({
    secret: passportConfig.jwtSecret
  }).unless({
    path: [
      /\/api\/auth\/social\/*/,
      '/api/auth/login',
      '/api/users' // Testing purpose
    ]
  })
)

// -- Routes --
const authRouter = express.Router()

// [POST] /login
authRouter.post('/login', (req, res, next) => {
  const { username, password } = req.body
  const valid = username.length && password === '123'

  if (!valid) {
    throw new Error('Invalid username or password')
  }

  const accessToken = passportConfig.generateUserToken(username)
  console.log('Returning token: ', accessToken)

  res.json({
    access_token: accessToken
  })
})

// [POST] /logout
authRouter.post('/logout', (req, res, next) => {
  res.json({ status: 'OK' })
})

// Error handler
authRouter.use((err, req, res, next) => {
  console.error(err) // eslint-disable-line no-console
  res.status(401).send(err + '')
})

const socialRouter = express.Router()

socialRouter.get('/facebook',
  passport.authenticate('facebook', { session: false, scope: ['public_profile', 'email', 'user_friends', 'user_birthday'] }))
socialRouter.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  passportConfig.sendUserToken)

// Refresh token only comes on the first authentication
// It can be obtained again, by reprompting consent from the user with prompt: 'consent', accessType: 'offline'
socialRouter.get('/google',
  passport.authenticate('google', { session: false, accessType: 'offline', scope: ['openid', 'profile', 'email'] }))
socialRouter.get('/google/callback',
  passport.authenticate('google', { session: false, accessType: 'offline'}),
  passportConfig.sendUserToken)

authRouter.use('/social', socialRouter)

app.use('/auth', authRouter)

// [GET] get all users for testing purpose only
app.get('/users', (req, res) => {
  res.send(users)
})

// [GET] /user
app.get('/user', (req, res, next) => {
  res.json({ user: req.user })
})

// -- export app --
module.exports = {
  path: '/api',
  handler: app
}
