import { useEffect, useRef, useState } from 'react'
import CloseIcon from '../assets/close.svg?react'
import SearchIcon from '../assets/search.svg?react'

export default function SearchBar({ query, setQuery }) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    // Firefox hands focus to the popup document asynchronously, and later still when the
    // popup is opened by keyboard shortcut rather than by click, so focusing during the
    // first commit is dropped. activeElement alone can't tell us it worked — it names the
    // input even while the document has no focus at all — hence the hasFocus() check.
    const focus = () => {
      const active = document.activeElement
      // Once the user has clicked something themselves, leave their focus alone.
      if (active && active !== document.body && active !== input) return true

      if (!document.hasFocus()) window.focus()
      input.focus({ preventScroll: true })
      return document.hasFocus() && document.activeElement === input
    }

    if (focus()) return

    const timers = [0, 30, 100, 250, 600].map((delay) => setTimeout(focus, delay))
    window.addEventListener('focus', focus)
    const giveUp = setTimeout(() => window.removeEventListener('focus', focus), 1000)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(giveUp)
      window.removeEventListener('focus', focus)
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
