const paths = require('react-scripts/config/paths')
const path = require('path')

// Make the "client" folder be treated as the "src" folder
paths.appSrc = path.resolve(__dirname, 'client')
// Tell the app that "src/index.js" has moved to "client/example/index.js"
paths.appIndexJs = path.resolve(__dirname, 'client/example/index.tsx')