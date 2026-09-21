import Fuse from 'fuse.js'
import colors from 'tailwindcss/colors'
import { groupDB, readLaterDB } from '../helper'
import { setBadge, setBadgeBackground } from '../utils/badge'
import { isFirefox } from '../utils/browser'
import { normalizeTags } from '../utils/tags'
import { createTab, getCurrentWindowTabsInfo } from '../utils/tabs'
import devDB from './devdb'
import { commands, messages } from './message'

const isProd = import.meta.env.PROD
const WINDOWS_FIREFOX_SHORTCUT_WARNING_PAGE = 'shortcut-warning.html'

const fuseOptions = { keys: ['title', 'url', 'tags'], threshold: 0.4, useExtendedSearch: true }

let fuse = new Fuse([], fuseOptions)

async function initFuse() {
  fuse = new Fuse(await readLaterDB.getAll(), fuseOptions)
}

function addToFuse(tab) {
  fuse.add(tab)
}

function removeFromFuse(tab) {
  fuse.remove((t) => t.id === tab.id)
}

function logError(err) {
  console.log('onError', err)
}

async function isWindows() {
  const platformInfo = await new Promise((resolve) => {
    chrome.runtime.getPlatformInfo(resolve)
  })
  return platformInfo.os === 'win'
}

async function openWindowsFirefoxShortcutWarning() {
  if (!isFirefox() || !(await isWindows())) return

  await new Promise((resolve) => {
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL(WINDOWS_FIREFOX_SHORTCUT_WARNING_PAGE),
        active: true,
      },
      () => {
        const error = chrome.runtime.lastError
        if (error) {
          console.warn('Unable to open Windows Firefox shortcut warning:', error)
        }
        resolve()
      },
    )
  })
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
  await initFuse()
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
        setBadgeBackground(colors.green[500], tab.id)
        const { url, title, date } = tab
        const id = await readLaterDB.add({ url, title, date })
        addToFuse({ url, title, date, id })
      }
    }

    setBadge(await readLaterDB.count())
  } catch (error) {
    logError(error)
  }
}

/**
 * Merge an exported backup back in. Existing rows win: a tab whose URL is already saved
 * and a group whose name is taken are both skipped rather than overwritten.
 */
async function importData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Expected an object with "read_later" and/or "groups"')
  }

  const { read_later: readLater, groups } = data
  const result = { tabs: 0, groups: 0, skipped: 0 }

  if (Array.isArray(readLater)) {
    for (const item of readLater) {
      if (!item?.url || !item?.title || (await tabExisted(item.url))) {
        result.skipped += 1
        continue
      }
      const tags = normalizeTags(item.tags)
      // Drop any exported id so the store assigns a fresh one.
      await readLaterDB.add({
        url: item.url,
        title: item.title,
        date: item.date ?? Date.now(),
        ...(tags.length > 0 && { tags }),
      })
      result.tabs += 1
    }
  }

  // Groups export as an array, but older backups hold a { name: urls } map.
  const groupList = Array.isArray(groups)
    ? groups
    : groups && typeof groups === 'object'
      ? Object.entries(groups).map(([name, urls]) => ({ name, urls }))
      : []

  for (const group of groupList) {
    if (!group?.name || !Array.isArray(group.urls)) {
      result.skipped += 1
      continue
    }
    try {
      await groupDB.add({ name: group.name, urls: group.urls })
      result.groups += 1
    } catch {
      // Duplicate name — the unique nameIndex rejects it.
      result.skipped += 1
    }
  }

  await initFuse()
  await updateBadge()
  return result
}

/**
 * Replace a saved tab's tags. Reads first because IDB update() is a whole-record put.
 */
async function updateTabTags(id, tags) {
  const existing = await readLaterDB.get(id)
  if (!existing) throw new Error(`No saved tab with id ${id}`)

  const next = { ...existing, tags: normalizeTags(tags) }
  if (next.tags.length === 0) delete next.tags

  await readLaterDB.update(next)
  removeFromFuse(next)
  addToFuse(next)
  return next
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    await openWindowsFirefoxShortcutWarning()
  }

  if (!isProd) {
    for (let group of devDB.groups) {
      await groupDB.add(group)
    }

    for (let index = 0; index < devDB.read_later.length; index += 1) {
      await readLaterDB.add(devDB.read_later[index])
    }
  }
})

chrome.runtime.onStartup.addListener(() => {
  updateBadge()
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case messages.REMOVE_TAB:
      readLaterDB
        .delete(request.tab.id)
        .then(() => {
          removeFromFuse(request.tab)
          updateBadge()
          sendResponse({ success: true })
        })
        .catch((err) => {
          logError(err)
          sendResponse({ success: false, error: err.message })
        })
      break
    case messages.ADD_TAB:
      getAndSaveTabsToReadLater()
        .then(() => {
          sendResponse({ success: true })
        })
        .catch((err) => {
          logError(err)
          sendResponse({ success: false, error: err.message })
        })
      break
    case messages.UPDATE_TAB:
      updateTabTags(request.tab.id, request.tab.tags)
        .then((tab) => {
          sendResponse({ success: true, tab })
        })
        .catch((err) => {
          logError(err)
          sendResponse({ success: false, error: err.message })
        })
      break
    case messages.GET_ALL_TABS:
      readLaterDB
        .getAll()
        .then((tabs) => {
          sendResponse({ success: true, tabs })
        })
        .catch((err) => {
          logError(err)
          sendResponse({ success: false, error: err.message })
        })
      break
    case messages.GET_COUNT:
      readLaterDB
        .count()
        .then((count) => {
          sendResponse({ success: true, count })
        })
        .catch((err) => {
          logError(err)
          sendResponse({ success: false, error: err.message })
        })
      break
    case messages.SEARCH_TABS:
      readLaterDB
        .getAll()
        .then((tabs) => {
          const query = request.query?.trim()
          if (!query) {
            sendResponse({ success: true, tabs })
          } else {
            // Map back onto the stored rows; a drifted Fuse doc then costs a missed
            // match rather than rendering stale data.
            const byId = new Map(tabs.map((tab) => [tab.id, tab]))
            const results = fuse
              .search(query)
              .map((result) => byId.get(result.item.id))
              .filter(Boolean)
            sendResponse({ success: true, tabs: results })
          }
        })
        .catch((err) => {
          logError(err)
          sendResponse({ success: false, error: err.message })
        })
      break
    case messages.GET_GROUPS:
      groupDB
        .getAll()
        .then((groups) => {
          sendResponse({ success: true, groups })
        })
        .catch((err) => {
          logError(err)
          sendResponse({ success: false, error: err.message })
        })
      break
    case messages.OPEN_GROUP_URLS:
      request.urls.toReversed().forEach((url, index) => {
        setTimeout(() => createTab(url), index * 250)
      })
      sendResponse({ success: true })
      break
    case messages.IMPORT_DATA:
      importData(request.data)
        .then((result) => {
          sendResponse({ success: true, result })
        })
        .catch((err) => {
          logError(err)
          sendResponse({ success: false, error: err.message })
        })
      break
    case messages.EXPORT_DATA:
      Promise.all([readLaterDB.getAll(), groupDB.getAll()])
        .then(([readLater, groups]) => {
          sendResponse({ success: true, data: { read_later: readLater, groups } })
        })
        .catch((err) => {
          logError(err)
          sendResponse({ success: false, error: err.message })
        })
      break
    default:
      break
  }
  return true
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

const main = async () => {
  checkAndSyncStorage()
  updateBadge()
}

main()
