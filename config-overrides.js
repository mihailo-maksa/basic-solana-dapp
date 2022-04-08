const webpack = require('webpack')

module.exports = function override(config, env) {
  console.log('override')

  config.resolve.fallback = {
    ...config.resolve.fallback,
    util: require.resolve('util/'),
    crypto: require.resolve('crypto-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
  }

  config.resolve.extensions = [...config.resolve.extensions, '.ts', '.js']

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]

  return config
}

// How to fix polyfill issues:

// 1.) npm i react-app-rewired util [any_other_package_that_needs_polyfill]

// 2.) config-overrides.js file

// 3.) package.json scripts --> "start": "react-app-rewired start"
