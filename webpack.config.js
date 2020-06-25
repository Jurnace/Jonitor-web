const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
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
                use: ["style-loader", "css-loader"]
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
        new HTMLWebpackPlugin({
            template: "src/assets/index.html"
        })
    ],
    devServer: {
        //host: "0.0.0.0",
        port: 3000,
        contentBase: path.join(__dirname, "dist"),
        hotOnly: true,
        proxy: {
            "/ws": {
                target: "ws://localhost:10113/ws",
                ws: true
            }
        }
    },
    devtool: "cheap-module-eval-source-map"
};