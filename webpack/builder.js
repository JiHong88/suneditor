const webpack = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./_common');
const env = require('./_env');

module.exports = merge(common, {
	mode: process.env.NODE_ENV || 'development',
	devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,
	entry: './webpack/cdn-builder',
	output: {
		filename: 'suneditor.min.js',
		environment: env,
		path: path.resolve(__dirname, '../dist')
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()]
	},
	plugins: [
		// new webpack.SourceMapDevToolPlugin(),
		new webpack.ids.HashedModuleIdsPlugin(),
		new webpack.optimize.ModuleConcatenationPlugin(),
		new CleanWebpackPlugin(),
		new CssMinimizerPlugin(),
		new MiniCssExtractPlugin({
			filename: 'suneditor.min.css'
		})
	]
});
