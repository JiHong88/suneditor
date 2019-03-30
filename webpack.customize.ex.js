const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge')

const common = require('./webpack.common')

module.exports = merge(common, {
	mode: 'development',
	entry: './sample/js/customize_ex',
	output: {
		filename: 'suneditor.customize.js',
		path: path.resolve(__dirname, './sample/build')
	},

	devtool: 'cheap-module-eval-source-map',

	plugins: [
		new webpack.NamedModulesPlugin()
	]
});
