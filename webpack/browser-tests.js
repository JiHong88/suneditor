const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require('./_common');

// Isolated, reproducible test page; never imports the developer's demo setup.
module.exports = merge(common, {
	mode: 'development',
	entry: './test/browser/fixture.js',
	output: { filename: 'suneditor.browser-tests.js' },
	devtool: 'source-map',
	devServer: { host: '127.0.0.1', port: 8089 },
	plugins: [
		new MiniCssExtractPlugin({ filename: 'suneditor.browser-tests.css' }),
		new HtmlWebpackPlugin({ template: './test/browser/fixture.html' }),
	],
});
