import gulp from 'gulp'
import zip from 'gulp-zip'
import { createRequire } from 'module'
import { loadEnv } from 'vite'
const require = createRequire(import.meta.url)
const manifest = require('../build/manifest.json')

let browser = loadEnv('production', process.cwd()).VITE_BROWSER ?? 'chrome'
browser = browser[0].toUpperCase() + browser.slice(1)


gulp
  .src('build/**')
  .pipe(zip(`${manifest.name.replaceAll(' ', '-')}-${browser}-${manifest.version}.zip`))
  .pipe(gulp.dest('package'))
