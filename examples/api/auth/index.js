const router = require('express').Router()

const auth = require('./auth')
const social = require('./social')

router.use('/social', social)

// [POST] /login
router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  const valid = username.length && password === '123'

  if (!valid) {
    throw new Error('Invalid username or password')
  }

  const accessToken = auth.generateUserToken(username)

  res.json({
    access_token: accessToken
  })
})

// [POST] /logout
router.post('/logout', (req, res, next) => {
  res.json({ status: 'OK' })
})

module.exports = {
  router,
  config: auth
}
