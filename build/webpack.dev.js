const merge = require('webpack-merge');
const baseConfig = require('./webpack.config');
const path = require("path");

const devConfig = {
    devServer: {
        host: '0.0.0.0',
        port: '9000',
        contentBase: path.resolve(__dirname, '../dist'),
        // hot: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        overlay: {
            errors: true,
        },
    },
};

const config = merge(baseConfig, devConfig);
module.exports = config;