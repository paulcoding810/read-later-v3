import { useState } from 'react'
import closeIcon from '../assets/close.svg'

export default function SearchBar({ query, setQuery }) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={`flex h-8 flex-1 items-center gap-1 border-2 px-1 rounded-lg ${focused ? 'border-blue-500' : ''}`}
    >
      <input
        className="flex-1 mx-1 border-none outline-none"
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
          className="w-4 h-4 rounded"
        >
          <img src={closeIcon} alt="Close" title="Clear" />
        </button>
      )}
    </div>
  )
}
