import colors from 'tailwindcss/colors'
import { getCurrentTab } from './tabs'

export function setBadge(text, onlyCurrent = false) {
  getCurrentTab().then((tab) => {
    chrome.action.setBadgeText({
      tabId: onlyCurrent ? tab.id : undefined,
      text: String(text),
    })
  })
}

export async function setBadgeBackground(color = colors.blue[500]) {
  try {
    const tab = await getCurrentTab()
    await chrome.action.setBadgeBackgroundColor({ color, tabId: tab.id })
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
