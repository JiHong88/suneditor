const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
	// plugins: [new BundleAnalyzerPlugin()],
	performance: {
		maxAssetSize: 716800, // (700 * 1024 = 716800)
		maxEntrypointSize: 819200 // (800 * 1024 = 819200)
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: ['/node_modules']
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			},
			{
				test: /\.(jpg|gif|png|ico)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							publicPath: '../',
							name: 'img/[hash].[ext]',
							limit: 10000
						}
					}
				]
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
							mimetype: 'application/font-woff'
						}
					}
				]
			}
		]
	}
};
