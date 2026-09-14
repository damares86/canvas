const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' )( require( 'sass' ) );
const rtlcss = require('gulp-rtlcss');
const concat = require('gulp-concat');
const htmlmin = require('gulp-html-minifier-terser');
const browserSync = require( 'browser-sync' ).create();
const cleanCSS = require('gulp-clean-css');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const plumber = require('gulp-plumber');
const { parallel } = require('gulp');
const { series } = require('gulp');

const silencedSassDeprecations = ['color-functions', 'global-builtin', 'import', 'mixed-decls', 'abs-percent'];

/**
 * Compile SCSS
 */
function compileSCSS() {
	return gulp.src( './style.scss', { sourcemaps: true } )
		.pipe( plumber() )
		.pipe( sass({ silenceDeprecations: silencedSassDeprecations }).on('error', sass.logError) )
		.pipe( concat('./style.css') )
		.pipe( postcss([ autoprefixer() ]) )
		.pipe( gulp.dest('./', { sourcemaps: '.' }) )
		.pipe( browserSync.stream() );
}

function convertRTL() {
	return gulp.src( './style.css')
		.pipe( plumber() )
		.pipe( rtlcss() )
		.pipe( concat('./style-rtl.css') )
		.pipe( gulp.dest('./') );
}

function compileDemosCSSandRTL() {
	return gulp.src(['./demos/**/*.css', '!./demos/**/*-rtl.css'])
		.pipe( plumber() )
		.pipe( rtlcss() )
		.pipe(rename({
			suffix: "-rtl",
		}))
		.pipe( gulp.dest('./dist/demos/') );
}

async function compressImages() {
	const { default: imagemin, gifsicle, mozjpeg, optipng, svgo } = await import('gulp-imagemin');
	return gulp.src(['./**/*.{jpg,png,jpeg,gif,svg}', '!**/node_modules{,/**}', '!./dist{,/**}'])
		.pipe( plumber() )
		.pipe( imagemin(
			[
				gifsicle(),
				mozjpeg(),
				optipng(),
				svgo({
					plugins: [
						{ name: 'preset-default', params: { overrides: { removeViewBox: false, cleanupIds: false } } }
					]
				})
			]
		) )
		.pipe(gulp.dest( './dist' ));
}

function minifyHTML() {
	return gulp.src('./*.html')
		.pipe( plumber() )
		.pipe(htmlmin({
			"collapseWhitespace": true,
			"removeComments": true,
			"removeOptionalTags": true,
			"removeRedundantAttributes": true,
			"removeScriptTypeAttributes": true,
			"minifyCss": true,
			"minifyJs": true
		}))
		.pipe(gulp.dest('./dist'));
}

function minifyJS() {
	return gulp.src('./js/**/*.js')
		.pipe( plumber() )
		.pipe(terser())
		.pipe(gulp.dest('./dist/js'));
}

function concatAllPlugins() {
	return gulp.src(['./js/jquery.js', './js/plugins.*.js', './js/components/moment.js', '!./js/plugins.js', '!./js/plugins.min.js'])
		.pipe( plumber() )
		.pipe(concat('./plugins.js'))
		.pipe(gulp.dest('./dist/js'));
}

function concatAllPluginsMin() {
	return gulp.src(['./dist/js/plugins.js'])
		.pipe( plumber() )
		.pipe(concat('./plugins.min.js'))
		.pipe(terser())
		.pipe(gulp.dest('./dist/js'));
}

function buildFunctions() {
	return gulp.src(['./js/functions.js'])
		.pipe( plumber() )
		.pipe(concat('./functions.js'))
		.pipe(gulp.dest('./dist/js'));
}

function buildFunctionsBundle() {
	return gulp.src(['./js/functions.bundle.js'])
		.pipe( plumber() )
		.pipe(concat('./functions.bundle.js'))
		.pipe(gulp.dest('./dist/js'));
}

function functionsMin() {
	return gulp.src(['./dist/js/functions.js'])
		.pipe( plumber() )
		.pipe(concat('./functions.min.js'))
		.pipe(terser())
		.pipe(gulp.dest('./dist/js'));
}

function functionsBundleMin() {
	return gulp.src(['./dist/js/functions.bundle.js'])
		.pipe( plumber() )
		.pipe(concat('./functions.bundle.min.js'))
		.pipe(terser())
		.pipe(gulp.dest('./dist/js'));
}

function jsBundle() {
	return gulp.src(['./dist/js/plugins.min.js', './dist/js/functions.bundle.js'])
	.pipe( plumber() )
	.pipe(concat('./bundle.js'))
	.pipe(terser())
	.pipe(gulp.dest('./dist/js'));
}

function minifyCSS() {
    return gulp.src(['./**/*.css', '!**/node_modules{,/**}', '!**/dist{,/**}'])
    .pipe( plumber() )
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist'));
}

function watch() {
	browserSync.init({
		server: {
			baseDir: './'
		}
	});

	gulp.watch( ['./**/*.scss', '!./node_modules/**', '!./dist/**'], series(compileSCSS, convertRTL) );
	gulp.watch( './*.html' ).on( 'change', browserSync.reload );
	gulp.watch( './js/**/*.js', series(concatAllPlugins, concatAllPluginsMin, buildFunctionsBundle, buildFunctions, functionsMin, functionsBundleMin, jsBundle, browserSync.reload) );
}

exports.scsscompile = series(compileSCSS, convertRTL);
exports.rtl = convertRTL;
exports.imageminify = compressImages;
exports.htmlminify = minifyHTML;
exports.cssminify = minifyCSS;
exports.jsminify = minifyJS;
exports.demosrtl = compileDemosCSSandRTL;
exports.concatplugins = series(concatAllPlugins, concatAllPluginsMin);
exports.buildjs = series(concatAllPlugins, concatAllPluginsMin, buildFunctionsBundle, buildFunctions, functionsMin, functionsBundleMin, jsBundle);
exports.minify = parallel(minifyCSS, minifyJS);
exports.watch = watch;
