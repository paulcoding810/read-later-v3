import { useState } from 'react'

export default function SearchBar({ query, setQuery }) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={`flex flex-1 items-center gap-1 border-2 px-2 rounded-lg ${focused ? 'border-blue-500' : ''}`}
    >
      <input
        className="flex-1 py-2 border-none outline-none"
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
          className="px-2 py-1 text-sm text-red-500 rounded hover:bg-gray-300"
        >
          X
        </button>
      )}
    </div>
  )
}
