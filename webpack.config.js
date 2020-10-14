const path = require('path');
const HWP = require('html-webpack-plugin');
 
 module.exports = {
    performance: { hints: false },
    entry: path.join(__dirname, '/src/index.js'),
    node: {
      fs: "empty"
   },
    output: {
        filename: 'build.js',
        path: path.join(__dirname, '/dist')},
    module:{
        rules:[{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',  
                query: {
                  presets: ['@babel/react', '@babel/preset-env'],
                  plugins: ['@babel/proposal-class-properties']
                }
            },
            {
                test: /\.css$/,
                loader: ['style-loader','css-loader'],       
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                  'file-loader',
                  {
                    loader: 'image-webpack-loader',
                    options: {
                      bypassOnDebug: true, // webpack@1.x
                      disable: true, // webpack@2.x and newer
                    },
                  },
                ],
              }
        ]
    },
    plugins:[
        new HWP(
           {template: path.join(__dirname,'public/index.html')}
        )
        //new webpack.NamedModulesPlugin(),
    ]
 }