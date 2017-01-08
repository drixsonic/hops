#!/usr/bin/env node
'use strict';

var url = require('url');

var argv = require('minimist')(process.argv.slice(2));

var webpack = require('webpack');
var WebpackServer = require('webpack-dev-server');


var util = require('../lib/util');


function runCommand(command, config) {
  switch (command) {
    case 'start':
      if (process.env.NODE_ENV === 'production') {
        runCommand('build', config);
      }
      else {
        runCommand('develop', config);
      }
      break;
    case 'build':
      var buildConfig = require(config.configs.build);
      webpack(buildConfig).run(function(error, stats) {
        if (error) { util.log(error); }
        else {
          util.log(stats.toString({ chunks: false }));
        }
      });
      break;
    case 'develop':
      var developConfig = require(config.configs.develop);
      var serverConfig = developConfig.devServer;
      var compiler = webpack(developConfig);
      var server = new WebpackServer(compiler, serverConfig);
      server.listen(serverConfig.port, serverConfig.host, function(err) {
        if (err) { throw err; }
        util.log(url.format({
          protocol: serverConfig.https ? 'https' : 'http',
          hostname: serverConfig.host,
          port: serverConfig.port
        }));
      });
      break;
    default:
      throw new Error('unknown command: ' + command);
  }
}


util.loadConfig()
.then(function (config) {
  var command = argv._[0] || process.env.npm_lifecycle_event;
  util.log('hops@%s: %s', require('../package.json').version, command);
  runCommand(command, config);
});
