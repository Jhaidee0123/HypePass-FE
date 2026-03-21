const path = require('path');

module.exports = {
  entry: './src/main/index.tsx',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main-bundle-[fullhash].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', 'scss'],
    alias: {
      '@': path.join(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.(jpg|jpeg|png|gif|svg|webp)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|ttf|otf|eot)$/i,
        type: 'asset/resource'
      }
    ]
  }
};
