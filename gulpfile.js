const { src, dest, parallel, series, watch } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();

const $ = gulpLoadPlugins();

const paths = {
  source: {
    scripts: [
      'src/js/main.js',
    ],
    styles: [
      'src/css/**/*.css',
      'src/scss/**/*.scss'
    ],
    images: 'assets/images/**/*.jpg'
  },
  target: {
    scripts: 'dist/js',
    styles: 'dist/css',
    images: 'dist/img',
    sourcemaps: './maps',
  }
};

function styles() {
  return src(paths.source.styles)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({outputStyle: 'compressed'}).on('error', $.sass.logError))
    .pipe($.concat('app.min.css'))
    .pipe($.autoprefixer())
    .pipe($.cssnano())
    .pipe($.sourcemaps.write(paths.target.sourcemaps))
    .pipe(dest(paths.target.styles))
    .pipe(browserSync.stream())
}

function scripts() {
  return src(paths.source.scripts)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat('app.min.js'))
    .pipe($.terser())
    .pipe($.sourcemaps.write(paths.target.sourcemaps))
    .pipe(dest(paths.target.scripts))
    .pipe(browserSync.stream())
}

function webP(config) {
  return src(paths.source.images)
    .pipe($.webp(config))
    .pipe(dest(paths.target.images))
}

function webPFallback(config) {
  return src(paths.source.images)
    .pipe($.imagemin([
      $.imagemin.mozjpeg(config)
    ]))
    .pipe(dest(paths.target.images))
}

function images() {
  const config = {
    quality: 75
  };
  return webP(config)
    .pipe(webPFallback(config));
}

function serve() {
  browserSync.init({ server: { baseDir: './' } });
  watch('src/scss/**/*.scss', series('styles'));
  watch('src/js/*.js', series('scripts'));
  watch('assets/images/**/*.jpg', series('images'));
  watch('*.html').on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.serve = serve;
exports.build = parallel(styles, scripts);
exports.default = parallel(styles, scripts, images, serve);
