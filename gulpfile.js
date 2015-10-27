var browserify = require('browserify');
var watchify   = require('watchify');
var streamify  = require('gulp-streamify');
var uglify     = require('gulp-uglify');
var gulpif     = require('gulp-if');
var gulp       = require('gulp');
var source     = require('vinyl-source-stream');

var BrowserifyOptions = {
    // Files to operate on
    entries: 'client/app/main.ts',

    // Generate source maps (.js.map files) for debugging
    debug: true,

    // Required for running thru watchify
    cache:        {},
    packageCache: {},
    fullPaths:    true  // Needed?
}

gulp.task('build-prod', function() {
    BrowserifyOptions.debug = false;
    var b = browserify(BrowserifyOptions);

    // Add Typescript transpile plugin
    b.plugin('tsify');   // , { noImplicitAny: false })

    logForm({style : chalk.blue}, "Building prod bundle ... ");

    doBundle(b, {
	minimize : true,
	doneCB   : function() { logForm({style : chalk.blue}, "Done building for production"); }
    });
});

gulp.task('build-dev', function() {
    BrowserifyOptions.debug = true;
    var b = browserify(BrowserifyOptions);

    // Add Typescript transpile plugin
    b.plugin('tsify');   // , { noImplicitAny: false })

    logForm({style : chalk.blue}, "Building dev bundle ... ");

    doBundle(b, {
	minimize : false,
	doneCB   : function() { logForm({style : chalk.blue}, "Done building for development"); }
    });
});

gulp.task('watch-dev', function() {
    BrowserifyOptions.debug = true;
    var b = browserify(BrowserifyOptions);

    // Add Typescript transpile plugin
    b.plugin('tsify');   // , { noImplicitAny: false })

    var w = watchify(b);

    w.on('update', function() {
	logForm({style : chalk.blue}, "Updating bundle ... ");

	doBundle(w, {
	    doneCB : function() { logForm({style : chalk.blue}, "Update done"); }
	});

    });

    logForm({style : chalk.blue}, "Building bundle ... ");

    doBundle(w, {
	doneCB : function() { logForm({style : chalk.blue}, "Done building, now watching for changes ... "); }
    });
});

function doBundle(bundler, options) {
    if (!options) { options = {}; }

    bundler.bundle()
        // End callback
	.on('end', function() {
	    if (options.doneCB) { options.doneCB(); }
	})

        // Handle typescript compile errors
	.on('error', function (error) { 
	    logError(error.toString()); 
	})

        // vinyl-source-stream makes the bundle compatible with gulp
        .pipe(source('bundle.js'))

        // minimize the bundle if options.minimize
	.pipe(gulpif(options.minimize, streamify(uglify())))

        // Output the file
	.pipe(gulp.dest('./client/public/build'));
}

gulp.task('default', ['watch-dev']);


/////////////////////////////////////////////////////////////////////////////////
//
// Output formatting
//

var chalk      = require('chalk');
var dateformat = require('dateformat');
var util       = require('util');

function logForm(options) {
    // All args following options
    var args = Array.prototype.slice.call(arguments, 1);    
    
    var outStr = '';

    if (!options.noTime) {
	outStr += '[' + chalk.grey(dateformat(new Date(), 'HH:MM:ss')) + '] ';
    }

    var textStr = util.format.apply(this, args);

    if (options.style) {
	textStr = options.style(textStr);
    }

    outStr += textStr;

    if (! options.noNewline) {
	outStr += '\n';
    }

    process.stdout.write(outStr);
};

function log() {
    // grab all arguments
    var args = Array.prototype.slice.call(arguments);
    args.unshift({});  // add empty options
    logForm.apply(this, args);
}

function logError() {
    var args = Array.prototype.slice.call(arguments);
    logForm({noNewline : true, style : chalk.bgRed.white.bold}, " ERROR ");
    logForm({noNewline : true, noTime : true}, " ");
    args.unshift({noTime : true, style: chalk.red.bold});
    logForm.apply(this, args);
}

