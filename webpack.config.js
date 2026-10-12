const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",

  entry: [
    "react-hot-loader/patch",
    "./src/index.js"
  ],

  output: {
    path: path.resolve(
      __dirname,
      "dist"
    ),

    filename: "bundle.js",

    publicPath: "/"
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,

        exclude:
          /node_modules|cdn_modules/,

        use: {
          loader:
            "babel-loader",

          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react"
            ],

            plugins: [
              "react-hot-loader/babel"
            ]
          }
        }
      }
    ]
  },

  resolve: {
    extensions: [
      ".js",
      ".jsx"
    ]
  },

  devServer: {
    port: 5000,

    static: {
      directory:
        path.resolve(
          __dirname,
          "dist"
        )
    },

    historyApiFallback: true,

    hot: true,

    proxy: [

      // Authentication
      {
        context: [
          "/auth"
        ],

        target:
          "http://localhost:8080",

        secure: false,

        changeOrigin: true
      },

      // Canvas APIs now hosted by auth server

      // Future compute services
      {
        context: [
          "/api/solver",
          "/api/jobs",
          "/api/results"
        ],

        target:
          "http://localhost:6700",

        secure: false,

        changeOrigin: true
      }

    ]
  },

  plugins: [
    new webpack
      .HotModuleReplacementPlugin()
  ]
};

