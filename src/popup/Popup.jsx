import { useCallback, useEffect, useState } from 'react'
import colors from 'tailwindcss/colors'
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
import { getValue, setValue } from '../utils/storage'
import { getCurrentWindowTabs } from '../utils/tabs'

const setStorageAndUpdateBadge = (newTabs) => {
  setValue({
    read_later: newTabs.toReversed(),
  })
    .then(() => {
      setBadge(newTabs.length)
      setBadgeBackground(colors.blue[500])
    })
    .catch((error) => {
      console.error('setStorageAndUpdateBadge', error)
    })
}

const exportJson = async () => {
  save2Json(await getValue(null, {}))
}

const copyTabUrl = async () => {
  const tabs = await getCurrentWindowTabs(true)
  const urls = tabs.map((tab) => tab.url)
  navigator.clipboard.writeText(JSON.stringify(urls))
}

const getReadLaterDatabase = async () => {
  const storage = await getValue('read_later', [])
  return storage
}

export function Popup() {
  const [showsGroups, setShowsGroups] = useState(false)
  const [db, setDb] = useState([])
  const [tabs, setTabs] = useState([])
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)

  const getDBAndSetTabs = useCallback(async (query) => {
    try {
      const data = await getReadLaterDatabase()
      setDb(data)
      let tabs = data
      if (query)
        tabs = data.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      // delay a bit for better ux
      setTimeout(() => {
        setTabs(tabs.toReversed())
      }, 50)
    } catch (error) {
      console.error('failed to get data', error)
    } finally {
    }
  }, [])

  const removeTab = async (tab) => {
    setTabs(tabs.filter((t) => t !== tab))

    const newTabs = db.filter((t) => t !== tab)
    setStorageAndUpdateBadge(newTabs)

    chrome.runtime.sendMessage({ type: messages.REMOVE_TAB, tab })
  }

  // init data from storage
  useEffect(() => {
    getDBAndSetTabs('')
  }, [])

  // debounce query
  useEffect(() => {
    // when user clear the search bar, show all tabs again (still need to call getDBAndSetTabs)
    if (query === '') setTabs(db.toReversed())

    const timeout = setTimeout(() => {
      getDBAndSetTabs(query)
    }, 600)
    return () => clearTimeout(timeout)
  }, [query])

  if (showsGroups) return <Groups {...{ setShowsGroups }} />

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex flex-row items-center h-8 gap-1">
        <SearchBar {...{ query, setQuery }} />
        <button
          title="Groups"
          onClick={() => setShowsGroups(!showsGroups)}
          className="flex items-center justify-center w-8 h-8 p-1 border-2 border-blue-500 rounded hover:bg-blue-200"
        >
          <img src={groupsIcon} alt="Group" />
        </button>
        <button
          title="More"
          onClick={() => {
            setExpanded(!expanded)
          }}
          className="flex items-center justify-center w-8 h-8 p-1 border-2 border-blue-500 rounded hover:bg-blue-200"
        >
          <img src={expanded ? upIcon : downIcon} alt="More" />
        </button>
      </div>
      {tabs.length == 0 && (
        <div className="flex flex-col self-center gap-2 m-4 text-center placeholder:flex-col">
          <img
            src={emptyIcon}
            alt="No results found."
            className="w-[100px] h-[100px] self-center"
          />
          {query ? (
            <span>No results found for "{query}"</span>
          ) : (
            <span>
              press <code className="mx-1">Ctrl+b</code>to add new tabs!
            </span>
          )}
        </div>
      )}
      <div className={expanded ? 'pointer-events-none' : ''}>
        {tabs.map((tab, index) => (
          <Tab key={index} {...tab} onRemove={() => removeTab(tab)} />
        ))}
      </div>

      {expanded && (
        <div className="absolute right-0 flex flex-col items-start gap-2 p-2 bg-white border border-blue-500 rounded shadow-lg top-8">
          <button
            title="Export Data"
            onClick={() => {
              exportJson()
              setExpanded(false)
            }}
            className="flex flex-row items-center w-full gap-1 p-1 hover:bg-blue-200"
          >
            <img className="w-4 h-4" src={downloadIcon} alt="Download" />
            <span>Export Data</span>
          </button>

          <button
            title="Copy tabs urls"
            onClick={() => {
              copyTabUrl()
              setExpanded(false)
            }}
            className="flex flex-row items-center w-full gap-1 p-1 hover:bg-blue-200"
          >
            <img className="w-4 h-4" src={copyIcon} alt="Copy" />
            <span>Copy tabs urls</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Popup
