import { useState } from 'react'
import closeIcon from '../assets/close.svg'

export default function SearchBar({ query, setQuery }) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={`flex flex-1 items-center gap-1 border-2 px-1 rounded-lg ${focused ? 'border-blue-500' : ''}`}
    >
      <input
        className="flex-1 py-2 mx-1 border-none outline-none"
        type="text"
        placeholder="Search..."
        value={query}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.length > 0 && (
        <button
          onClick={() => setQuery('')}
          className="p-1 text-sm text-red-500 rounded hover:bg-gray-300"
        >
          <img src={closeIcon} alt="Close" title="Clear" />
        </button>
      )}
    </div>
  )
}
