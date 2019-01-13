import fs from 'fs';
import path from 'path';

import gulp from 'gulp';
import livereload from 'gulp-livereload';
import sass from 'gulp-sass';

// Load all gulp plugins automatically
// and attach them to the `plugins` object
import plugins from 'gulp-load-plugins';

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
import runSequence from 'run-sequence';

import archiver from 'archiver';
import glob from 'glob';
import del from 'del';
import ssri from 'ssri';
import modernizr from 'modernizr';

import pkg from './package.json';
import modernizrConfig from './modernizr-config.json';


const dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', () => {
  fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', (done) => {

  const archiveName = path.resolve(dirs.archive, `${pkg.name}_v${pkg.version}.zip`);
  const zip = archiver('zip');
  const files = glob.sync('**/*.*', {
    'cwd': dirs.dist,
    'dot': true // include hidden files
  });
  const output = fs.createWriteStream(archiveName);

  zip.on('error', (error) => {
    done();
    throw error;
  });

  output.on('close', done);

  files.forEach((file) => {

    const filePath = path.resolve(dirs.dist, file);

    // `zip.bulk` does not maintain the file
    // permissions, so we need to add files individually
    zip.append(fs.createReadStream(filePath), {
      'name': file,
      'mode': fs.statSync(filePath).mode
    });

  });

  zip.pipe(output);
  zip.finalize();

});

gulp.task('clean', (done) => {
  del.sync([
    dirs.archive,
    dirs.dist
  ]);

  done();
});

gulp.task('copy', [
  'copy:.htaccess',
  'copy:index.html',
  'copy:license',
  'copy:main.css',
  'copy:misc',
  'copy:normalize'
]);

gulp.task('copy:.htaccess', () =>
  gulp.src('node_modules/apache-server-configs/dist/.htaccess')
    .pipe(plugins().replace(/# ErrorDocument/g, 'ErrorDocument'))
    .pipe(gulp.dest(dirs.dist))
);

gulp.task('copy:index.html', () => {
  let modernizrVersion = pkg.devDependencies.modernizr;

  gulp.src(`${dirs.src}/index.html`)
    .pipe(plugins().replace(/{{MODERNIZR_VERSION}}/g, modernizrVersion))
    .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:license', () =>
  gulp.src('LICENSE.txt')
    .pipe(gulp.dest(dirs.dist))
);

gulp.task('copy:main.css', () => {

  const banner = `/*! HTML5 Boilerplate v${pkg.version} | ${pkg.license} License | ${pkg.homepage} */\n\n`;

  gulp.src(`${dirs.src}/css/main.css`)
    .pipe(plugins().header(banner))
    .pipe(plugins().autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9', '> 1%'],
      cascade: false
    }))
    .pipe(gulp.dest(`${dirs.dist}/css`));
});

gulp.task('copy:misc', () =>
  gulp.src([

    // Copy all files
    `${dirs.src}/**/*`,

    // Exclude the following files
    // (other tasks will handle the copying of these files)
    `!${dirs.src}/css/main.css`,
    `!${dirs.src}/index.html`

  ], {

    // Include hidden files by default
    dot: true

  }).pipe(gulp.dest(dirs.dist))
);

gulp.task('copy:normalize', () =>
  gulp.src('node_modules/normalize.css/normalize.css')
    .pipe(gulp.dest(`${dirs.dist}/css`))
);

gulp.task('modernizr', (done) =>{

  modernizr.build(modernizrConfig, (code) => {

    if (!fs.existsSync(`${dirs.dist}/js/vendor`)) {
      fs.mkdirSync(`${dirs.dist}/js/vendor`);
    }

    fs.writeFileSync(`${dirs.dist}/js/vendor/modernizr-${pkg.devDependencies.modernizr}.min.js`, code);
    done();
  });

});

gulp.task('lint:js', () =>
  gulp.src([
    'gulpfile.js',
    `${dirs.src}/js/*.js`,
    `${dirs.test}/*.js`
  ]).pipe(plugins().jscs())
    .pipe(plugins().eslint())
    .pipe(plugins().eslint.failOnError())
);


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', (done) => {
  runSequence(
    'build',
    'archive:create_archive_dir',
    'archive:zip',
    done);
});

gulp.task('build', (done) => {
  runSequence(
    ['clean', 'lint:js', 'sass'],
    'copy', 'modernizr',
    done);
});

gulp.task('sass', () => {
  gulp.src([
    `${dirs.src}/css/*.scss`,
  ])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(`${dirs.dist}/css`));

});

gulp.task('watch:files', () => {

});

gulp.task('inject:watch_script', () => {
  let modernizrVersion = pkg.devDependencies.modernizr;

  gulp.src(`${dirs.src}/*.html`)
    .pipe(plugins().injectString.after('</title>', '\n  <script>\n' +
      '    document.write(\'<script src="http://\' + (location.host || \'localhost\').split(\':\')[0] +\n' +
      '      \':35729/livereload.js?snipver=1"></\' + \'script>\')\n' +
      '  </script>'))
    .pipe(plugins().replace(/{{MODERNIZR_VERSION}}/g, modernizrVersion))
    .pipe(gulp.dest(dirs.dist));
});

gulp.task('watch', () => {
  livereload.listen({
    basePath: path.resolve(dirs.dist)
  });

  runSequence('build', 'inject:watch_script');

  gulp.watch(`${dirs.src}/css/*.scss`, ['sass']);
  gulp.watch('src/**/*.*',function(file){
    let changeFileName = file.path.split(`${dirs.src}/`)[1];
    if (changeFileName.endsWith('.scss')) {
      changeFileName = changeFileName.replace(/[/]*.scss$/, '.css');
      livereload.changed(changeFileName);
    } else {
      runSequence('build', 'inject:watch_script', () => {
        livereload.changed(changeFileName);
      });
    }



  });
});

gulp.task('default', ['build']);
