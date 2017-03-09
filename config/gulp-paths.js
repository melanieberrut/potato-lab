module.exports = {
	paths: {
		src: {
			images: "./src/images/**/*",
			template: {
				files: "./src/**/*.html",
				path: "src/templates"
			},
			data: "./data/data.json",
			core: {
				path: "./src/core",
				styles: "./src/core/assets/**/*.scss",
				images: "./src/core/assets/**/*.+(png|jpg|jpeg|svg)"
			},
			templating: {
				layouts:  "./src/templates/layouts/**/*.html",
				macros:   "./src/templates/macros/**/*.html",
				pages:    "./src/templates/pages/**/*.html",
				partials: "./src/templates/partials/**/*.html"
			}

		},
		build: {
			images: "./build/images/",
			template: "./build",
			core: {
				path: "./build",
				assets: "./build/core/assets"
			},
			templating: {
				layouts:  "./templates/layouts/",
				pages:    "./templates/pages/",
				macros:   "./templates/macros/",
				partials: "./templates/partials/"
			}
		}
	}
};