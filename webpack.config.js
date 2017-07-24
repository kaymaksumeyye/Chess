var path = require('path');
var webpack = require('webpack');

module.exports = {
 entry: './js/app.js',
 output: {
  path: __dirname,
  filename: 'js/bundle.js'
 },
 watch: true,
 module: {
  loaders: [
  {
    test: /\.jsx?$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    query: {
     presets: ['es2015', 'react']
    }
  },
  {
    test: /\.s?css$/,
    loader: ["style-loader", "css-loader", "sass-loader"],
  }
  ]
 },
};﻿
