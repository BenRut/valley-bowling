import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import del from 'del';
import imagemin from 'gulp-imagemin';
import webP from 'gulp-cwebp';
import autoprefixer from 'gulp-autoprefixer';
import webpack from 'webpack';
import webpackConfig from './webpack.config.js';

const paths = {
  styles: {
    src: 'src/styles/**/*.scss',
    dest: 'dist/styles/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'dist/scripts/'
  },
  images: {
    src: 'src/images/**/*',
    dest: 'dist/images/'
  }
};

/*
 * For small tasks you can export arrow functions
 */
export const clean = () => del(['assets']);

/*
 * You can also declare named functions and export them as tasks
 */


export function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(sourcemaps.write())
    // pass in options to the stream
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest));
}

export function stylesProd() {
  return gulp.src(paths.styles.src)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    // pass in options to the stream
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest));
}

export function scripts() {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        return reject(err)
      }
      if (stats.hasErrors()) {
        return reject(new Error(stats.compilation.errors.join('\n')))
      }
      resolve()
    })
  })
}

export function images() {
  return gulp.src(paths.images.src)
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(gulp.dest(paths.images.dest))
}

export function cwebp() {
  return gulp.src(paths.images.src)
    .pipe(cwebp())
    .pipe(gulp.dest(paths.images.dest))
}



// export function cacheBust() {
//   return gulp.src('scripts.php', { base: './' })
//     .pipe(wpcachebust({
//       themeFolder: './',
//       rootPath: './'
//     }))
//     .pipe(gulp.dest('./'))
// }



/*
 * You could even use `export as` to rename exported tasks
 */
function watchFiles() {
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.images.src, images);
}
export { watchFiles as watch };

const build = gulp.series(clean, gulp.parallel(styles, scripts, images));
const prod = gulp.series(clean, gulp.parallel(stylesProd, scripts, images));
/*
 * Export a default task
 */
export default build;