const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
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
            loader: MiniCssExtractPlugin.loader
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
  externals: {
    react: 'React',
    axios: 'axios',
    recoil: 'Recoil',
    'react-dom': 'ReactDOM'
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }]
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './template.prod.html'
    }),
    new Dotenv({ systemvars: true }),
    new MiniCssExtractPlugin({
      filename: 'main-bundle-[fullhash].css'
    }),
    new FaviconsWebpackPlugin({
      logo: './public/favicon.png'
    })
  ]
});
