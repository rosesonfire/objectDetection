var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var HtmlWebpackExcludeAssetsPlugin = require("html-webpack-exclude-assets-plugin");

const template = "./template.html";
const app = "./objectDetection.js";
const scripts = "./script.js";
const styles = "./style.css";
const imgPath = __dirname + "/img";
const outputPath = __dirname + "/public";

module.exports = {
  entry: {
    app: app,
    scripts: scripts,
    styles: styles
  },
  output: {
    path: outputPath,
    filename: "[name].min.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract([
          {
            loader: "css-loader",
            options: {
              minimize: true
            }
          }
        ])
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("[name].min.css"),
    new HtmlWebpackPlugin({
      hash: true,
      template: template,
      excludeAssets: [/styles.*js/],
      chunksSortMode: (a, b) => {
        if (a.names[0] === "app") {
          return -1;
        }

        return 1;
      }
    }),
    new HtmlWebpackExcludeAssetsPlugin()
  ],
  devServer: {
    inline: true,
    open: true,
    contentBase: imgPath
  }
};