const gulp = require('gulp');
const clean = require('gulp-clean');
const notify = require('gulp-notify');
const tslint = require('gulp-tslint');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const mergeStream = require('ordered-read-streams');
const tsconfig = require('./tsconfig.json');
const gulpDebug = require('gulp-debug');

// add srcFiles array constants
const srcFiles = [
  './src/**/*.ts',
];

// define out as outDir
const outDir = './out';

// add gulp task to clean outDir
gulp.task('clean', function() {
    return gulp.src(outDir, {read: false, allowEmpty: true})
         .pipe(clean())
         .pipe(notify('Clean task finished'));
});

// add gulp task to tslint src
gulp.task('tslint', () => {
  return gulp.src(srcFiles)
    .pipe(tslint({ }))
    .pipe(tslint.report({ summerizeFailureOutput: true }));
});

// add gulp task to compile typescript
gulp.task('compile', gulp.series('tslint', () => {
    var tsResult = gulp.src(srcFiles, { base: './src' })
    .pipe(sourcemaps.init())
    .pipe(ts(tsconfig.compilerOptions))
    .on("error", function(err) {
      console.log(err);
      this.emit('end');
    });
  return mergeStream([
    tsResult.dts.pipe(gulp.dest(outDir)),
    tsResult.js.pipe(sourcemaps.mapSources(function (sourcePath, file) { return "../src/" + sourcePath; }))
    .pipe(sourcemaps.write('./', { includeContent: false, sourceRoot: '' }))
    .pipe(gulp.dest(outDir)),
    tsResult.js.pipe(gulpDebug.default({ title: 'copied:' }))
  ]);
}));

gulp.task('debug', function(cb) {
  console.log('debugging');
  cb();
});

gulp.task('build', gulp.series('clean', 'compile'), function (cb) { cb() });

gulp.task('default', gulp.series('build'));