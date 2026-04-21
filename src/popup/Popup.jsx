import loadingIcon from '../assets/loading.svg'
import { useCallback, useEffect, useState } from 'react'
import colors from 'tailwindcss/colors'
import packageData from '../../package.json'
import addIcon from '../assets/circle_plus.svg'
import copyIcon from '../assets/copy.svg'
import downloadIcon from '../assets/download.svg'
import emptyIcon from '../assets/empty.svg'
import downIcon from '../assets/expand_circle_down.svg'
import upIcon from '../assets/expand_circle_up.svg'
import groupsIcon from '../assets/workspaces.svg'
import { messages } from '../background/message'
import SearchBar from '../components/SearchBar'
import Tab from '../components/Tab'
import Groups from '../groups/Groups'
import '../tailwind.css'
import { setBadge, setBadgeBackground } from '../utils/badge'
import { save2Json } from '../utils/file'
import { getCurrentWindowTabs } from '../utils/tabs'

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
  const [showsGroups, setShowsGroups] = useState(false)
  const [tabs, setTabs] = useState([])
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  // debounce query
  useEffect(() => {
    getDBAndSetTabs(query)
  }, [query])

  if (showsGroups) return <Groups {...{ setShowsGroups }} />

  return (
    <div className="flex flex-col w-full gap-2 p-2 bg-white">
      <div className="sticky top-0 z-10 flex flex-row items-center gap-2 pb-2 bg-white">
        <div className="flex-1">
          <SearchBar {...{ query, setQuery }} />
        </div>
        <button
          title="More"
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center justify-center w-9 h-9 p-1.5 rounded-lg border-2 transition-colors ${
            expanded ? 'bg-blue-200 border-blue-500' : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          <img src={expanded ? upIcon : downIcon} alt="More" className="w-5 h-5" />
        </button>
        <button
          title="Groups"
          onClick={() => setShowsGroups(!showsGroups)}
          className={`flex items-center justify-center w-9 h-9 p-1.5 rounded-lg border-2 transition-colors ${
            showsGroups
              ? 'bg-blue-200 border-blue-500 text-white'
              : 'border-gray-300 hover:bg-gray-100'
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
              <div className="text-sm text-gray-600">
                {query ? (
                  <span>No results found for "{query}"</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span>No saved tabs yet</span>
                    <span className="text-xs text-gray-400">
                      Press{' '}
                      <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border">Ctrl</kbd> +{' '}
                      <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border">B</kbd> to
                      add the current tab
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
        <div className="absolute z-50 flex flex-col items-stretch gap-1 p-2 bg-white border border-gray-200 rounded-lg shadow-xl right-2 top-14">
          <button
            onClick={() => {
              chrome.runtime.sendMessage({ type: messages.ADD_TAB }, (response) => {
                if (response?.success) {
                  getDBAndSetTabs(query)
                }
                setExpanded(false)
              })
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors rounded hover:bg-blue-50 hover:text-blue-600"
          >
            <img className="w-4 h-4" src={addIcon} alt="" />
            <span>Add Current Tab</span>
          </button>

          <button
            onClick={() => {
              exportJson()
              setExpanded(false)
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors rounded hover:bg-blue-50 hover:text-blue-600"
          >
            <img className="w-4 h-4" src={downloadIcon} alt="" />
            <span>Export Data</span>
          </button>

          <button
            onClick={() => {
              copyTabUrl()
              setExpanded(false)
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors rounded hover:bg-blue-50 hover:text-blue-600"
          >
            <img className="w-4 h-4" src={copyIcon} alt="" />
            <span>Copy All URLs</span>
          </button>

          <div className="pt-2 mt-1 text-xs text-center text-gray-400 border-t">
            v{packageData.version}
          </div>
        </div>
      )}
    </div>
  )
}

export default Popup
