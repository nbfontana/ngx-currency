import * as path from 'path';
import * as fs from 'fs';
import * as webpack from 'webpack';
import * as angularExternals from 'webpack-angular-externals';
import * as rxjsExternals from 'webpack-rxjs-externals';

const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

export default {
  entry: {
    'ngx-currency.umd': path.join(__dirname, 'src', 'index.ts'),
    'ngx-currency.umd.min': path.join(__dirname, 'src', 'index.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist', 'bundles'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'ngxBr'
  },
  externals: [
    angularExternals(),
    rxjsExternals()
  ],
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'tslint-loader?emitErrors=true&failOnHint=true',
      exclude: /node_modules/,
      enforce: 'pre'
    }, {
      test: /\.ts$/,
      loader: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      sourceMap: true
    }),
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      path.join(__dirname, 'src')
    ),
    new webpack.BannerPlugin({
      banner: `
/**
 * ${pkg.name} - ${pkg.description}
 * @version v${pkg.version}
 * @author ${pkg.author}
 * @link ${pkg.homepage}
 * @license ${pkg.license}
 */
      `.trim(),
      raw: true,
      entryOnly: true
    })
  ]
};
