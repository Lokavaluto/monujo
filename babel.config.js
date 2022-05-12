module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      "useBuiltIns": "entry",
      targets: {
        chrome: "79"
      }
    }]
  ]
}
