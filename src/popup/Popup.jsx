import { useCallback, useEffect, useState } from 'react'
import colors from 'tailwindcss/colors'
import packageData from '../../package.json'
import AddIcon from '../assets/circle_plus.svg?react'
import CopyIcon from '../assets/copy.svg?react'
import DeleteIcon from '../assets/delete.svg?react'
import DownloadIcon from '../assets/download.svg?react'
import EmptyIcon from '../assets/empty.svg?react'
import MoreIcon from '../assets/more.svg?react'
import LoadingIcon from '../assets/loading.svg?react'
import GroupsIcon from '../assets/workspaces.svg?react'
import DarkMode from '../assets/dark_mode.svg?react'
import LightMode from '../assets/light_mode.svg?react'
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
      className={`relative flex w-full flex-col gap-2 bg-white p-2 dark:bg-gray-900 ${
        expanded ? 'min-h-80' : ''
      }`}
    >
      <div className="sticky top-0 z-10 flex flex-row items-center gap-1.5 bg-white pb-2 dark:bg-gray-900">
        <SearchBar {...{ query, setQuery }} />
        <button
          title="More"
          onClick={() => setExpanded(!expanded)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            expanded
              ? 'border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-900/50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800'
          }`}
        >
          <MoreIcon
            aria-hidden="true"
            className={`size-5 text-blue-500 transition-transform dark:text-blue-300 [&_path]:fill-current ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        </button>
        <button
          title="Groups"
          onClick={() => setShowsGroups(!showsGroups)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            showsGroups
              ? 'border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-900/50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800'
          }`}
        >
          <GroupsIcon
            aria-hidden="true"
            className="size-5 text-blue-500 dark:text-blue-300 [&_path]:fill-current"
          />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingIcon
            aria-label="Loading"
            className="size-8 animate-spin text-blue-500 dark:text-blue-300 [&_circle]:stroke-current"
          />
        </div>
      ) : (
        <div className={expanded ? 'pointer-events-none opacity-50' : ''}>
          {tabs.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <EmptyIcon aria-hidden="true" className="size-16 opacity-50" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {query ? (
                  <span>No results found for "{query}"</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span>No saved tabs yet</span>
                    <span className="text-xs text-gray-400">
                      Press{' '}
                      <kbd className="rounded-sm border bg-gray-100 px-1.5 py-0.5 text-xs dark:border-gray-600 dark:bg-gray-700">
                        Ctrl
                      </kbd>{' '}
                      +{' '}
                      <kbd className="rounded-sm border bg-gray-100 px-1.5 py-0.5 text-xs dark:border-gray-600 dark:bg-gray-700">
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
          <div className="absolute top-14 right-2 z-50 flex flex-col items-stretch gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-gray-800">
            <button
              onClick={() => {
                chrome.runtime.sendMessage({ type: messages.ADD_TAB }, (response) => {
                  if (response?.success) {
                    getDBAndSetTabs(query)
                  }
                  setExpanded(false)
                })
              }}
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
              <AddIcon
                aria-hidden="true"
                className="size-4 text-blue-500 dark:text-blue-300 [&_*]:stroke-current"
              />
              <span>Add Current Tab</span>
            </button>

            <button
              onClick={() => {
                exportJson()
                setExpanded(false)
              }}
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
              <DownloadIcon
                aria-hidden="true"
                className="size-4 text-blue-500 dark:text-blue-300 [&_path]:fill-current"
              />
              <span>Export Data</span>
            </button>

            <button
              onClick={() => {
                copyTabUrl()
                setExpanded(false)
              }}
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
              <CopyIcon
                aria-hidden="true"
                className="size-4 text-blue-500 dark:text-blue-300 [&_path]:fill-current"
              />
              <span>Copy All URLs</span>
            </button>

            {isChrome && (
              <button
                onClick={async () => {
                  await iconCacheDB.clear()
                  setExpanded(false)
                }}
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
              >
                <DeleteIcon
                  aria-hidden="true"
                  className="size-4 text-red-500 dark:text-red-300 [&_path]:fill-current"
                />
                <span>Invalidate Icon Cache</span>
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
              {darkMode ? (
                <DarkMode
                  aria-hidden="true"
                  className="size-4 text-blue-500 dark:text-blue-300 [&_path]:fill-current"
                />
              ) : (
                <LightMode
                  aria-hidden="true"
                  className="size-4 text-blue-500 dark:text-blue-300 [&_path]:fill-current"
                />
              )}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* custom firefox version */}
            <div className="mt-1 border-t pt-2 text-center text-xs text-gray-400 dark:border-gray-600 dark:text-gray-500">
              v{isChrome ? packageData.version : '3' + packageData.version.slice(1)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Popup
