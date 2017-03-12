var gulp = require("gulp"),
	gConfig = require("./gulp-paths"),
	src = gConfig.paths.src,
	build = gConfig.paths.build,
	debug = require('gulp-debug'),
	imagemin = require("gulp-imagemin"),
	nunjucksRender = require("gulp-nunjucks-render"),
	nunjucks = require("nunjucks"),
	fs = require("fs"),
	data = require("gulp-data"),
	hologram = require("gulp-hologram"),
	glob = require("glob"),
	sass = require("gulp-sass"),
	sassdoc = require("sassdoc"),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	gutil = require("gulp-util"),
	eslint = require("gulp-eslint"),
	browserSync = require("browser-sync").create();



gulp.task("images", function() {
	// Get all the images
	gulp.src( src.images )
		// minifies the images from the given path
		.pipe(imagemin({
			// verbose: true
		}))
		// output them in the build folder
		.pipe(gulp.dest( build.images ))
		.pipe(browserSync.stream());
});


gulp.task("styles", function() {
	// Locate the source SASS files
	gulp.src( src.styles )
		// Init sourcemaps
		.pipe(sourcemaps.init())
		// trap any errors on sass compile
		.pipe(sass().on("error", sass.logError))
		// Apply vendors prefix
		.pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        // Generate sourcemaps
        .pipe(sourcemaps.write())
		// compile to CSS in location
		.pipe(gulp.dest( build.styles ))
		.pipe(browserSync.stream());
});


gulp.task("scripts", function() {
	// Locate the source JS files
	gulp.src( src.scripts )
		// Moe to build
		.pipe(gulp.dest( build.scripts ))
		.pipe(browserSync.stream());
});


gulp.task("core", function() {
	// Define the options
	var options = src.core.path;
	// Map
	function globTransform(pattern, previewPath) {
		var result = glob.sync(pattern, options);
		return result.map(function(item){
			var file = item.split("/").pop();
			return {
				path: previewPath + file,
				name: item
					.replace(/^.*\//, "")
					.replace(/\.\w+$/, "")
			};
		});
	}
	// Object to hold all the different templating paths
	var data = {
		templates: globTransform( src.templating.layouts, build.templating.layouts ),
		pages: globTransform( src.templating.pages, build.templating.pages ),
		macros: globTransform( src.templating.macros, build.templating.macros ),
		partials: globTransform( src.templating.partials, build.templating.partials )
	};

	// Images
	gulp.src( src.core.images )
		.pipe(imagemin())
		.pipe(gulp.dest( build.core.assets ));

	// Sass to CSS
	gulp.src( src.core.styles )
		.pipe(sass().on("error", sass.logError))
		.pipe(gulp.dest( build.core.assets ));

	// Output results on index page
	var result = nunjucks.render( src.core.path + "/index.html", data);
	var saveDestination = build.core.path + "/index.html";
	fs.writeFileSync(saveDestination, result);

});

gulp.task("nunjucks", function() {
	// Gets .html files in pages
	return gulp.src( src.template.files )
		// Adding data to Nunjucks
		.pipe(data(function() {
			return JSON.parse(fs.readFileSync( src.data ));
		}))
		// Renders template with nunjucks
		.pipe(nunjucksRender({
			path: [ src.template.path ]
		}))
		// output files in src folder
		.pipe(gulp.dest( build.template ))
		.pipe(browserSync.stream());
});

gulp.task("browser-sync", function() {
	browserSync.init({
		// Create a static server
		server: "./",
		// Serve the specific folders:
		serveStatic: ["./build", "./docs"],
		// Don't show any notifications in the browser.
		notify: false
	});
	gulp.watch([src.styles], ['styles','sassdoc']);
	gulp.watch([src.template.files], ['nunjucks']);
});


gulp.task("lint", function() {
	// ESLint ignores files with "node_modules" paths.
	// So, it"s best to have gulp ignore the directory as well.
	// Also, Be sure to return the stream from the task;
	// Otherwise, the task may end before the stream has finished.
	return gulp.src(["./src/**/*.js","!node_modules/**", "!**/vendor/**"])
		// eslint() attaches the lint output to the "eslint" property
		// of the file object so it can be used by other modules.
		.pipe(eslint({
			"rules":{
				"camelcase": 1,
				"comma-dangle": 2,
				"quotes": 0
			}
		}))
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failAfterError last.
		.pipe(eslint.failAfterError());
});

gulp.task("hologram", function() {
	// Locate the config file for hologram
	gulp.src( src.hologram )
		// generate hologram
		.pipe(hologram()); // options : {logging:true}
});

gulp.task("sassdoc", function () {
	// Options
	var options = {
		dest: "docs/sass",
		verbose: false,
		display: {
			access: ["public", "private"],
			alias: false,
			watermark: false
		}
	};
	gulp.src( src.styles )
		.pipe(sassdoc(options));

	// TO DO: Get the SASSDOC page to reload on SASS changes
});

// GLOBAL TASKS
gulp.task("default", ["images", "nunjucks", "core", "lint", "scripts", "styles", "sassdoc", "hologram"]);
gulp.task("dev", ["default", "browser-sync"]);

module.exports = gulp;