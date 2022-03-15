const path =  require('path')
const fs =  require('fs')

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
    /@lokavaluto\/.*/,
    /@0k.io\/.*/
  ],
  configureWebpack: {
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

