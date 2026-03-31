const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
	// plugins: [new BundleAnalyzerPlugin()],
	performance: {
		maxAssetSize: 768000, // (750 * 1024 = 768000)
		maxEntrypointSize: 921600, // (900 * 1024 = 921600)
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: ['/node_modules'],
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(jpg|gif|png|ico)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							publicPath: '../',
							name: 'img/[hash].[ext]',
							limit: 10000,
						},
					},
				],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							publicPath: '../',
							name: 'fonts/[hash].[ext]',
							limit: 5000,
							mimetype: 'application/font-woff',
						},
					},
				],
			},
		],
	},
};
