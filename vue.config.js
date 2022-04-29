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
  }
};

