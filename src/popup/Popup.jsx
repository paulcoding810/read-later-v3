import { useCallback, useEffect, useState } from 'react'
import colors from 'tailwindcss/colors'
import emptyIcon from '../assets/empty.svg'
import loadingIcon from '../assets/loading.svg'
import { messages } from '../background/message'
import SearchBar from '../components/SearchBar'
import Tab from '../components/Tab'
import '../tailwind.css'
import { setBadge, setBadgeBackground } from '../utils/badge'
import { getValue, setValue } from '../utils/storage'

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

const getReadLaterDatabase = async () => {
  const storage = await getValue('read_later', [])
  return storage
}

export function Popup() {
  const [db, setDb] = useState([])
  const [tabs, setTabs] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // const transitions = useTransition(filteredTabs ?? [], {
  //   keys: (item) => item.url,
  //   from: { opacity: 0 },
  //   enter: { opacity: 1 },
  //   leave: { opacity: 0 },
  // });

  const getDBAndSetTabs = useCallback(async (query) => {
    try {
      setLoading(true)
      const data = await getReadLaterDatabase()
      setDb(data)
      let tabs = data
      if (query)
        tabs = data.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      setTabs(tabs.toReversed())
    } catch (error) {
      console.error('failed to get data', error)
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 50)
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
    const timeout = setTimeout(() => {
      getDBAndSetTabs(query)
    }, 600)
    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="flex flex-col w-full gap-2 bg-white">
      <SearchBar {...{ query, setQuery }} />
      {!loading && tabs.length == 0 && (
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
      <div>
        {tabs.map((tab, index) => (
          <Tab key={index} {...tab} onRemove={() => removeTab(tab)} />
        ))}
      </div>
    </div>
  )
}

export default Popup
