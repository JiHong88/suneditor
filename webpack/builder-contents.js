const path = require('path');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const common = require('./_common');

module.exports = merge(common, {
	mode: process.env.NODE_ENV || 'development',
	devtool: false,
	entry: './webpack/cdn-builder-contents',
	output: {
		filename: '_suneditor-contents.js',
		path: path.resolve(__dirname, '../dist'),
	},
	optimization: {
		minimize: true,
		minimizer: [new CssMinimizerPlugin()],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'suneditor-contents.min.css',
		}),
	],
});
