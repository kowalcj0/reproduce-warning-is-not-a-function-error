'use strict';

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = (nodeEnv) => {
    return {
        resolve: {
            modules: [path.resolve('./src'), 'node_modules'],
            extensions: ['.tsx', '.ts', '.jsx', '.js', '.csv', '.json', '.html'],
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    loader: 'ts-loader',
                    exclude: '/node_modules/',
                },
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: '/node_modules/',
                    enforce: 'pre',
                    use: []
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: 'htmlhint-loader',
                            options: {
                                configFile: '.htmlhintrc',
                            }
                        }
                    ],
                    exclude: /node_modules/,
                    enforce: 'pre',
                },
                {
                    test: /\.(jpeg|eot|svg|ttf|woff|woff2|png|jpg|gif)(\?v=\d+\.\d+\.\d+)?$/,
                    use: 'file-loader',
                },
                {
                    test: /\.html$/,
                    use: 'html-loader'
                },
                {
                    test: /\.sccss$/,
                    use: ['styles-loader', 'css-loader', { loader: 'sass-loader', options: { sourceMap: true } }],
                },
                {
                    test: /\.css$/,
                    use: ['style-loader','css-loader'],
                },

            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'public/index.html',
            }),
            new webpack.EnvironmentPlugin({
                NODE_ENV: nodeEnv
            }),

        ],
        optimization: {
            minimizer: [
                (compiler) => {
                    const TerserPlugin = require('terser-webpack-plugin');
                    new TerserPlugin({
                        test: /\.js*($|\?)/i,
                        parallel: true,
                        terserOptions: {
                            mangle: true,
                            keep_fnames: true,
                            keep_classnames: true,
                        }
                    }).apply(compiler);
                },
            ],
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        chunks: 'initial',
                        name: 'vendor',
                        enforce: true
                    }
                }
            }
        },
        performance: {
            // hints: false
        },
    }
};

const devConfig = {
    entry: {
        main: ['whatwg-fetch', 'core-js/es', 'index.js']
    },

    devtool: 'inline-source-map',

    output: {
        path: path.join(__dirname, '/src', '/static'),
        filename: '[name].bundle.js',
        publicPath: '/'
    },

    stats: 'minimal',

    devServer: {
        static: 'src',
        compress: true,
        port: 9003,
        host: '0.0.0.0',
        allowedHosts: 'all',
        historyApiFallback: {
            index: '/'
        },
        client: {
            overlay: {
                errors: true,
                warnings: false
            }
        }
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}

const prodConfig = {
    entry: {
        main: ['babel-polyfill', 'whatwg-fetch', 'core-js/es', 'main.js']
    },

    devtool: 'source-map',

    output: {
        path: path.join(__dirname, '../target/static'),
        filename: '[name].[hash].bundle.js',
        publicPath: '/'
    }
}

module.exports = (env, argv) => {
    console.info('NODE_ENV', argv.mode);
    return argv.mode === 'production' ? merge(commonConfig(argv.mode), prodConfig) : merge(commonConfig(argv.mode), devConfig);
};
