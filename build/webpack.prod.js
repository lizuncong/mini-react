const merge = require('webpack-merge');
const baseConfig = require('./webpack.config');

const prodConfig = {
    mode: 'production',
};
const config = merge(baseConfig, prodConfig);
module.exports = config;