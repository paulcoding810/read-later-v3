import { useCallback, useEffect, useState } from 'react'
import emptyIcon from '../assets/empty.svg'
import loadingIcon from '../assets/loading.svg'
import { setBadge, setBadgeBackground } from '../utils/badge'
import { getValue, setValue } from '../utils/storage'
import '../tailwind.css'
import Tab from '../components/Tab'

const setStorageAndUpdateBadge = (newTabs) => {
  setValue({
    read_later: newTabs.toReversed(),
  })
    .then(() => {
      setBadge(newTabs.length)
      setBadgeBackground('#3b82f6')
    })
    .catch((error) => {
      console.error('setStorageAndUpdateBadge', error)
    })
}

const getDatabase = async () => {
  const storage = await getValue()
  const db = storage?.read_later ?? []
  return db
}

export function Popup() {
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
      const data = await getDatabase()
      let tabs = data
      if (query)
        tabs = data.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      setTabs(tabs.toReversed())
    } catch (error) {
      console.error('failed to get data', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const removeTab = async (tab) => {
    const temp = [...tabs]
    const index = tabs.indexOf(tab)
    temp.splice(index, 1)
    setTabs(temp)
    setStorageAndUpdateBadge(temp)
  }

  // init data from storage
  useEffect(() => {
    getDBAndSetTabs('')
  }, [])

  // debounce query
  useEffect(() => {
    const timeout = setTimeout(() => {
      getDBAndSetTabs(query)
    }, 800)
    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="flex flex-col w-full">
      <input
        className="w-full px-3 py-1 mr-4 border-2 rounded-lg focus:outline-none focus:border-blue-500"
        type="text"
        placeholder="Search..."
        value={query}
        autoFocus
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <img src={loadingIcon} alt="Loading..." className="w-8 h-8 self-centerw-8" />}
      {!loading && tabs.length == 0 && (
        <div className="flex flex-col self-center gap-2 m-4 text-center placeholder:flex-col">
          <img
            src={emptyIcon}
            alt="No results found."
            className="w-[100px] h-[100px] self-center"
          />
          <span>
            press <code className="mx-1">Ctrl+b</code>to add new tabs!
          </span>
        </div>
      )}

      {tabs.map((tab, index) => (
        <Tab key={index} {...tab} onRemove={() => removeTab(tab)} />
      ))}
    </div>
  )
}

export default Popup
