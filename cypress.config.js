const { defineConfig } = require('cypress')

module.exports = defineConfig({
   e2e: {
      setupNodeEvents(on, config) {},
      supportFile: false,
      baseUrl: 'http://localhost:8000',
   },
})
