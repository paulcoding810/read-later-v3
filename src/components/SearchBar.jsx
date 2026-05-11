import { useEffect, useRef, useState } from 'react'
import closeIcon from '../assets/close.svg'

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
      className={`flex h-9 flex-1 items-center gap-1.5 border px-2 rounded-lg ${
        focused ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-300'
      }`}
    >
      <svg
        className="w-4 h-4 text-gray-400 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        ref={inputRef}
        className="flex-1 text-sm border-none outline-none"
        type="text"
        placeholder="Search..."
        value={query}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.length > 0 && (
        <button onClick={() => setQuery('')} className="w-4 h-4 rounded">
          <img src={closeIcon} alt="Clear" />
        </button>
      )}
    </div>
  )
}
