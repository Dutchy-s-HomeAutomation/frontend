'use strict';
const path = require('path');

module.exports = {
    devtool: 'inline-source-map',
	entry: './src/ts/index.ts',
	output: {
		filename: 'dist.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'var',
        library: 'SmartHome',
        pathinfo: false
	},
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: path.resolve(__dirname, "src/ts"),
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                }
            },
            {
                test: /\.scss$/,
                include: path.resolve(__dirname, "src/scss"),
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ]
            }
        ]
    },
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    },
    resolve: {
        extensions: [ '.ts', '.js' ]
    },
    externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
        "jquery": "jQuery"
    },
    mode: 'development'
};