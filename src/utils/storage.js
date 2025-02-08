if (!chrome?.storage?.local) {
  throw new Error('[storage] chrome.storage.local not found!')
}

export function getValue(key = null, defaultValue = null) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (val) => {
      if (val) {
        if (key) resolve(val[key] ?? defaultValue)
        else resolve(val)
      } else {
        reject(new Error('[storage] Database null'))
      }
    })
  })
}

export function setValue(obj) {
  return new Promise((resolve) => {
    chrome.storage.local.set(obj, () => {
      resolve('[setValue] success')
    })
  })
}

export function clearValue() {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve('[clearValue] success')
    })
  })
}

export function getSettings() {
  return getValue('settings')
}

export function putSetting(config) {
  return new Promise((resolve, reject) => {
    const settings = getSettings()
    setValue({ settings: { ...settings, ...config } })
      .then(resolve)
      .catch(reject)
  })
}

if (globalThis) {
  Object.assign(globalThis, { getValue, setValue, clearValue })
}
