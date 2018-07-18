autoprefixer = require('gulp-autoprefixer');
browser = require('browser-sync');
concat = require('gulp-concat');
cssnano = require('gulp-cssnano');
del = require('del');
gulp = require('gulp');
imagemin = require('gulp-imagemin');
panini = require('panini');
sass = require('gulp-sass');
sourcemaps = require('gulp-sourcemaps');
rename = require('gulp-rename');
runSequence = require('run-sequence');
uglify = require('gulp-uglify');

gulp.task('build', function(done) {
  return runSequence(
    'clean',
    [
      'workflow-images',
      'workflow-css',
      'workflow-scripts',
      'workflow-panini',
      'workflow-configuration'
    ],
    function() {
      done();
    }
  );
});

gulp.task('default', function(done) {
  return runSequence('build', 'browser', 'watch', function() {
    done();
  });
});

gulp.task('clean', function() {
  return del(['./docs']);
});

gulp.task('workflow-images', function() {
  return gulp
    .src('./src/images/*')
    .pipe(
      imagemin({
        progressive: true
      })
    )
    .pipe(gulp.dest('./docs/img/'));
});

gulp.task('workflow-css', function() {
  return gulp
    .src('./src/styles/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      })
    )
    .pipe(cssnano())
    .pipe(rename('main.min.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./docs/css/'));
});

gulp.task('workflow-scripts', function() {
  return gulp
    .src('./src/scripts/*')
    .pipe(sourcemaps.init())
    .pipe(concat('site.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./docs/js/'));
});

gulp.task('workflow-panini', function() {
  return gulp
    .src('./src/views/pages/**/*.html')
    .pipe(
      panini({
        root: './src/views/pages/',
        layouts: './src/views/layouts/',
        partials: './src/views/partials/',
        helpers: './src/views/helpers/',
        data: './src/views/data/'
      })
    )
    .pipe(gulp.dest('./docs/'));
});

gulp.task('workflow-configuration', function() {
  return gulp.src('./src/configuration/*').pipe(gulp.dest('./docs/'));
});

gulp.task('browser', function(done) {
  browser.init({
    tunnel: true,
    server: './docs/',
    port: 1994
  });
  return done();
});

gulp.task('workflow-panini:refresh', function(done) {
  panini.refresh();

  return done();
});

gulp.task('browser:reload', function(done) {
  browser.reload();
  return done();
});

gulp.task('watch', function() {
  gulp.watch(['./src/styles/**/*.scss'], function() {
    runSequence('workflow-css', 'browser:reload');
  });
  gulp.watch(['./src/scripts/**/*.js'], function() {
    runSequence('workflow-scripts', 'browser:reload');
  });
  gulp.watch(
    ['./src/views/{layouts,partials,pages,helpers,data}/**/*'],
    function() {
      runSequence(
        'workflow-panini:refresh',
        'workflow-panini',
        'browser:reload'
      );
    }
  );
});
