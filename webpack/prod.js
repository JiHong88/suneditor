const webpack = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const common = require('./common');

module.exports = merge(common, {
	mode: 'production',
	entry: './webpack/_cdn-builder',
	output: {
		filename: 'suneditor.min.js',
		path: path.resolve(__dirname, '../dist')
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
