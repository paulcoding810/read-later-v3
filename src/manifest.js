import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json' assert { type: 'json' }

const isDev = process.env.NODE_ENV === 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-32.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  commands: {
    save_tabs: {
      suggested_key: {
        default: 'Ctrl+B',
        mac: 'MacCtrl+B',
      },
      description: "Send a 'read-later' event to the extension",
    },
  },
  options_page: 'options.html',
  background: {
    service_worker: 'src/background/index.js',
    type: 'module',
  },
  content_scripts: isDev
    ? [
        {
          matches: ['http://*/*', 'https://*/*'],
          js: ['src/contentScript/index.js'],
        },
      ]
    : undefined,
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-32.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['storage', 'tabs', 'contextMenus', 'scripting', 'activeTab', 'downloads'],
  chrome_url_overrides: {
    newtab: 'newtab.html',
  },
})
