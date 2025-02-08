import gulp from 'gulp'
import zip from 'gulp-zip'
import { createRequire } from 'module'
import { loadEnv } from 'vite'
const require = createRequire(import.meta.url)
const manifest = require('../build/manifest.json')

const browser = loadEnv('production', process.cwd()).VITE_BROWSER ?? 'chrome'

gulp
  .src('build/**')
  .pipe(zip(`${manifest.name.replaceAll(' ', '-')}-${browser.case}-${manifest.version}.zip`))
  .pipe(gulp.dest('package'))
