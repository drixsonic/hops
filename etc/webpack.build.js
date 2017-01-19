'use strict';

var util = require('util');

var webpack = require('webpack');
var appRoot = require('app-root-path');

var HopsPlugin = require('../plugin');

var pkg = require('../package.json');

module.exports = require('./webpack.base.js')
.removeLoader('css')
.merge({
  entry: require.resolve('../lib/shim'),
  output: {
    filename: '[name]-[hash].js',
    chunkFilename: 'chunk-[id]-[hash].js'
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            sourceMap: false,
            modules: true,
            localIdentName: '[folder]-[name]-[local]-[hash:base64:5]',
            importLoaders: 1
          }
        },
        'postcss-loader'
      ]
    }, {
      // Images
      test: /\.(jpe?g|png|gif|ico|svg)$/i,
      use: [{
        loader: 'file-loader',
        options: {
          emitFile: false,
          name: '[name]-[md5:hash:20].[ext]'
        }
      }, {
        loader: 'image-webpack-loader',
        options: {
          progressive: true,
          optimizationLevel: 7,
          interlaced: true,
          pngquant: {
            quality: '65-90',
            speed: 4
          }
        }
      }]
    }, {
      // Fonts
      test: /\.(woff|woff2|ttf)$/i,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name]-[hash:20].[ext]'
        }
      }]
    }]
  },
  plugins: [
    new HopsPlugin({
      config: require.resolve('./webpack.node.js'),
      dll: [{
        path: util.format('hops-%s.js', pkg.version),
        source: appRoot.resolve('.tmp/webpack/build/hops.js')
      }]
    }),
    new webpack.DllReferencePlugin({
      context: appRoot.toString(),
      manifest: appRoot.require('.tmp/webpack/build/hops.json')
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
      sourceMap: false
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false, unused: true, 'dead_code': true },
      output: { comments: false }
    }),
    new webpack.ProgressPlugin()
  ]
});
