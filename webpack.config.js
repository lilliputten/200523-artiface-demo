/** @desc Webpack configuration
 *  @since 2020.05.18, 12:00
 *  @changed 2020.05.18, 15:22
 */

const fs = require('fs');
const path = require('path');
const dateformat = require('dateformat');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier'); // https://www.npmjs.com/package/webpack-build-notifier
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const CreateFileWebpack = require('create-file-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const UglifyJS = require('uglify-js')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// TODO: OptimizeCSSAssetsPlugin params (source map etc)
const ExtractCssPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {

  const mode = argv.mode || 'production';
  const isCosmos = (process.env.npm_lifecycle_event === 'cosmos'); // Runs under react-cosmos?
  const isDevServer = isCosmos || !!argv.host; // (mode === 'none'); // (none = server) // Alternate method: !!argv.host
  const hotReload = isDevServer;
  const cssHotReload = hotReload; // Hot reload css for dev-server
  const isStats = !!argv.profile;
  const isWatch = !!argv.watch;
  const isDev = (/* isDevServer || */ mode === 'development');
  const isProd = !isDev; // mode === 'production'
  const useDevTool = true && (isDev || isDevServer); // Need server restart
  const minimizeBundles = false && isProd; // To minimize production bundles
  // // const stripDebugger = true // Comment out all the `debugger` statements from source code
  const preprocessBundles = true && isProd; // To minimize production bundles
  const sourceMaps = !preprocessBundles; // To minimize production bundles
  // const extemeUglify = false // Use mangling (WARNING: May broke some code! Don't use without testing!)
  const DEBUG = true && (isDev || isDevServer);
  const rootPath = path.resolve(__dirname);
  const srcPath = path.resolve(__dirname, 'src');
  // const debugDataPath = path.resolve(__dirname, 'debug-data') // Debug-time data stubs
  const mixinsPath = path.resolve(srcPath, '!mixins');

  // Additional configuration params from `webpack.env.js` and `webpack.env.local.js`
  const webpackEnvFile = path.resolve(rootPath, 'webpack.env.js');
  const webpackEnvLocalFile = path.resolve(rootPath,'webpack.env.local.js');
  const webpackEnv = fs.existsSync(webpackEnvFile) && require(webpackEnvFile);
  const webpackEnvLocal = fs.existsSync(webpackEnvLocalFile) && require(webpackEnvLocalFile);
  // Merge parameters from config files and command line (eg `--env.DEMO=true`)
  env = Object.assign({}, webpackEnv, webpackEnvLocal, env);

  const THEME = env.THEME || 'default';
  const THEME_FILE = './themes/' + THEME; // For including in `src/config/css.js`
  // Set process.env variables for using in included below `css` module.
  // Also see passing variables to source code below.
  process.env.THEME = THEME;
  process.env.THEME_FILE = THEME_FILE;

  // Project configuration
  const pkgFile = path.resolve(rootPath, 'package');
  const pkgConfig = require(pkgFile);

  // Project version, application title
  const {
    // name: projectName,
    version,
  } = pkgConfig;

  // Date stamps
  const dateStringFormat = 'yyyy.mm.dd HH:MM:ss';
  const dateTagFormat = 'yymmdd-HHMM';
  const now = new Date();
  const timestamp = dateformat(now, dateStringFormat);
  const buildTagFile = 'build-tag.txt';
  const timetag = fs.existsSync(buildTagFile) && fs.readFileSync(buildTagFile, 'utf8') || dateformat(now, dateTagFormat);

  /* // UNUSED: CopyWebpackPluginOptions
   * const CopyWebpackPluginOptions = {
   *   globOptions: {
   *     ignore: [
   *       // Temp files
   *       '**[>.tmp',
   *       '**[>.bak',
   *       '**[>.sw?',
   *       // Misc backup files
   *       '**[>_',
   *       '**[>~',
   *       // Auxilary files
   *       '**[>.diff',
   *       '**[>.orig',
   *     ],
   *   },
   * }
   */

  const htmlFilename = 'index.html';

  const buildType = isDevServer ? 'server': 'build'; // isDist ? 'dist' : 'demo'
  const buildMode = isProd ? 'prod' : 'dev';
  const buildModePostfix = isDev ? '-dev' : '';
  const buildFolder = buildType + buildModePostfix;
  const buildPath = path.resolve(rootPath, buildFolder);

  const buildTag = [ // Construct general-purpose build tag
    'v.' + version,
    timetag,
    buildType,
    buildMode,
    THEME,
  ].join('-');

  const useHashes = false; // NOTE: Not works with pseudo-dynamic bundles loading method (with hardcoded urls)
  const bundleName = ({ ext, name, dir } = {}) => (dir || 'js/') + (name || '[name]') + (useHashes && !isWatch && !isDevServer ? '-[contenthash:8]' : '') + (ext || '.js');

  const jsEntryFile = 'index.jsx'; // js source

  const cssConfigFile = path.resolve(srcPath, 'config', 'css.js');
  const cssConfig = fs.existsSync(cssConfigFile) ? require(cssConfigFile) : {};

  const postcssPlugins = [
    require('postcss-flexbugs-fixes'),
    require('postcss-import'),
    require('postcss-mixins')({ // https://github.com/postcss/postcss-mixins
      mixinsDir: [
        mixinsPath,
      ],
    }),
    require('postcss-advanced-variables')({ // https://github.com/jonathantneal/postcss-advanced-variables
      // unresolved: 'warn', // 'ignore',
      variables: cssConfig,
    }),
    require('postcss-simple-vars'), // https://github.com/postcss/postcss-simple-vars
    require('postcss-color-function'), // https://github.com/postcss/postcss-color-function
    require('postcss-calc')(),
    require('postcss-nested-ancestors'), // https://github.com/toomuchdesign/postcss-nested-ancestors
    require('postcss-nested'),
    require('postcss-url')({
      url: 'rebase',
      // maxSize: 20,
      // url: 'rebase',
    }),
    require('autoprefixer')({
      flexbox: 'no-2009',
    }),
    minimizeBundles && require('postcss-csso'),
    require('postcss-reporter'),
  ].filter(x => x);

  const passParameters = { // Pass parameters to code (js & styles)
    rootPath,
    bodyBgColor: cssConfig.bodyBgColor,
    THEME,
    THEME_FILE,
    DEBUG,
    DEV_DEBUG: DEBUG && env.DEV_DEBUG, // Extra debug level (on developers' machine, usually from `webpack.env.local.js` or specific npm script command)
    DEV_SERVER: DEBUG && env.DEV_SERVER, // Debug server
    isDevServer,
    isDev,
    isProd,
    isWatch,
    timetag,
    buildTag,
    timestamp,
    version,
  };

  // Stats waiting only json on output...
  const debugModes = [
    buildTag,
    'mode:' + mode,
    isCosmos && 'Cosmos',
    isDevServer && 'DevServer',
    isWatch && 'Watch',
    isDev && 'Development',
    isProd && 'Production',
    useDevTool && 'DevTool',
    // minimizeBundles && 'minimize',
    // preprocessBundles && 'preprocess',
    // sourceMaps && 'sourceMaps',
    // extemeUglify && 'extemeUglify',
    DEBUG && 'DEBUG',
    THEME && 'theme:' + THEME,
  ].filter(x => x).join(' ');
  if (!isStats) {
    console.log('Building:', debugModes); // eslint-disable-line no-console
  }

  const devtoolMode = // @see https://webpack.js.org/configuration/devtool/#devtool
    // 'inline-source-map'
    // 'eval-source-map' // debugging -- 2021.01.18, 20:55 -- got error for `module.exports = require("react");`
    'source-map' // default
    // false // disable
  ;

  return {
    mode,
    entry: path.resolve(srcPath, jsEntryFile),
    performance: { hints: false },
    watch: isWatch,
    devtool: useDevTool && devtoolMode,
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    output: {
      path: buildPath,
      filename: bundleName(), // 'js/bundle.js',
    },
    devServer: {
      hot: hotReload,
      index: htmlFilename,
      // contentBase: buildPath,
      // watchContentBase: true,
      port: 8080,
      host: '0.0.0.0',
    },
    module: { rules: [
      { // Add sourcemaps for WebUiCore library
        test: /node_modules.*WebUiCore.*\.(js)$/,
        // enforce: 'pre',
        use: ['source-map-loader'],
      },
      { // JS
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: {
          // sourceRoot: '/',
          retainLines: true,
          cacheDirectory: true,
        },
      },
      /* { // JS
       *   test: /\.(js|jsx)$/,
       *   exclude: /(node_modules)/,
       *   use: [
       *     {
       *       loader: 'babel-loader',
       *       // use: ['source-map-loader'],
       *       options: {
       *         // sourceRoot: '/',
       *         inputSourceMap: true,
       *         sourceMaps: true,
       *         retainLines: true,
       *         cacheDirectory: true,
       *       },
       *     },
       *   ],
       * },
       */
      { // css/postcss
        test: /\.(pcss|css)$/,
        // exclude: /node_modules/, // Some imports may be from `node_modules/...`
        use: [
          cssHotReload ? 'style-loader' : ExtractCssPlugin.loader, // Hot styles reloading for dev-server
          {
            loader: require.resolve('css-loader'),
            options: {
              sourceMap: sourceMaps,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              sourceMap: sourceMaps,
              parser: require('postcss-scss'),
              plugins: () => postcssPlugins,
            },
          },
        ],
      },
      /* TODO:
       * resources (Not for demo)
       */
    ] },
    plugins: [
      !isDevServer && !isStats && new CleanWebpackPlugin({ // Cleanup before build
        cleanOnceBeforeBuildPatterns: [
          path.join(buildPath, '**/*'),
        ],
        exclude: ['.gitkeep'],
        beforeEmit: true,
        // verbose: true,
        // dry: false,
      }),
      // new webpack.SourceMapDevToolPlugin({
      //   // test: /\.(js|jsx)$/,
      // }),
      new webpack.DefinePlugin({ // Pass constants to source code
        'process.env': Object.entries(passParameters).reduce((data, [key, val]) => {
          return { ...data, [key]: JSON.stringify(val) };
        }, {})
      }),
      // new CopyWebpackPlugin({ // Simply copies the files over
      //   patterns: [
      //     { from: 'build-static', to: './', ...CopyWebpackPluginOptions },
      //   ].filter(x => x),
      // }),
      new HtmlWebpackPlugin({
        template: path.resolve(rootPath, 'html', htmlFilename),
        filename: htmlFilename,
        cache: true,
        inject: true,
        minimify: minimizeBundles,
        // title: appTitle, // Not using; see i18n-specific appTitle** variables above (passed to js code env)
        templateParameters: Object.assign({}, cssConfig, passParameters),
      }),
      !cssHotReload && new ExtractCssPlugin({ // Extract css
        filename: bundleName({ ext: '.css', dir: 'css/' }),
      }),
      // new webpack.NoEmitOnErrorsPlugin(), // ???
      !isDevServer && new CreateFileWebpack({ // Create build tag file // TODO: Pre-generate & copy on build?
        // path: './',
        path: buildPath,
        fileName: 'version.txt',
        content: buildTag,
      }),
      new WebpackBuildNotifierPlugin({
        // title, logo,
        suppressSuccess: true,
      }),
    ].filter(x => x),
    optimization: {
      // Minimize if not preprocess and minimize flags configured
      minimize: /* preprocessBundles || */ minimizeBundles,
      minimizer: [
        new UglifyJsPlugin({
          test: /\.js$/i,
          // parallel: 8,
          sourceMap: sourceMaps,
          uglifyOptions: {
            output: {
              comments: false,
              ie8: true
            },
            // https://github.com/mishoo/UglifyJS2#compress-options
            compress: {
              // drop_debugger: false,
              // screw_ie8: true,
              // sequences: true,
              // booleans: true,
              // loops: true,
              // unused: true,
              // warnings: false,
              // drop_console: true,
              // unsafe: true
            },
            // beautify: false,
          },
        }),
        new OptimizeCSSAssetsPlugin({}),
      ],
      /* // UNUSED: splitChunks
       * splitChunks: {
       *   cacheGroups: {
       *     // chunks: 'all',
       *     // minSize: 0,
       *     // maxSize: 0,
       *     // minChunks: 1,
       *     // maxAsyncRequests: 5,
       *     // maxInitialRequests: 3,
       *     // automaticNameDelimiter: '-',
       *     // name: true,
       *     default: false,
       *     vendors: false,
       *     vendor: {
       *       name: 'vendor',
       *       chunks: 'all',
       *       test: /node_modules/,
       *       priority: 20,
       *     },
       *     common: {
       *       name: 'common',
       *       minChunks: 2,
       *       chunks: 'all',
       *       priority: 10,
       *       reuseExistingChunk: true,
       *       enforce: true,
       *     },
       *   },
       * },
       */
    },
    /* // WebUi optimization mode
     * optimization: {
     *   // XXX 2019.06.03, 12:41 -- Minimize properties added by Igor
     *   minimize: isProd,
     *   minimizer: [
     *     new TerserPlugin({}),
     *     new OptimizeCSSAssetsPlugin({}),
     *   ],
     *   splitChunks: {
     *     chunks: 'all',
     *     minSize: 30000,
     *     maxSize: 0,
     *     minChunks: 1,
     *     maxAsyncRequests: 5,
     *     maxInitialRequests: 3,
     *     automaticNameDelimiter: '~',
     *     name: true,
     *     cacheGroups: {
     *       vendors: {
     *         name: 'vendor',
     *         test: /[\\/]node_modules[\\/]/,
     *         priority: -10,
     *         reuseExistingChunk: true,
     *       },
     *       default: {
     *         minChunks: 2,
     *         priority: -20,
     *       },
     *     },
     *   },
     * },
     */
    stats: {
      // Nice colored output
      colors: true,
    },
  };
};
