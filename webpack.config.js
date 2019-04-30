const packageJSON = require('./package.json');

const babelConf = packageJSON.babel;

const webpackConfig = {
    mode: 'production',
    entry: './src/index.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: babelConf,
                },
            },
        ],
    },
    output: {
        filename: './beautywe.min.js',
        libraryTarget: 'commonjs2',
    },
};

module.exports = webpackConfig;
