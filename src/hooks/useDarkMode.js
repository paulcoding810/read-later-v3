import { useCallback, useEffect, useState } from 'react'

const KEY = 'darkMode'

function applyDarkMode(enabled) {
  document.documentElement.classList.toggle('dark', enabled)
}

function getStored(key, fallback) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (val) => {
      resolve(val[key] ?? fallback)
    })
  })
}

function setStored(obj) {
  return new Promise((resolve) => {
    chrome.storage.local.set(obj, resolve)
  })
}

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    getStored(KEY, false).then((storedDarkMode) => {
      setDarkMode(storedDarkMode)
      applyDarkMode(storedDarkMode)
    })

    function handleStorageChange(changes, areaName) {
      if (areaName !== 'local' || !changes[KEY]) return

      const next = changes[KEY].newValue ?? false
      setDarkMode(next)
      applyDarkMode(next)
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  const toggle = useCallback(async () => {
    const next = !darkMode
    setDarkMode(next)
    applyDarkMode(next)
    await setStored({ [KEY]: next })
  }, [darkMode])

  return { darkMode, toggle }
}
