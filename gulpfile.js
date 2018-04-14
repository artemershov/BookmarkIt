/* eslint-env node */

'use strict';

// Modules =================================================

// Modules: Gulp
const gulp     = require('gulp');
const gulpif   = require('gulp-if');
const sequence = require('run-sequence');

// Modules: Debug
const debug    = require('gulp-debug');
const plumber  = require('gulp-plumber');
const notify   = require('gulp-notify');

// Modules: Files
const filter   = require('gulp-filter');
const rename   = require('gulp-rename');
const clean    = require('gulp-clean');

// Modules: Cache
const newer    = require('gulp-newer');
const cached   = require('gulp-cached');
const remember = require('gulp-remember');

// Modules: Compile
const concat   = require('gulp-concat');
const srcmap   = require('gulp-sourcemaps');

// Modules: Other
const yarn     = require('main-yarn-files');
const browser  = require('browser-sync').create();
// const history  = require('connect-history-api-fallback');

// Modules: HTML
const pug      = require('gulp-pug');
const nghtml   = require('gulp-ng-html2js');

// Modules: JS
const babel    = require('gulp-babel');
const uglify   = require('gulp-uglify');

// Modules: CSS
const sass     = require('gulp-sass');
const prefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');

// Modules: Images
const imagemin = require('gulp-imagemin');
const jpegcomp = require('imagemin-jpeg-recompress');

// Config ==================================================

const packageJson = require('./package.json');

// Compile config
const param = {
  map:   false,
  min:   true,
  debug: false,
};

// Source and descination paths
const path = {
  src: {
    base:    './dev/',
    js:      '/js/',
    sass:    '/sass/',
    images:  '/images/',
    fonts:   '/fonts/',
    html:    '/html/',
  },
  dest: {
    base:   './dist/',
    assets: '/assets/',
    js:     '/assets/app/',
    css:    '/assets/app/',
    html:   '/assets/app/',
    vendor: '/assets/app/',
    images: '/assets/images/',
    fonts:  '/assets/fonts/',
  },
  server: {
    base: '/BookmarkIt/dist/',
    url: 'http://localhost/',
  },
  map: 'maps',
};
const file = {
  app: {
    js:   'main.js',
    css:  'main.css',
    html: 'templates.js',
  },
  vendor: {
    js:  'vendor.js',
    css: 'vendor.css',
  }
};

// Browser Sync config
const bsConfig = {
  // // Start server
  // server: {
  //   baseDir: path.dest.base,
  //   middleware: [history()]
  // },

  // Use existing server
  proxy: path.server.url + path.server.base,

  snippetOptions: {
    rule: {
      match: /<\/head>/i,
      fn: (snippet, match) => snippet + match
    }
  }
};

// Helper ==================================================

// Error handler
const errHandler = title => plumber({
  errorHandler: notify.onError(err => ({
    title: title + ': ' + err.name,
    message: err.message
  }))
});

// Get dependencies files
const getYarn = () => yarn({
  env: 'browser',
  debugging: param.debug,
  paths: {
    modulesFolder: 'node_modules',
    jsonFile: 'package.json'
  }
});

// Compile =================================================

