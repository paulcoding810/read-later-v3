import { useCallback, useEffect, useState } from 'react'
import colors from 'tailwindcss/colors'
import packageData from '../../package.json'
import addIcon from '../assets/circle_plus.svg'
import copyIcon from '../assets/copy.svg'
import deleteIcon from '../assets/delete.svg'
import downloadIcon from '../assets/download.svg'
import emptyIcon from '../assets/empty.svg'
import moreIcon from '../assets/more.svg'
import loadingIcon from '../assets/loading.svg'
import groupsIcon from '../assets/workspaces.svg'
import { messages } from '../background/message'
import SearchBar from '../components/SearchBar'
import Tab from '../components/Tab'
import Groups from '../groups/Groups'
import '../tailwind.css'
import { iconCacheDB } from '../helper'
import { setBadge, setBadgeBackground } from '../utils/badge'
import { save2Json } from '../utils/file'
import { getCurrentWindowTabs } from '../utils/tabs'
import { useDarkMode } from '../hooks/useDarkMode'

const exportJson = async () => {
  chrome.runtime.sendMessage({ type: messages.EXPORT_DATA }, (response) => {
    if (response?.success) {
      save2Json(response.data)
    }
  })
}

const copyTabUrl = async () => {
  const tabs = await getCurrentWindowTabs(true)
  const urls = tabs.map((tab) => tab.url)
  navigator.clipboard.writeText(JSON.stringify(urls))
}

const getReadLaterDatabase = async (query) => {
  return await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: messages.SEARCH_TABS, query }, (response) => {
      if (response?.success) {
        resolve(response.tabs)
      } else {
        resolve([])
      }
    })
  })
}

const removeTabFromDB = async (tabId) => {
  await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: messages.REMOVE_TAB, tab: { id: tabId } }, (response) => {
      resolve(response?.success)
    })
  })
}

const getCount = async () => {
  return await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: messages.GET_COUNT }, (response) => {
      if (response?.success) {
        resolve(response.count)
      } else {
        resolve(0)
      }
    })
  })
}

export function Popup() {
  const { darkMode, toggle: toggleDarkMode } = useDarkMode()
  const [showsGroups, setShowsGroups] = useState(false)
  const [tabs, setTabs] = useState([])
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChrome] = useState(navigator.userAgent.includes('Chrome'))

  const getDBAndSetTabs = useCallback(async (query) => {
    setIsLoading(true)
    try {
      const data = await getReadLaterDatabase(query)
      setTabs(data.toReversed())
    } catch (error) {
      console.error('failed to get data', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeTab = async (tab) => {
    setTabs(tabs.filter((t) => t !== tab))
    await removeTabFromDB(tab.id)
    await updateBadge()
  }

  const updateBadge = async () => {
    const count = await getCount()
    setBadge(count)
    setBadgeBackground(colors.blue[500])
  }

  useEffect(() => {
    getDBAndSetTabs(query)
  }, [query])

  if (showsGroups) return <Groups {...{ setShowsGroups, darkMode }} />

  return (
    <div
      className={`relative flex flex-col w-full gap-2 p-2 bg-white dark:bg-gray-900 ${
        expanded ? 'min-h-80' : ''
      }`}
    >
      <div className="sticky top-0 z-10 flex flex-row items-center gap-1.5 pb-2 bg-white dark:bg-gray-900">
        <SearchBar {...{ query, setQuery }} />
        <button
          title="More"
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center justify-center shrink-0 w-9 h-9 rounded-lg border transition-colors ${
            expanded
              ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700'
              : 'border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500'
          }`}
        >
          <img
            src={moreIcon}
            alt="More"
            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </button>
        <button
          title="Groups"
          onClick={() => setShowsGroups(!showsGroups)}
          className={`flex items-center justify-center shrink-0 w-9 h-9 rounded-lg border transition-colors ${
            showsGroups
              ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700'
              : 'border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500'
          }`}
        >
          <img src={groupsIcon} alt="Groups" className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <img className="w-8 h-8 animate-spin" src={loadingIcon} alt="Loading" />
        </div>
      ) : (
        <div className={expanded ? 'pointer-events-none opacity-50' : ''}>
          {tabs.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <img src={emptyIcon} alt="Empty" className="w-16 h-16 opacity-50" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {query ? (
                  <span>No results found for "{query}"</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span>No saved tabs yet</span>
                    <span className="text-xs text-gray-400">
                      Press{' '}
                      <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded-sm border dark:bg-gray-700 dark:border-gray-600">
                        Ctrl
                      </kbd>{' '}
                      +{' '}
                      <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded-sm border dark:bg-gray-700 dark:border-gray-600">
                        B
                      </kbd>{' '}
                      to add the current tab
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {tabs.map((tab, index) => (
            <Tab key={index} {...tab} onRemove={() => removeTab(tab)} />
          ))}
        </div>
      )}

      {expanded && (
        <>
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setExpanded(false)}
          />
          <div className="absolute z-50 flex flex-col items-stretch gap-1 p-2 bg-white border border-gray-200 rounded-lg shadow-xl right-2 top-14 dark:bg-gray-800 dark:border-gray-600">
            <button
              onClick={() => {
                chrome.runtime.sendMessage({ type: messages.ADD_TAB }, (response) => {
                  if (response?.success) {
                    getDBAndSetTabs(query)
                  }
                  setExpanded(false)
                })
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors rounded-sm hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
              <img className="w-4 h-4" src={addIcon} alt="" />
              <span>Add Current Tab</span>
            </button>

            <button
              onClick={() => {
                exportJson()
                setExpanded(false)
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors rounded-sm hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
              <img className="w-4 h-4" src={downloadIcon} alt="" />
              <span>Export Data</span>
            </button>

            <button
              onClick={() => {
                copyTabUrl()
                setExpanded(false)
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors rounded-sm hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
              <img className="w-4 h-4" src={copyIcon} alt="" />
              <span>Copy All URLs</span>
            </button>

            {isChrome && (
              <button
                onClick={async () => {
                  await iconCacheDB.clear()
                  setExpanded(false)
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors rounded-sm hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
              >
                <img className="w-4 h-4" src={deleteIcon} alt="" />
                <span>Invalidate Icon Cache</span>
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors rounded hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
              {darkMode ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* custom firefox version */}
            <div className="pt-2 mt-1 text-xs text-center text-gray-400 border-t dark:text-gray-500 dark:border-gray-600">
              v{isChrome ? packageData.version : '3' + packageData.version.slice(1)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Popup
