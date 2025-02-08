import { getCurrentTab } from './tabs';

export function setBadge(text, onlyCurrent = false) {
  getCurrentTab().then((tab) => {
    chrome.browserAction.setBadgeText({
      tabId: onlyCurrent ? tab.id : undefined,
      text: String(text),
    });
  });
}

export async function setBadgeBackground(color = '#3b82f6') {
  try {
    const tab = await getCurrentTab();
    await chrome.browserAction.setBadgeBackgroundColor({ color, tabId: tab.id });
  } catch (error) {
    console.error('failed to set badge color', error);
  }
}

export function setTemporaryBadge(text) {
  chrome.browserAction.getBadgeText({})
    .then((curBadge) => {
      setTimeout(() => {
        setBadge(curBadge);
      }, 5000);
    });
  setBadge(text);
}
