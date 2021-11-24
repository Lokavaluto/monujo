// vue.config.js
module.exports = {
  devServer: {
    watchOptions: {
      ignored: ['**/.#*', 'node_modules/**']
    }
  },
  lintOnSave: false,
  transpileDependencies: [
    // can be string or regex
    /@lokavaluto\/.*/
  ]
};

