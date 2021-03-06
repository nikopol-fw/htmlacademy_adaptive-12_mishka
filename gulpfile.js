"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();

var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var run = require("run-sequence");
var del = require("del");
var jsmin = require("gulp-uglify");
var pump = require("pump");

gulp.task("style", function() {
  gulp.src("less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("css"))

    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("css"))
    .pipe(gulp.dest("build/css"))

    .pipe(server.stream());
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("less/**/*.less", ["style"]);
  gulp.watch("*.html").on("change", server.reload);
});

gulp.task("sprite", function () {
  return gulp.src("img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("icon-sprite.svg"))
    .pipe(gulp.dest("img"));
});

gulp.task("images", function () {
  return gulp.src("build/img/**/*")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo({
        plugins: [{
          cleanupIDs: false
        }]
      })
    ]))

    .pipe(gulp.dest("build/img"));
});

gulp.task("jsmin", function (cb) {
  pump([
    gulp.src("build/js/script.js"),
    jsmin(),
    rename("script.min.js"),
    gulp.dest("js"),
    gulp.dest("build/js")
  ],
  cb
  );
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html"
    ], {
      base: "."
    })
  .pipe(gulp.dest("build"));
});

gulp.task("build", function (done) {
  run(
    "clean",
    "copy",
    "style",
    "jsmin",
    done
  );
});
