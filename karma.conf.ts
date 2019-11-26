import * as webpack from 'webpack';
import * as path from 'path';
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

export default config => {
  config.set({
    basePath: './',
    frameworks: ['mocha'],
    files: [
      'test/entry.ts'
    ],
    preprocessors: {
      'test/entry.ts': ['webpack', 'sourcemap']
    },
    webpack: {
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [{
          test: /\.ts$/,
          loader: 'tslint-loader',
          exclude: /node_modules/,
          enforce: 'pre',
          options: {
            emitErrors: config.singleRun,
            failOnHint: config.singleRun
          }
        }, {
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            transpileOnly: !config.singleRun
          }
        }, {
          test: /src\/.+\.ts$/,
          exclude: /(node_modules|\.spec\.ts$)/,
          loader: 'istanbul-instrumenter-loader',
          enforce: 'post'
        }]
      },
      plugins: [
        new webpack.SourceMapDevToolPlugin({
          filename: null,
          test: /\.(ts|js)($|\?)/i
        }),
        new webpack.ContextReplacementPlugin(
          /angular(\\|\/)core(\\|\/)@angular/,
          path.join(__dirname, 'src')
        ),
        ...(config.singleRun ? [
          new webpack.NoEmitOnErrorsPlugin()
        ] : [
          new ForkTsCheckerWebpackPlugin({
            watch: ['./src', './test']
          })
        ])
      ]
    },

    mochaReporter: {
      showDiff: true,
      output: 'autowatch'
    },

    coverageIstanbulReporter: {
      reports: ['text-summary', 'html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },

    mime: {
      'text/x-typescript': ['ts']
    },

    reporters: ['mocha', 'coverage-istanbul'],
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless','ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  });
};
