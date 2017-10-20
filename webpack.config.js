var webpack = require('webpack');

module.exports = {
    //devtool: 'cheap-module-eval-source-map',
    //devtool: 'source-map',
    devtool: 'cheap-module-source-map',
    entry: [
        "./app/js/index.js"
    ],
    output: {
        path: __dirname + '/app/static/js',
        filename: "bundle.js"
        //filename: "bundle.[chunkhash:8].js"
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            //设置soucemap为true，可以在线上生成soucemap文件，便于调试
            //sourceMap: true,
            compressor: {
                warnings: false
            }
        })
    ],
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                loader: "babel-loader",
                exclude: /(node_modules|bower_components)/,
                query: {
                    presets: ['react', 'es2015'],
                    "plugins": [
                        ["import", {"libraryName": "antd", "style": true}]
                    ]
                }
            },
            {
                test: /\.(scss|less|css)$/,
                loaders: ["style-loader", "css-loader", "sass-loader", "less-loader"]
            }, {
                test: /\.less$/,
                loader: 'less-loader?{modifyVars:{"@primary-color":"#4fc4e6"}}'
            }
        ]
    }
};