// Compile app
gulp.task('compile:app:js', () =>
  gulp.src(path.src.base + path.src.js + '**/*.js')
    .pipe(errHandler('JS'))
    .pipe(gulpif(param.debug, debug({title: 'JS'})))
    .pipe(cached('compile:app:js'))
    .pipe(gulpif(param.map, srcmap.init()))
    .pipe(babel({presets: ['env']}))
    .pipe(gulpif(param.min, uglify()))
    .pipe(remember('compile:app:js'))
    .pipe(concat(file.app.js))
    // .pipe(gulpif(param.min, rename({suffix: '.min'})))
    .pipe(gulpif(param.map, srcmap.write(path.map, {sourceRoot: path.src.base + path.src.js})))
    .pipe(gulp.dest(path.dest.base + path.dest.js))
);
gulp.task('compile:app:css', () =>
  gulp.src(path.src.base + path.src.sass + 'main.sass')
    .pipe(errHandler('SASS'))
    .pipe(gulpif(param.debug, debug({title: 'SASS'})))
    .pipe(gulpif(param.map, srcmap.init()))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(prefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulpif(param.min, cleancss()))
    .pipe(remember('compile:app:css'))
    .pipe(rename(file.app.css))
    // .pipe(gulpif(param.min, rename({suffix: '.min'})))
    .pipe(gulpif(param.map, srcmap.write(path.map, {sourceRoot: path.src.base + path.src.sass})))
    .pipe(gulp.dest(path.dest.base + path.dest.css))
);
gulp.task('compile:app:img', () =>
  gulp.src(path.src.base + path.src.images + '**/*')
    .pipe(errHandler('IMG'))
    .pipe(gulpif(param.debug, debug({title: 'IMG'})))
    .pipe(newer(path.dest.base + path.dest.images))
    .pipe(imagemin([
      jpegcomp(),
      imagemin.jpegtran({progressive: true}),
      imagemin.gifsicle({interlaced: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest(path.dest.base + path.dest.images))
);
gulp.task('compile:app:html', () =>
  gulp.src(path.src.base + path.src.html + '**/*.pug')
    .pipe(errHandler('HTML'))
    .pipe(gulpif(param.debug, debug({title: 'HTML'})))
    .pipe(cached('compile:app:html'))
    .pipe(gulpif(param.map, srcmap.init()))
    .pipe(pug({pretty: !param.min}))
    .pipe(nghtml({
      moduleName: 'app',
      prefix: ''
    }))
    .pipe(gulpif(param.min, uglify()))
    .pipe(remember('compile:app:html'))
    .pipe(concat(file.app.html))
    // .pipe(gulpif(param.min, rename({suffix: '.min'})))
    .pipe(gulpif(param.map, srcmap.write(path.map, {sourceRoot: path.src.base + path.src.html})))
    .pipe(gulp.dest(path.dest.base + path.dest.html))
);
gulp.task('compile:app:fonts', () =>
  gulp.src(path.src.base + path.src.fonts + '**/*')
    .pipe(errHandler('Fonts'))
    .pipe(gulpif(param.debug, debug({title: 'Fonts'})))
    .pipe(newer(path.dest.base + path.dest.fonts))
    .pipe(gulp.dest(path.dest.base + path.dest.fonts))
);
gulp.task('compile:app:index', () =>
  gulp.src(path.src.base + 'index.pug')
    .pipe(errHandler('Index'))
    .pipe(gulpif(param.debug, debug({title: 'Index'})))
    .pipe(cached('compile:app:index'))
    .pipe(pug({
      pretty: !param.min,
      data: {
        meta: {
          title:       packageJson.title,
          description: packageJson.description,
          keywords:    packageJson.keywords,
        },
        path: path.server,
        files: {
          css: [
            path.server.base + path.dest.vendor + file.vendor.css,
            path.server.base + path.dest.css    + file.app.css,
          ],
          js: [
            path.server.base + path.dest.vendor + file.vendor.js,
            path.server.base + path.dest.js     + file.app.js,
            path.server.base + path.dest.html   + file.app.html,
          ],
        }
      },
    }))
    .pipe(remember('compile:app:index'))
    .pipe(gulp.dest(path.dest.base))
);
gulp.task('compile:app', [
  'compile:app:js',
  'compile:app:css',
  'compile:app:img',
  'compile:app:html',
  'compile:app:fonts',
  'compile:app:index',
]);

// Compile vendor
gulp.task('compile:vendor:js', () =>
  gulp.src(getYarn())
    .pipe(errHandler('Vendor JS'))
    .pipe(gulpif(param.debug, debug({title: 'Vendor JS'})))
    .pipe(filter('**/*.js'))
    .pipe(gulpif(param.map, srcmap.init()))
    .pipe(concat(file.vendor.js))
    .pipe(gulpif(param.min, uglify()))
    // .pipe(gulpif(param.min, rename({suffix: '.min'})))
    .pipe(gulpif(param.map, srcmap.write(path.map, {sourceRoot: './vendor/js/'})))
    .pipe(gulp.dest(path.dest.base + path.dest.vendor))
);
gulp.task('compile:vendor:css', () =>
  gulp.src(getYarn())
    .pipe(errHandler('Vendor CSS'))
    .pipe(gulpif(param.debug, debug({title: 'Vendor CSS'})))
    .pipe(filter('**/*.css'))
    .pipe(gulpif(param.map, srcmap.init()))
    .pipe(concat(file.vendor.css))
    .pipe(gulpif(param.min, cleancss()))
    // .pipe(gulpif(param.min, rename({suffix: '.min'})))
    .pipe(gulpif(param.map, srcmap.write(path.map, {sourceRoot: './vendor/css/'})))
    .pipe(gulp.dest(path.dest.base + path.dest.vendor))
);
gulp.task('compile:vendor:fonts', () =>
  gulp.src(getYarn())
    .pipe(errHandler('Vendor Fonts'))
    .pipe(gulpif(param.debug, debug({title: 'Vendor Fonts'})))
    .pipe(filter('**/fonts/*'))
    .pipe(newer(path.dest.base + path.dest.fonts))
    .pipe(gulp.dest(path.dest.base + path.dest.fonts))
);
gulp.task('compile:vendor', [
  'compile:vendor:js',
  'compile:vendor:css',
  'compile:vendor:fonts',
]);

// Compile all
gulp.task('compile', [
  'compile:app',
  'compile:vendor',
]);

// Clean ===================================================

gulp.task('clean:js', () =>
  gulp.src(path.dest.base + path.dest.js + '*', {read: false})
    .pipe(errHandler('Clean JS'))
    .pipe(clean({force: true}))
);
gulp.task('clean:css', () =>
  gulp.src(path.dest.base + path.dest.css + '*', {read: false})
    .pipe(errHandler('Clean CSS'))
    .pipe(clean({force: true}))
);
gulp.task('clean:img', () =>
  gulp.src(path.dest.base + path.dest.images + '*', {read: false})
    .pipe(errHandler('Clean IMG'))
    .pipe(clean({force: true}))
);
gulp.task('clean:html', () =>
  gulp.src(path.dest.base + path.dest.html + '*', {read: false})
    .pipe(errHandler('Clean HTML'))
    .pipe(clean({force: true}))
);
gulp.task('clean:fonts', () =>
  gulp.src(path.dest.base + path.dest.fonts + '*', {read: false})
    .pipe(errHandler('Clean Fonts'))
    .pipe(clean({force: true}))
);
gulp.task('clean:index', () =>
  gulp.src(path.dest.base + 'index.html', {read: false})
    .pipe(errHandler('Clean Index'))
    .pipe(clean({force: true}))
);
gulp.task('clean:vendor', () =>
  gulp.src(path.dest.base + path.dest.vendor + '*', {read: false})
    .pipe(errHandler('Clean Vendor'))
    .pipe(clean({force: true}))
);

// Clean all
gulp.task('clean', [
  'clean:js',
  'clean:css',
  'clean:img',
  'clean:html',
  'clean:fonts',
  'clean:index',
  'clean:vendor',
]);

// Watch ===================================================

gulp.task('watch:compile', () => {
  gulp.watch(path.src.base + path.src.js     + '**/*', ['compile:app:js']);
  gulp.watch(path.src.base + path.src.sass   + '**/*', ['compile:app:css']);
  gulp.watch(path.src.base + path.src.images + '**/*', ['compile:app:img']);
  gulp.watch(path.src.base + path.src.html   + '**/*', ['compile:app:html']);
  gulp.watch(path.src.base   + 'index.pug', ['compile:app:index']);
});
gulp.task('watch:browser', () => {
  browser.watch([
    path.dest.base + '**/*.js',
    path.dest.base + '**/*.css',
    path.dest.base + '**/*.html',
  ]).on('change', browser.reload);
  browser.init(bsConfig);
});

// Watch all
gulp.task('watch', [
  'watch:compile',
  'watch:browser'
]);

// Helper ==================================================

gulp.task('yarn', () => {
  getYarn().forEach(el => {
    process.stdout.write(el + '\n');
  });
});

// Init ====================================================

gulp.task('default', () => sequence('clean', 'compile', 'watch'));
