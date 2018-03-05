const { assignDefaults } = require('./_utils')

module.exports = function (strategy) {
  assignDefaults(strategy, {
    _scheme: 'api'
  })
}
