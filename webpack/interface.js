const path = require('path');
const merge = require('webpack-merge')
const common = require('./common')

module.exports = merge(common, {
	mode: 'production',
	entry: './src/interface/editor_build',
	output: {
		filename: 'editor.min.js',
		path: path.resolve(__dirname, 'src/interface')
	}
});
