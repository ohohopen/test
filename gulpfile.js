var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
// var minifyCss = require('gulp-minify-css');
const cleanCSS = require('gulp-clean-css');var uglify = require('gulp-uglify');

var minimist = require('minimist');
var gulpif = require('gulp-if');

var envOptions = {
  string:'env',
  default: { env: 'develop'}
}

var options = minimist(process.argv.slice(2), envOptions)
console.log(options);

var gulpSequence = require('gulp-sequence');
var clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');

// const ghPages = require('gulp-gh-pages');


//最終發布前刪除tmp及public，避免有些測試檔或無用的頁面存在在給客戶的版本中；
gulp.task('clean', function () {
    return gulp.src(['./.tmp','./public'], {read: false})
        .pipe(clean());
});

gulp.task('copyHTML',function(){
  return gulp.src('./source/**/*.html')
    .pipe(plumber())
    .pipe(gulp.dest('./public/'))
})


// gulp.task('copyfolder',function(){
//   return gulp.src('./source/slick/**')
//     .pipe(plumber())
//     .pipe(gulp.dest('./public/slick'))
// })



gulp.task('jade', function() {
  // var YOUR_LOCALS = {};
 
  return gulp.src('./source/**/*.jade')
    .pipe(plumber())
    // .pipe(gulpif(options.env === 'production',jade()))
    // .pipe(jade())
    .pipe(jade({
      //flase為壓縮
      pretty: true
    }))
    .pipe(gulp.dest('./public/'))
    .pipe(browserSync.stream()) 
    
});

gulp.task('sass', function () {
  var plugins = [
    autoprefixer()
  ];
  return gulp.src('./source/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    //編繹完成css
    .pipe(postcss(plugins))
    .pipe(gulpif(options.env === 'production',cleanCSS()))
    // .pipe(minifyCss())
    // .pipe()
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream()) 
});

gulp.task('babel', () =>
  gulp.src('./source/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(concat('all.js'))
    .pipe(gulpif(options.env === 'production',uglify({
      compress: {
      // compress options
        drop_console:'ture'
      }
    })))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/js'))
    .pipe(browserSync.stream())
);

gulp.task('bower', function() {
  return gulp.src(mainBowerFiles())
      .pipe(gulp.dest('./.tmp/vendors'))
});

gulp.task('vendorJs', function() {
  return gulp.src('./.tmp/vendors/**/*.js')
  .pipe(concat('vendor.js'))
  .pipe(gulpif(options.env === 'production',uglify()))
  .pipe(gulp.dest('./public/js'))
});

gulp.task('browser-sync', function() {
  return browserSync.init({
      server: {baseDir: "./public"},
      reloadDebounce: 2000
  });
});

gulp.task('imagemin', () =>
  gulp.src('source/images/*')
      .pipe(gulpif(options.env === 'production',imagemin()))
      .pipe(gulp.dest('public/images'))
);

gulp.task('watch', function () {
  gulp.watch('./source/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('./source/**/*.jade', gulp.series('jade'));
  gulp.watch('./source/**/*.js', gulp.series('babel'));
});

gulp.task('build', gulp.series('clean','jade','sass','babel','bower', 'vendorJs','imagemin'));

// gulp.task('deploy', () => 
//   gulp.src('./public/**/*')
//     .pipe(ghPages())
// );
//有watch
gulp.task('default', gulp.series('sass', 'jade', 'babel', 'bower','vendorJs','imagemin', gulp.parallel('browser-sync', 'watch')));

//無watch
// gulp.task('default', gulp.series('sass', 'jade', 'babel', 'bower','vendorJs','imagemin'));
