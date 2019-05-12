const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const common = require('./webpack.common')

module.exports = merge(common, {
	mode: 'development',
	entry: './test/dev/suneditor_build_test',
	output: {
		filename: 'suneditor.[hash].js',
		path: path.resolve(__dirname, 'dist')
	},

	devtool: 'cheap-module-eval-source-map',
	devServer: {
		contentBase: 'dist',
		host: 'localhost',
		port: 8080
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: 'css/suneditor.[hash].css'
		}),
		new webpack.NamedModulesPlugin(),
		new HtmlWebpackPlugin({
			template: './test/dev/suneditor_build_test.html',
			inject: true
		}),
	]
});
