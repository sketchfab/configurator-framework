const package = require('./package.json');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: ['./src/index.js'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `SketchfabConfigurator-${package.version}.js`,
        library: 'SketchfabConfigurator'
    },
    module: {
        rules: [{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }]
    },
    // plugins: [new BundleAnalyzerPlugin()]
};
