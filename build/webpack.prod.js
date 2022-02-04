const merge = require('webpack-merge');
const baseConfig = require('./webpack.config');

const prodConfig = {};
const config = merge(baseConfig, prodConfig);
module.exports = config;