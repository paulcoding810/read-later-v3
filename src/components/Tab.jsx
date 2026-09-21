import { useState, useEffect } from 'react'
import CloseIcon from '../assets/close.svg?react'
import CopyIcon from '../assets/copy.svg?react'
import CheckIcon from '../assets/check.svg?react'
import AddIcon from '../assets/add.svg?react'
import { MAX_TAGS, MAX_TAG_LENGTH, normalizeTags } from '../utils/tags'
import { createTab, getIcon, s2IconUrl } from '../utils/tabs'

export default function Tab({ title, url, tags = [], onRemove, onTagsChange, onTagClick }) {
  const [isCopied, setIsCopied] = useState(false)
  const [icon, setIcon] = useState('')
  const [failedSrc, setFailedSrc] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setFailedSrc(null)

    let alive = true
    getIcon(url).then((src) => {
      if (alive) setIcon(src)
    })
    return () => {
      alive = false
    }
  }, [url])

  // Empty until the cache lookup resolves, then the remote service only as a last
  // resort. Tracks the failing src rather than a boolean so a late-arriving icon still
  // gets its chance to render, and so a failing fallback can't loop.
  const iconSrc = icon && icon !== failedSrc ? icon : failedSrc ? s2IconUrl(url) : ''

  const handleClick = (event) => {
    createTab(url, false, event.shiftKey)
    if (event.altKey || event.metaKey || event.ctrlKey) {
      onRemove()
    }
  }

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const commitTags = (next) => {
    onTagsChange(normalizeTags(next))
    setDraft('')
  }

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (draft.trim()) commitTags([...tags, draft])
      return
    }
    if (event.key === 'Escape') {
      event.stopPropagation()
      setDraft('')
      setIsAdding(false)
      return
    }
    if (event.key === 'Backspace' && !draft && tags.length > 0) {
      commitTags(tags.slice(0, -1))
    }
  }

  return (
    <div
      className="group relative mb-1 flex cursor-pointer flex-row items-center gap-2 rounded-sm border border-gray-200 bg-white p-2 text-black transition-colors hover:border-gray-300 hover:bg-gray-50 active:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:active:bg-blue-950/40"
      onClick={handleClick}
    >
      {iconSrc ? (
        <img
          className="h-6 w-6 shrink-0"
          src={iconSrc}
          alt=""
          onError={() => setFailedSrc(iconSrc)}
        />
      ) : (
        <div className="h-6 w-6 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div
          title={title}
          className="overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap text-gray-900 dark:text-gray-100"
        >
          {title}
        </div>
        <div className="overflow-hidden text-xs text-ellipsis whitespace-nowrap text-gray-500 dark:text-gray-300">
          {url}
        </div>
        {(tags.length > 0 || isAdding) && (
          <div
            className="mt-1 flex flex-wrap items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-0.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              >
                <button
                  className="hover:text-blue-600 dark:hover:text-blue-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTagClick(tag)
                  }}
                >
                  {tag}
                </button>
                <button
                  aria-label={`Remove tag ${tag}`}
                  className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    commitTags(tags.filter((t) => t !== tag))
                  }}
                >
                  <CloseIcon className="size-3" />
                </button>
              </span>
            ))}
            {isAdding && (
              <input
                autoFocus
                value={draft}
                maxLength={MAX_TAG_LENGTH}
                placeholder="tag"
                className="w-20 rounded-full border border-gray-300 px-1.5 py-0.5 text-xs outline-hidden dark:border-gray-600 dark:bg-gray-800"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  setIsAdding(false)
                  setDraft('')
                }}
              />
            )}
          </div>
        )}
      </div>
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100">
        {tags.length < MAX_TAGS && (
          <button
            className="dark:hover:bg-blue rounded-sm border border-gray-200 bg-white p-1 text-blue-400 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-blue-300 dark:hover:border-blue-800"
            onClick={(e) => {
              e.stopPropagation()
              setIsAdding(true)
            }}
          >
            <AddIcon className="h-4 w-4" alt="Add tag" title="Add tag" />
          </button>
        )}
        <button
          className="dark:hover:bg-blue rounded-sm border border-gray-200 bg-white p-1 text-blue-400 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-blue-300 dark:hover:border-blue-800"
          onClick={handleCopy}
        >
          {isCopied ? (
            <CheckIcon className="h-4 w-4" alt="Copied" title="Copied" />
          ) : (
            <CopyIcon className="h-4 w-4" alt="Copy URL" title="Copy URL" />
          )}
        </button>
        <button
          className="dark:hover:bg-red rounded-sm border border-gray-200 bg-white p-1 text-red-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-red-300 dark:hover:border-red-800"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <CloseIcon className="h-4 w-4" alt="Remove Tab" title="Remove Tab" />
        </button>
      </div>
    </div>
  )
}
