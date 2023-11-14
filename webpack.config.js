const path = require('path');
const ClearnWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const {
	HotModuleReplacementPlugin
} = webpack;
const HelloWorldPlugin = require('./build/plugins/HelloWorldPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
// const apiHZ='http://10.122.251.38:8086';//黄震地址
const apiHZ = 'http://10.10.15.136'; //发布地址
module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: {
		main: './src/index.tsx'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		filename: '[name].js',
		// chunkFilename: '[id].[name].js'
	},
	module: {
		rules: [{
				test: /\.tsx?$/,
				loader: 'awesome-typescript-loader'
			},
			{
				test: /\.html$/,
				use: [{
					loader: 'html-loader',
					options: {
						minimize: false
					}
				}, './build/loaders/import-html-loader']
			},
			{
				test: /\.s?css$/,
				use: [
					'style-loader', // creates style nodes from JS strings
					'css-loader', // translates CSS into CommonJS
					{
						loader: 'sass-loader',
						options: {
							includePaths: [path.join(__dirname, './src/assets/css')]
						}
					}
				]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /\.(png|jpg|xls|xlsx|woff|ttf|svg|eot)$/,
				exclude: /^node_modules$/,
				use: [{
					loader: "url-loader",
					options: {
						limit: 1024,
						name: '[name].[ext]',
						includePaths: [path.join(__dirname, './src/assets/img')]
					}
				}]
			}
		]
	},
	plugins: [
		new ClearnWebpackPlugin(['./dist']),
		new HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html',
			chunks: ['main']
		}),
		new HelloWorldPlugin()
	],
	devServer: {
		contentBase: './dist',
		publicPath: '/',
		hot: true,
		host: '0.0.0.0',
		port:8088,
		proxy: {
			// mock环境
			// '/mock': 'http://localhost:3000',
			// '/sfm': 'http://localhost:3000',
			// '/auth': 'http://localhost:3000',
			// '/finc': 'http://localhost:3000',
			// '/mdm': 'http://localhost:3000',
			// '/common': 'http://localhost:3000',

			// 成都环境
			'/sfm': apiHZ,
			'/umc': 'http://10.10.152.94',
			'/csm': 'http://10.10.82.53',
			'/order': 'http://10.10.15.136',
			'/bpm': 'http://10.10.233.21', // 登录
			'/gacb-ud': 'http://10.10.2.93', // 文件管理
			'/mdm': 'http://10.10.174.142',
			'/common': 'http://10.10.243.12',
			'/finc': 'http://10.10.120.45',
			'/auth': 'http://10.10.227.39', // 登录
			'/bpm': 'http://10.10.233.21', // 登录
			'/gacb-ud': 'http://10.10.2.93', // 文件管理

			// 广州环境
			// '/finc': 'http://10.122.251.96:8085',
			// '/finc': 'http://192.168.8.155:9005',
			// '/': 'http://10.10.200.21',
		}
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
