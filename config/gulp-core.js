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
	glob = require("glob"),
	sass = require("gulp-sass"),
	gutil = require("gulp-util"),
	browserSync = require("browser-sync").create();



gulp.task("images", function() {
	// Get all the images
	gulp.src( src.images )
		// minifies the images from the given path
		.pipe(imagemin({
			verbose: true
		}))
		// output them in the build folder
		.pipe(gulp.dest( build.images ));
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
	.pipe(gulp.dest( build.template ));
	// .pipe(browserSync.stream());
});

gulp.task("browser-sync", function() {
	browserSync.init({
		// Create a static server
		server: "./",
		// Serve the specific folders:
		serveStatic: ["./build", "./docs"]
	});
});


gulp.task("default", ["images", "nunjucks", "core","browser-sync"]);

module.exports = gulp;