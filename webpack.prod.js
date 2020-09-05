const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const common = require('./webpack.common')

module.exports = merge(common, {
	mode: 'production',
	entry: './src/suneditor_build',
	output: {
		filename: 'suneditor.min.js',
		path: path.resolve(__dirname, 'dist')
	},

	plugins: [
		new webpack.SourceMapDevToolPlugin(),
		new webpack.HashedModuleIdsPlugin(),
		new webpack.optimize.ModuleConcatenationPlugin(),
		new CleanWebpackPlugin(['dist']),
		new OptimizeCSSPlugin(),
		new MiniCssExtractPlugin({
			filename: 'css/suneditor.min.css'
		})
	]
});
