import * as webpack from 'webpack';
import * as path from 'path';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const IS_PROD: boolean = process.argv.indexOf('-p') > -1;

export default {
  devtool: IS_PROD ? 'source-map' : 'eval',
  entry: path.join(__dirname, 'demo', 'entry.ts'),
  output: {filename: IS_PROD ? '[name]-[chunkhash].js' : '[name].js'},
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'tslint-loader?emitErrors=false&failOnHint=false',
      exclude: /node_modules/,
      enforce: 'pre'
    }, {
      test: /\.ts$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: {
        transpileOnly: !IS_PROD
      }
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devServer: {
    port: 8000,
    inline: true,
    hot: true,
    historyApiFallback: true
  },
  plugins: [
    ...(IS_PROD ? [] : [
      new webpack.HotModuleReplacementPlugin(),
      new ForkTsCheckerWebpackPlugin({
        watch: ['./src', './demo']
      })
    ]),
    new webpack.DefinePlugin({
      ENV: JSON.stringify(IS_PROD ? 'production' : 'development')
    }),
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)@angular/,
      path.join(__dirname, 'src')
    ),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'demo', 'index.html')
    })
  ]
};
