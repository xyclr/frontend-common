/**
 *  @datetime 2019/1/11 2:36 PM
 *  @author Ping Dong
 *  @desc webpack config for production
 */
const path = require('path');
const ClearnWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const {ProgressPlugin} = webpack;
const HelloWorldPlugin = require('./build/plugins/HelloWorldPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
module.exports = {
	mode: 'production',
	entry: {
		main: './src/index.tsx'
	},
	output: {
		path: path.resolve(__dirname, 'dist/'),
		publicPath: '/',
		filename: 'index.js',
		library: 'mycommon',
		libraryTarget: 'umd',
	},
	module: {
		rules: [
			{ test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
			{
				test: /\.html$/,
				use: [{
					loader: 'html-loader',
					options: {
						minimize: true
					}
				}, './build/loaders/import-html-loader']
			},
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader', // translates CSS into CommonJS
					// "sass-loader" // compiles Sass to CSS, using Node Sass by default
					{
						loader: 'sass-loader',
						options: {
							includePaths: [path.join(__dirname, './src/assets/css')]
						}
					}
				]
			},
			{
				test: /\.(png|jpg|xls|xlsx|woff|ttf|svg|eot)$/,
				exclude: /^node_modules$/,
				use: [
					{
						loader: "url-loader",
						options: {
							limit: 1024,
							name: '[name].[ext]',
							includePaths: [path.join(__dirname, './src/assets/img')]
						}
					}
				]
			}
		]
	},
	plugins: [
		new ProgressPlugin(),
		new ClearnWebpackPlugin(['./dist']),
		new MiniCssExtractPlugin({
			filename: '[name].css',
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html',
			chunks: ['main', 'vendors']
		}),
		new HelloWorldPlugin()
	],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: true, // set to true if you want JS source maps,
				extractComments: false
			}),
			new OptimizeCSSAssetsPlugin({})
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json'],
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.join(__dirname, './tsconfig.json')
			})
		]
	}
};
