import { isURL } from './url'

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
export function createTab(url, active = false) {
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

export function getIcon(url) {
  try {
    const { origin } = new URL(url)
    const icon = `https://www.google.com/s2/favicons?sz=64&domain=${origin}`
    return icon
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

