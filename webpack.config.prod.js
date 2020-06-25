const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: path.resolve(__dirname, "src"),
                loader: "babel-loader"
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.(svg|woff2|png)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]"
                }
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx"]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css"
        }),
        new HTMLWebpackPlugin({
            template: "src/assets/index.html"
        })
    ],
    optimization: {
        minimizer: [
            new TerserPlugin(),
            new OptimizeCssAssetsPlugin({
                cssProcessorPluginOptions: {
                    preset: ["default", {
                        discardComments: {
                            removeAll: true
                        }
                    }]
                }
            })
        ],
    },
};