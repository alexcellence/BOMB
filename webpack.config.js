var path = require('path');
var SRC_DIR = path.join(__dirname, '/react-client/src');
var DIST_DIR = path.join(__dirname, '/react-client/dist');

module.exports = {
  // entry: `${SRC_DIR}/index.jsx`,
  // output: {
  //   filename: 'bundle.js',
  //   path: DIST_DIR
  // },
  // // resolve: {
  // //   extensions: ['.js', '.jsx']
  // // },
  // module : {
  //   loaders : [
  //     {
  //       test : /\.jsx?/,
  //       include : SRC_DIR,
  //       loader : 'babel-loader',
  //       exclude: /node_modules/,
  //       query: {
  //         presets: ['react', 'es2015']
  //      }
  //     }
  //   ],
  //   rules: [
  //     {
  //       test: /\.css$/,
  //       use: [
  //         'style-loader',
  //         'css-loader'
  //       ]
  //     }
  //   ]
  // }
  entry: `${SRC_DIR}/index.jsx`,
  output: {
    filename: 'bundle.js',
    path: DIST_DIR
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: SRC_DIR,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            }
          },
          {
            loader: 'sass-loader',
          }
        ],
      }
    ]
  }
};