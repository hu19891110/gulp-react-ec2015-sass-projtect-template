'use strict';
var gulp = require('gulp');
var babel = require('gulp-babel');
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var $ = require('gulp-load-plugins')();

gulp.task('convert:js',function () {
    return gulp.src('./src/js/main.js').pipe(babel()).pipe(gulp.dest('./dist/js'));
});
gulp.task('build:js',['convert:js'],function () {
    var b = browserify({
        entries:'./dist/js/main.js'
    });
    return b.bundle({

    }).pipe(source('bundle.js')).pipe(gulp.dest('./dist/js'));
});