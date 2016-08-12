'use strict';
var fs = require("fs");
var gulp = require('gulp');
var browserify = require("browserify");
var $ = require('gulp-load-plugins')();

gulp.task('build:js',function () {
    browserify("./src/js/main.js").transform("babelify",{
        "presets":['react','es2015'],
        "sourceMaps":true
    }).bundle().pipe(fs.createWriteStream("./dist/js/main.js"));
});