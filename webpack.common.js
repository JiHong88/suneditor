const webpack = require('webpack');
const path = require('path');

module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: ['/node_modules']
			},
			{
				test: /\.(jpg|gif|png|ico)$/,
				use: [{
					loader: "url-loader",
					options: {
						publicPath: '../',
						name: 'img/[hash].[ext]',
						limit: 10000
					}
				}]
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: [{
					loader: "file-loader",
					options: {
						publicPath: '../',
						name: 'fonts/[hash].[ext]',
						limit: 5000,
						mimetype: 'application/font-woff'
					}
				}]
			}
		]
	},
	
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	}
};
