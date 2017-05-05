const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: "./src/js/app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/dist"
    },
    module: {
        rules: [
            { test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: ["css-loader"]
                })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["es2015"]
                        }
                    }]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("bundle.css")
    ]
};