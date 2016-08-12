'use strict';
var gulp = require('gulp');
var runSequence = require('gulp-run-sequence');
var babel = require('gulp-babel');
var browserify = require("browserify");
var babelify = require("babelify");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserifyShim = require("browserify-shim");
var uglify = require('gulp-uglify');
var httpServer = require('http-server');
var minify = require('gulp-minify-css');
var contentInclude = require('gulp-content-includer');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var $ = require('gulp-load-plugins')();
//导入包信息文件
var pkg = require('./package.json');
//项目配置文件
var config = {
    path: {
        html: './src/*.html',
        layout:'./src/layout/*.html',
        mainjs: './src/js/main.js',
        js:'./src/js/*.js',
        jslib:'./src/jslib/*.js',
        images: './src/images/**/*',
        mainsass:'./src/sass/main.scss',
        sass: './src/sass/*.scss',
        json:'./src/json/**/*',
        fonts: './src/fonts/**/*',
        data: './src/data/**/*'
    },
    dist: {
        root: './dist',
        js: './dist/js',
        lib:'./dist/lib',
        css: './dist/css',
        json:'./dist/json',
        fonts: './dist/fonts',
        images: './dist/images',
        data: './dist/data'
    },
    AUTOPREFIXER_BROWSERS: [
        'ie >= 8',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 2.3',
        'bb >= 10'
    ]
};
var dateFormat = 'UTC:yyyy-mm-dd"T"HH:mm:ss Z';
var banner = [
    '/*! <%= pkg.name %> v<%= pkg.version %><%=ver%>',
    'by Trendsoft Team',
    '<%= pkg.homepage %>',
    '(c) ' + $.util.date(Date.now(), 'UTC:yyyy') + ' Trendsoft, Inc.',
    '<%= pkg.license.type %>',
    $.util.date(Date.now(), dateFormat) + ' */ \n'
].join(' | ');
//amazeui
gulp.task('copy:amazeui',function () {
    gulp.src('./node_modules/amazeui-touch/dist/**/*').pipe(gulp.dest(config.dist.lib+'/amazeui-touch'));
});
//fonts
gulp.task('copy:fonts',function () {
    gulp.src(config.path.fonts).pipe(gulp.dest(config.dist.fonts));
});
//images
gulp.task('build:images',function () {
    gulp.src(config.path.images).pipe(imagemin()).pipe(gulp.dest(config.dist.images));
});
//json
gulp.task('copy:json',function () {
    gulp.src(config.path.json).pipe(gulp.dest(config.dist.json));
});
//jslib
gulp.task('copy:jslib',function () {
    gulp.src(config.path.jslib).pipe(gulp.dest(config.dist.js));
});
//data
gulp.task('copy:data',function () {
    gulp.src(config.path.data).pipe(gulp.dest(config.dist.data));
});
//sass
gulp.task('build:sass',function () {
    gulp.src(config.path.mainsass).pipe(sourcemaps.init()).pipe($.header(banner,{pkg:pkg,ver:''})).pipe($.plumber({errorHandler:function (err) {
        console.log(err);
        this.emit('end');
    }})).pipe($.sass()).pipe($.autoprefixer({browsers:config.AUTOPREFIXER_BROWSERS})).pipe(gulp.dest(config.dist.css)).pipe(minify()).pipe($.rename({
        'suffix': '.min',
        'extname': '.css'
    })).pipe(sourcemaps.write('./')).pipe(gulp.dest(config.dist.css));
});

gulp.task('build:js',function () {
    return browserify().add(config.path.mainjs).bundle().pipe(source('./main.js')).pipe($.header(banner,{pkg:pkg,ver:''})).pipe(gulp.dest(config.dist.js)).pipe(buffer()).pipe(uglify()).pipe($.header(banner,{pkg:pkg,ver:''})).pipe($.rename({
        'suffix': '.min',
        'extname': '.js'
    })).pipe(gulp.dest(config.dist.js));
});
//html
gulp.task('build:html',function () {
    gulp.src(config.path.html).pipe(contentInclude({
        includerReg:/<!\-\-include\s+"([^"]+)"\-\->/g
    })).pipe(gulp.dest(config.dist.root));
});
gulp.task('copy:lib',function (cb) {
    runSequence(['copy:amazeui','copy:jslib'],cb);
});
gulp.task('copy:src',function (cb) {
    runSequence(['copy:fonts','build:images','copy:data','copy:json'],cb);
});
gulp.task('build:src',function (cb) {
    runSequence(['build:sass','build:js','build:html'],cb);
});
gulp.task('clean', function() {
    return del([config.dist.root]);
});
gulp.task('build', function(cb) {
    runSequence(['copy:lib','copy:src','build:src'], cb);
});
gulp.task('watch', function() {
    gulp.watch([config.path.html,config.path.layout],['build:html']);
    gulp.watch(config.path.js,['build:js']);
    gulp.watch(config.path.sass,['build:sass']);
    gulp.watch(config.path.fonts,['copy:fonts']);
    gulp.watch(config.path.images,['build:images']);
    gulp.watch(config.path.data,['copy:data']);
});
gulp.task('run', function() {
    var server = httpServer.createServer({
        root: './dist'
    });
    server.listen(81);
    console.log('http://localhost:81');
});
gulp.task('default', ['build','run','watch']);