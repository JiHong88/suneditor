const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require('./_common');
const env = require('./_env');

module.exports = merge(common, {
	mode: 'development',
	entry: './test/dev/se_test',
	output: {
		filename: 'suneditor.[fullhash].js',
		environment: env
	},
	devtool: 'eval-source-map',
	devServer: {
		compress: true,
		host: '0.0.0.0',
		port: 8088
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'suneditor.[fullhash].css'
		}),
		new HtmlWebpackPlugin({
			template: './test/dev/se_test.html',
			inject: true
		})
	],
	optimization: {
		chunkIds: 'named',
		splitChunks: {
			chunks: 'async',
			minSize: 20000,
			minRemainingSize: 0,
			minChunks: 1,
			maxAsyncRequests: 30,
			maxInitialRequests: 30,
			enforceSizeThreshold: 50000,
			cacheGroups: {
				defaultVendors: {
					test: /[\\/]node_modules[\\/]/,
					priority: -10,
					reuseExistingChunk: true
				},
				default: {
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true
				}
			}
		}
	}
});
