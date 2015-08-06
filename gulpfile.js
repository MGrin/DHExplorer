'use strict';

var gulp = require('gulp');
var jsmin = require('gulp-jsmin');
var stylus = require('gulp-stylus');
var nodemon = require('gulp-nodemon');
var react = require('gulp-react');

var fs = require('fs-extra');

var ENV = process.env.NODE_ENV || 'development';

gulp.task('compile', function () {
  fs.mkdirpSync('./public/css/');

  gulp.src('./public/stylus/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./public/css/'));

});

gulp.task('compress', function() {
  fs.mkdirpSync('./public/cdn/');

  gulp.src('./public/js/*/*.jsx')
        .pipe(react({harmony: true}))
        .pipe(gulp.dest('./public/cdn/js/'));

  if (ENV === 'production') {
    gulp.src(['./public/js/*.js', './public/js/*/*.js'])
      .pipe(jsmin())
      .pipe(gulp.dest('./public/cdn/js/'));
  } else {
    gulp.src(['./public/js/*.js', './public/js/*/*.js'])
    .pipe(gulp.dest('./public/cdn/js/'));
  }
});

gulp.task('clean', function () {
  fs.removeSync('./public/cdn/');
  fs.removeSync('./public/css/');
});

gulp.task('default', ['clean', 'compile', 'compress'], function () {
  if (process.env.NODE_ENV === 'production') return;

  nodemon({
    watch: ['./', 'public/js', 'public/stylus', 'app'],
    script: 'app.js',
    tasks: ['clean', 'compile', 'compress']
  });
});
