import colors from 'tailwindcss/colors'
import { groupDB, readLaterDB } from '../helper'
import { setBadge, setBadgeBackground } from '../utils/badge'
import { getCurrentWindowTabsInfo } from '../utils/tabs'
import devDB from './devdb'
import { commands, messages } from './message'

const isProd = import.meta.env.PROD

function logError(err) {
  console.log('onError', err)
}

const updateBadge = async () => {
  const count = await readLaterDB.count()
  setBadge(String(count))
  setBadgeBackground(colors.blue[500])
}

function logStorageChange(changes, areaName) {
  const changedItems = Object.keys(changes)
  changedItems.forEach((item) => {
    console.log('[Old]', changes[item].oldValue)
    console.log('[New]', changes[item].newValue)
  })
}

async function tabExisted(url) {
  const foundTab = await readLaterDB.getByIndex(url)
  return Boolean(foundTab)
}

const syncStorageToDB = async () => {
  const storage = await chrome.storage.local.get()
  const { read_later: readLater, groups } = storage
  if (readLater) {
    let set = new Set()
    for (const item of readLater) {
      if (set.has(item.url)) {
        console.warn('Duplicate URL found in read later:', item.url)
        continue
      }
      set.add(item.url)
      try {
        await readLaterDB.add(item)
      } catch (error) {
        console.error('Error adding item to read later:', item, error)
        continue
      }
    }
  }
  if (groups) {
    for (const groupName of Object.keys(groups)) {
      try {
        await groupDB.add({ name: groupName, urls: groups[groupName] })
      } catch (error) {
        console.error('Error adding group:', groupName, error)
        continue
      }
    }
  }
}

const checkAndSyncStorage = async () => {
  const synced = (await chrome.storage.local.get({ synced: false })).synced
  if (!synced) {
    await syncStorageToDB()
    console.log('Storage synced to DB')
    await chrome.storage.local.set({ synced: true })
  }
}

async function getAndSaveTabsToReadLater() {
  try {
    const tabs = await getCurrentWindowTabsInfo(true)
    for (let index = 0; index < tabs.length; index += 1) {
      const tab = tabs[index]
      if (await tabExisted(tab.url)) {
        console.log('Tab existed', tab)
        setBadgeBackground(colors.orange[500])
      } else {
        // tab.id is returned by tabs api. In readLaterDB, id is auto-incremented
        setBadgeBackground(colors.green[500], tab.id)
        const { url, title, date } = tab
        readLaterDB.add({ url, title, date })
      }
    }

    setBadge(await readLaterDB.count())
  } catch (error) {
    logError(error)
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  if (!isProd) {
    for (let group of devDB.groups) {
      await groupDB.add(group)
    }

    for (let index = 0; index < devDB.read_later.length; index += 1) {
      await readLaterDB.add(devDB.read_later[index])
    }
  }
})

chrome.runtime.onMessage.addListener((request) => {
  switch (request.type) {
    case messages.REMOVE_TAB:
      break
    case messages.ADD_TAB:
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

// if (!isProd) {
//   chrome.contextMenus.create({
//     id: 'open_debug_tab',
//     title: 'Debug',
//     contexts: ['action'],
//   })
//   chrome.contextMenus.create({
//     id: 'open_popup_tab',
//     title: 'Popup',
//     contexts: ['action'],
//   })
// }

// chrome.contextMenus.onClicked.addListener(async (info, tab) => {
//   switch (info.menuItemId) {
//     case 'open_debug_tab':
//       const b = import.meta.env.VITE_BROWSER
//       const url = chrome.runtime.getURL(
//         b === 'firefox' ? '_generated_background_page.html' : 'service-worker-loader.js',
//       )
//       createTab(chrome.runtime.getURL(url), true)
//       break
//     case 'open_popup_tab':
//       createTab(chrome.runtime.getURL('popup.html'), true)
//       break
//     default:
//       break
//   }
// })

const main = async () => {
  checkAndSyncStorage()
  updateBadge()
}

main()
