const path = require('path')

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    target: 'web',
    entry: './src/main.ts',
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'main.js',
      libraryTarget: 'umd'
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          resolve: {
            extensions: ['.ts', '.tsx', '.js']
          }
        }
      ]
    }
  }