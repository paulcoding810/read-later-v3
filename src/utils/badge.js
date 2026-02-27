import colors from 'tailwindcss/colors'
import { getCurrentTab } from './tabs'

export function setBadge(text, onlyCurrent = false) {
  getCurrentTab()
    .then((tab) => {
      chrome.action.setBadgeText({
        tabId: onlyCurrent ? tab.id : undefined,
        text: String(text),
      })
    })
    .catch((error) => {
      console.warn("can't find current tab", error)
      chrome.action.setBadgeText({
        tabId: undefined,
        text: String(text),
      })
    })
}

export async function setBadgeBackground(color = colors.blue[500], tabId = null) {
  const currentTab = await getCurrentTab()
  const id = tabId ?? currentTab?.id ?? undefined

  try {
    await chrome.action.setBadgeBackgroundColor({ color, tabId: id })
    await chrome.action.setBadgeTextColor({ color: 'white' })
  } catch (error) {
    console.error('failed to set badge color', error)
  }
}

export function setTemporaryBadge(text) {
  chrome.action.getBadgeText({}).then((curBadge) => {
    setTimeout(() => {
      setBadge(curBadge)
    }, 5000)
  })
  setBadge(text)
}
