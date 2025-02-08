import colors from 'tailwindcss/colors'
import { setBadge, setBadgeBackground } from '../utils/badge'
import { save2Json } from '../utils/file'
import { getValue, setValue } from '../utils/storage'
import { createTab, getCurrentWindowTabsInfo } from '../utils/tabs'
import devDB from './devdb'
import { commands, messages } from './message'

const isProd = import.meta.env.PROD
const setUrls = new Set()

function logError(err) {
  console.log('onError', err)
}

function logStorageChange(changes, areaName) {
  const changedItems = Object.keys(changes)
  changedItems.forEach((item) => {
    console.log('[Old]', changes[item].oldValue)
    console.log('[New]', changes[item].newValue)
  })
}

function tabExisted(newTab) {
  return setUrls.has(newTab.url)
}

async function getAndSaveTabsToReadLater() {
  try {
    const tabs = await getCurrentWindowTabsInfo(true)
    console.log('Adding', tabs)
    const db = (await getValue()).read_later ?? []

    for (let index = 0; index < tabs.length; index += 1) {
      const tab = tabs[index]
      if (tabExisted(tab)) {
        console.log('Tab existed', tab)
        setBadgeBackground(colors.orange[500])
      } else {
        db.push(tab)
        setUrls.add(tab.url)
      }
    }

    await setValue({ read_later: db })
    setBadge(String(db.length))
  } catch (error) {
    logError(error)
  }
}

chrome.runtime.onInstalled.addListener(() => {
  if (!isProd) {
    setValue(devDB)
      .then(() => {
        console.log('Import devDB successfully')
      })
      .catch((error) => {
        logError(`Failed to set devDB: ${error}`)
      })
  }
})

chrome.runtime.onMessage.addListener((request) => {
  switch (request.type) {
    case messages.REMOVE_TAB:
      setUrls.delete(request.tab.url)
      break
    case messages.ADD_TAB:
      setUrls.add(request.tab.url)
      break
    default:
      break
  }
})

chrome.action.setBadgeBackgroundColor({ color: 'blue' })
chrome.storage.onChanged.addListener(logStorageChange)
chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case commands.SAVE_TABS:
      await getAndSaveTabsToReadLater()
      break
    default:
      break
  }
})

if (!isProd) {
  chrome.contextMenus.create({
    id: 'open_debug_tab',
    title: 'Debug',
    contexts: ['action'],
  })
  chrome.contextMenus.create({
    id: 'open_popup_tab',
    title: 'Popup',
    contexts: ['action'],
  })
}

chrome.contextMenus.create(
  {
    id: 'export_json',
    title: 'Export JSON',
    contexts: ['action'],
  }
)

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case 'export_json':
      const data = await getValue()
      save2Json(data)
      break
    case 'open_debug_tab':
      const b = import.meta.env.VITE_BROWSER
      const url = chrome.runtime.getURL(
        b === 'firefox' ? '_generated_background_page.html' : 'service-worker-loader.js',
      )
      createTab(chrome.runtime.getURL(url), true)
      break
    case 'open_popup_tab':
      createTab(chrome.runtime.getURL('popup.html'), true)
      break
    default:
      break
  }
})

const main = async () => {
  getValue('read_later', [])
    .then((tabs) => {
      setBadge(String(tabs.length))
      tabs.forEach((tab) => {
        setUrls.add(tab.url)
      })
    })
    .catch(logError)
}

main()
