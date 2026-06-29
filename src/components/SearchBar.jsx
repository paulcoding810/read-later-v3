import { useEffect, useRef, useState } from 'react'
import CloseIcon from '../assets/close.svg?react'
import SearchIcon from '../assets/search.svg?react'

export default function SearchBar({ query, setQuery }) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div
      className={`flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-lg border px-2 ${
        focused ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-300 dark:border-gray-500'
      }`}
    >
      <SearchIcon className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
      <input
        ref={inputRef}
        className="min-w-0 border-none text-sm outline-hidden"
        type="text"
        placeholder="Search..."
        value={query}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={() => setQuery('')}
        className={`rounded-sm ${query.length > 0 ? '' : 'invisible'}`}
      >
        <CloseIcon className="size-4 text-red-500 dark:text-red-300" />
      </button>
    </div>
  )
}
