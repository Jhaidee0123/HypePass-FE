const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              api: 'modern-compiler',
              sassOptions: {
                silenceDeprecations: ['import', 'legacy-js-api']
              }
            }
          }
        ]
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    devMiddleware: {
      writeToDisk: true
    },
    static: [
      { directory: './dist' },
      { directory: './public' }
    ],
    historyApiFallback: true,
    port: 8090
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './template.dev.html'
    }),
    new Dotenv()
  ]
});
