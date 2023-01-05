const paths = require('react-scripts/config/paths')
const path = require('path')

// Make the "client" folder be treated as the "src" folder
paths.appSrc = path.resolve(__dirname, 'client')
// Tell the app that "src/index.js" has moved to "client/example/index.js"
paths.appIndexJs = path.resolve(__dirname, 'client/example/index.tsx')

module.exports = {
  // The Jest config to use when running your jest tests - note that the normal rewires do not
  // work here.
  jest: function(config) {
    // ...add your jest config customisation...
    // Example: enable/disable some tests based on environment variables in the .env file.
    config.roots = [ "<rootDir>/client/component"];
    config.testMatch = [
      "<rootDir>/client/component/*.(test).{js,jsx,ts,tsx}",
      "<rootDir>/client/component/?(*.)(spec|test).{js,jsx,ts,tsx}"
    ];
    return config;
  },
}
