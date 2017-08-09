var autoprefixer = require('gulp-autoprefixer');
    browser = require('browser-sync');
    concat = require('gulp-concat');
    cssnano = require('gulp-cssnano');
    del = require('del');
    gulp = require('gulp');
    imagemin = require('gulp-imagemin');
    panini = require('panini');
    sass = require('gulp-sass');
    sourcemaps = require('gulp-sourcemaps');
    rename = require("gulp-rename");
    runSequence = require('run-sequence');
    uglify = require('gulp-uglify');

gulp.task('build', function (done) {
    return runSequence('clean', ['panini', 'workflow-images', 'workflow-styles', 'workflow-scripts'], function () {
        done();
    });
});

gulp.task('default', function (done) {
    return runSequence('build', 'browser', 'watch', function () {
        done();
    });
});

gulp.task('clean', function () {
    return del(['./docs/']);
});

gulp.task('workflow-images', function () {
    return gulp.src('./src/www/img/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('./docs/img/'))
});

gulp.task('workflow-styles', function () {
    return gulp.src('./src/www/sass/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cssnano())
        .pipe(rename('main.min.css'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./docs/css/'))
});

gulp.task('workflow-scripts', function () {
    return gulp.src('./src/www/scripts/all.js')
        .pipe(gulp.dest('./docs/js/'));
});

gulp.task('panini', function () {
    return gulp.src('./src/www/pages/**/*.html')
        .pipe(panini({
            root: './src/www/pages/',
            layouts: './src/www/layouts/',
            partials: './src/www/partials/',
            helpers: './src/www/helpers/',
            data: './src/www/data/'
        }))
        .pipe(gulp.dest('./docs/'))
});

gulp.task('panini:refresh', function (done) {
    panini.refresh();

    return done();
});

gulp.task('browser', function (done) {
    browser.init({
        server: './docs/',
        port: 8300
    });
    return done();
});

gulp.task('browser:reload', function (done) {
    browser.reload();
    return done();
});

gulp.task('watch', function () {
    gulp.watch(['./src/www/sass/**/*.scss'],
        function () {
            runSequence('workflow-styles', 'browser:reload');
        });    
    gulp.watch(['./src/www/scripts/**/*.js'],
        function () {
            runSequence('workflow-scripts', 'browser:reload');
        });
    gulp.watch(['./src/www/{layouts,partials,pages,helpers,data}/**/*'], 
        function () {
            runSequence('panini:refresh', 'panini', 'browser:reload');
        });
});