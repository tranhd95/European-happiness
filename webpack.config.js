const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractPlugin = new ExtractTextPlugin({
    filename: "bundle.css"
});

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
                use: extractPlugin.extract({
                    fallback: ["style-loader"],
                    use: ["css-loader"]
                })
            }
        ]
    },
    plugins: [
        extractPlugin
    ]
};