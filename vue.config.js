const path =  require('path')
const fs =  require('fs')
const webpack = require("webpack")

// vue.config.js
module.exports = {
  devServer: {
    static: {
      watch: {
        ignored: ["**/.#*", "node_modules/**"],
      },
    },
  },
  lintOnSave: false,
  transpileDependencies: [
    // can be string or regex
    /@lokavaluto\/.*/,
    /@0k.io\/.*/
  ],
  configureWebpack: {
    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
        url: require.resolve("url/"),
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/"),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: ["process"],
      }),
    ],
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          { loader: "@epegzz/sass-vars-loader", options: {
            syntax: 'scss',
            // Variables from the config file
            vars: require(path.resolve(__dirname, 'public/config.json')).theme,
            // Variables from an optional separate scss file
            files: (function() {
              let sassConfigFilePath = path.resolve(__dirname, 'public/config.theme.scss')
              return fs.existsSync(sassConfigFilePath) ? [ sassConfigFilePath ] : []
            })()
          }
        }]
      }]
    }
  }
};

