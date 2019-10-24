const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',
  devServer: {
    contentBase: './dist'
  },
  entry: {
    app: './src/js/app.js'
  },
  module: {
    rules: [
      {
        test: /.*\.css$/,
        use: [
          {
            // injects css into the dom
            loader: 'style-loader'
          },
          {
            // interprets @import and url() link import/require()
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      },
      {
        test: /.*\.(mp3|png)$/,
        use: ['file-loader']
      }
    ]
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Big Time',
      template: 'index.html'
    })
  ]
}
