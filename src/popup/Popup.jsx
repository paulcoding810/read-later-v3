import { useCallback, useEffect, useState } from 'react'
import colors from 'tailwindcss/colors'
import packageData from '../../package.json'
import AddIcon from '../assets/circle_plus.svg?react'
import CloseIcon from '../assets/close.svg?react'
import CopyIcon from '../assets/copy.svg?react'
import DeleteIcon from '../assets/delete.svg?react'
import DownloadIcon from '../assets/download.svg?react'
import UploadIcon from '../assets/upload.svg?react'
import EmptyIcon from '../assets/empty.svg?react'
import MoreIcon from '../assets/more.svg?react'
import OpenInNewIcon from '../assets/open_in_new.svg?react'
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
import { isFirefox } from '../utils/browser'
import { save2Json } from '../utils/file'
import { createTab, getCurrentWindowTabs } from '../utils/tabs'
import { useDarkMode } from '../hooks/useDarkMode'

const exportJson = async () => {
  chrome.runtime.sendMessage({ type: messages.EXPORT_DATA }, (response) => {
    if (response?.success) {
      save2Json(response.data)
    }
  })
}

const openUsagePage = () => {
  createTab(chrome.runtime.getURL('usage.html'), true)
}

const openBackupPage = () => {
  createTab(chrome.runtime.getURL('backup.html'), true)
}

function MenuItem({ icon, label, hint, onClick }) {
  return (
    <button
      title={hint}
      onClick={onClick}
      className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function MenuDivider() {
  return <div className="my-1 border-t border-gray-200 dark:border-gray-600" />
}

const menuIcon = 'size-4 shrink-0 text-blue-500 dark:text-blue-300 [&_path]:fill-current'

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

const updateTabTagsInDB = async (id, tags) => {
  return await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: messages.UPDATE_TAB, tab: { id, tags } }, (response) => {
      resolve(response?.success ? response.tab : null)
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
  const isChrome = !isFirefox()
  const [tagFilter, setTagFilter] = useState(null)

  const getDBAndSetTabs = useCallback(async (query) => {
    setIsLoading(true)
    try {
      const data = await getReadLaterDatabase(query)
      setTabs(query ? data : data.toReversed())
    } catch (error) {
      console.error('failed to get data', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeTab = async (tab) => {
    setTabs((current) => current.filter((t) => t.id !== tab.id))
    await removeTabFromDB(tab.id)
    await updateBadge()
  }

  const handleTagsChange = async (tab, tags) => {
    const previous = tab.tags ?? []
    setTabs((current) => current.map((t) => (t.id === tab.id ? { ...t, tags } : t)))

    const saved = await updateTabTagsInDB(tab.id, tags)
    if (!saved) {
      setTabs((current) => current.map((t) => (t.id === tab.id ? { ...t, tags: previous } : t)))
    }
  }

  const handleTagClick = (tag) => {
    setTagFilter((current) => (current === tag ? null : tag))
  }

  const updateBadge = async () => {
    const count = await getCount()
    setBadge(count)
    setBadgeBackground(colors.blue[500])
  }

  useEffect(() => {
    getDBAndSetTabs(query)
  }, [query])

  const visibleTabs = tagFilter ? tabs.filter((tab) => (tab.tags ?? []).includes(tagFilter)) : tabs

  if (showsGroups) return <Groups {...{ setShowsGroups, darkMode }} />

  return (
    <div
      className={`relative flex w-full flex-col gap-2 bg-white p-2 dark:bg-gray-900 ${
        expanded ? 'min-h-80' : ''
      }`}
    >
      <div className="sticky top-0 z-10 flex flex-col gap-1.5 bg-white pb-2 dark:bg-gray-900">
        <div className="flex flex-row items-center gap-1.5">
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
        {tagFilter && (
          <div className="flex items-center">
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
              tag: {tagFilter}
              <button aria-label="Clear tag filter" onClick={() => setTagFilter(null)}>
                <CloseIcon className="size-3" />
              </button>
            </span>
          </div>
        )}
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
          {visibleTabs.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <EmptyIcon aria-hidden="true" className="size-16 opacity-50" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {tagFilter ? (
                  <div className="flex flex-col gap-1">
                    <span>
                      No tabs tagged "{tagFilter}"{query ? ` matching "${query}"` : ''}
                    </span>
                    <button
                      className="text-xs text-blue-500 hover:underline dark:text-blue-300"
                      onClick={() => setTagFilter(null)}
                    >
                      Clear filter
                    </button>
                  </div>
                ) : query ? (
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
          {visibleTabs.map((tab) => (
            <Tab
              key={tab.id}
              {...tab}
              onRemove={() => removeTab(tab)}
              onTagsChange={(tags) => handleTagsChange(tab, tags)}
              onTagClick={handleTagClick}
            />
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
            <MenuItem
              icon={
                <AddIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-blue-500 dark:text-blue-300 [&_*]:stroke-current"
                />
              }
              label="Save Selected Tabs"
              hint="Every tab selected in this window — just the current one if you have not multi-selected"
              onClick={() => {
                chrome.runtime.sendMessage({ type: messages.ADD_TAB }, (response) => {
                  if (response?.success) {
                    getDBAndSetTabs(query)
                  }
                  setExpanded(false)
                })
              }}
            />

            <MenuItem
              icon={<CopyIcon aria-hidden="true" className={menuIcon} />}
              label="Copy Selected Tab URLs"
              hint="Copies those same tabs' URLs to the clipboard as JSON — not your saved list"
              onClick={() => {
                copyTabUrl()
                setExpanded(false)
              }}
            />

            <MenuDivider />

            <MenuItem
              icon={<DownloadIcon aria-hidden="true" className={menuIcon} />}
              label="Download Backup"
              hint="Your whole reading list and every group, as a JSON file"
              onClick={() => {
                exportJson()
                setExpanded(false)
              }}
            />

            <MenuItem
              icon={<UploadIcon aria-hidden="true" className={menuIcon} />}
              label="Restore Backup…"
              hint="Opens a page where you can pick a backup file to merge back in"
              onClick={() => {
                openBackupPage()
                setExpanded(false)
              }}
            />

            <MenuItem
              icon={
                <DeleteIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-red-500 dark:text-red-300 [&_path]:fill-current"
                />
              }
              label="Clear Icon Cache"
              hint="Drops saved favicons — they come back as rows load again"
              onClick={async () => {
                await iconCacheDB.clear()
                setExpanded(false)
              }}
            />

            <MenuDivider />

            <MenuItem
              icon={<OpenInNewIcon aria-hidden="true" className={menuIcon} />}
              label="Shortcuts"
              hint="Opens the full list of keys and click actions in a new tab"
              onClick={() => {
                openUsagePage()
                setExpanded(false)
              }}
            />

            <MenuItem
              icon={
                darkMode ? (
                  <DarkMode aria-hidden="true" className={menuIcon} />
                ) : (
                  <LightMode aria-hidden="true" className={menuIcon} />
                )
              }
              label={darkMode ? 'Light Mode' : 'Dark Mode'}
              onClick={toggleDarkMode}
            />

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
