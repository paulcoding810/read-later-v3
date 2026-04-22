import { iconCacheDB } from '../helper'
import { isURL } from './url'

async function getCachedIcon(domain) {
  try {
    await iconCacheDB.open()
    const cached = await iconCacheDB.getByIndex(domain)
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > cached.ttl
      if (isExpired) {
        await iconCacheDB.delete(cached.id)
        return null
      }
      const blob = new Blob([cached.data], { type: 'image/png' })
      return URL.createObjectURL(blob)
    }
    return null
  } catch {
    return null
  }
}

const ONE_MONTH = 30 * 24 * 60 * 60 * 1000

async function setCachedIcon(domain, blobData, ttl = ONE_MONTH) {
  try {
    const arrayBuffer = await blobData.arrayBuffer()
    await iconCacheDB.add({ domain, data: arrayBuffer, timestamp: Date.now(), ttl })
  } catch {
    // Silently fail
  }
}

/* tabs */
export function saveTabs() {
  chrome.tabs.query(
    {
      currentWindow: true,
    },
    (tabs) => {
      const res = tabs.reduce((pre, tab) => {
        if (tab.title && tab.url) {
          pre.push({ title: tab.title, url: tab.url })
        }
        return pre
      }, [])
      const link = document.createElement('a')
      link.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res))}`
      link.download = `${tabs[0].title}.json`
      link.click()
    },
  )
}

export function getCurrentWindowTabs(highlighted = false) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      {
        highlighted: highlighted ? true : undefined,
        active: highlighted ? undefined : true,
        currentWindow: true,
      },
      (tabs) => {
        if (tabs) {
          resolve(tabs)
        } else {
          reject(new Error('[tabs] No tabs found'))
        }
      },
    )
  })
}

export async function getCurrentTab() {
  const tabs = await getCurrentWindowTabs(false)
  return tabs[0]
}

/**
 *
 * @param url tabs to open
 */
export function createTabs(urls) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      const currentTab = tabs[0]

      urls.forEach((url, index) => {
        if (url) {
          chrome.tabs.create({
            active: false,
            openerTabId: currentTab.id,
            index: currentTab.index + index + 1,
            url,
          })
        }
      })
    },
  )
}

/**
 *
 * @param url tab to open
 * @param active new tab is focused if active = true
 */
export function createTab(url, active = false, incognito = false) {
  if (incognito) {
    chrome.windows.create({ url, incognito, focused: true })
    return
  }
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      const currentTab = tabs[0]
      chrome.tabs.create({
        active,
        openerTabId: currentTab.id,
        index: currentTab.index + 1,
        url: url ?? currentTab.url,
      })
    },
  )
}

/**
 * Duplicate current tab
 */
export function dublicateTab() {
  createTab('')
}

/**
 *
 * @param text selected text
 * @param command
 */
export function openUrlOrText(text, active = false) {
  const url = isURL(text) ? text : `https://www.google.com/search?q=${text}`
  createTab(url, active)
}

/**
 * Load new url in current tab
 */
export function updateUrl(url) {
  chrome.tabs.update({
    url,
  })
}

export async function getIcon(url) {
  try {
    const { origin } = new URL(url)
    const domain = origin.replace('https://', '').replace('http://', '')

    const cached = await getCachedIcon(domain)
    if (cached) return cached

    const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${origin}`
    const response = await fetch(iconUrl)
    const blob = await response.blob()
    await setCachedIcon(domain, blob)
    const cachedUrl = await getCachedIcon(domain)
    return cachedUrl || iconUrl
  } catch (error) {
    console.error('fail to get icon', error)
    return 'https://www.google.com/s2/favicons?sz=64&domain=github.com'
  }
}

export function isTabValid(tab) {
  return tab.url?.startsWith('http') && tab.title
}

export function parseTabInfo(tab) {
  return {
    url: tab.url ?? '',
    title: tab.title ?? '',
    date: Date.now(),
    id: tab.id,
  }
}

export async function getCurrentWindowTabsInfo(highlighted) {
  const tabs = await getCurrentWindowTabs(highlighted)
  return tabs.filter(isTabValid).map(parseTabInfo)
}
