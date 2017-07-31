const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const extractSass = new ExtractTextPlugin({
    filename: 'css/[name][hash].css',
    disable: process.env.NODE_ENV === 'development'
})

const entries = getEntries('src/pages/**/index.js')
const pages = getEntries('src/pages/**/*.html')
const pagesArr = Object.keys(pages)

let config = {
    entry: entries,
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        filename: 'js/[name][hash].js',
        chunkFilename: 'js/[id].chunk.js'
    },
    module: {
        rules: [{
            test:/\.vue$/,
            loader: 'vue-loader',
            options: {
                loaders: {
                    css:ExtractTextPlugin.extract({
                        use: [
                            {loader: 'css-loader'},
                            {loader:'sass-loader'}
                        ],
                        fallback: 'vue-style-loader'
                    })
                }
            }
        }, {
            test: /\.s?css$/,
            loader:ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader'
                }],
                fallback: 'style-loader'
            })
        },{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        },{
            test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
            loader: 'file-loader?name=fonts/[name].[hash].[ext]'
        },{
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'file-loader?limit=2048&name=imgs/[name].[hash].[ext]'
        }]
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue': 'vue/dist/vue.esm.js'
        }
    },
    devServer: {
        contentBase: './',
        host: 'localhost',
        open:true,
        openPage:'./dist/pages/index.html',
        historyApiFallback: true,
        noInfo: true,
        port: 9090, //默认8080
        inline: true //可以监控js变化
    },
    performance: {
        hints: false
    },
    devtool: '#cheap-module-eval-source-map',
    plugins: [
        new webpack.ProvidePlugin({ //加载jq
            $: 'jquery'
        }),
        new CleanPlugin(['dist']),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons', // 将公共模块提取，生成名为`vendors`的chunk
            chunks: pagesArr, //提取哪些模块共有的部分
            minChunks: 3 // 提取至少3个模块共有的部分
        }),
        extractSass
    ]
}
Object.keys(entries).forEach(function(name, index) {
    const template = pages[pagesArr[index]]
    let plugin = new HtmlWebpackPlugin({
        favicon: './favicon.png', //favicon路径，通过webpack引入同时可以生成hash值
        filename: 'pages/' + name + '.html', //生成的html存放路径，相对于path
        template: './template.html', //html模板路径
        inject: true, //js插入的位置，true/'head'/'body'/false
        hash: true, //为静态资源生成hash值
        chunks: ['commons', name], //需要引入的chunk，不配置就会引入所有页面的资源
        minify: { //压缩HTML文件
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: false //删除空白符与换行符
        }
    })
    config.plugins.push(plugin)
})
module.exports = config
// 获取指定路径下的入口文件
function getEntries(globPath) {
    let files = glob.sync(globPath),
        entries = {};

    files.forEach(function(filepath) {
        // 取倒数第二层(view下面的文件夹)做包名
        var split = filepath.split('/');
        var name = split[split.length - 2];

        entries[name] = './' + filepath;
    });

    return entries;
}
