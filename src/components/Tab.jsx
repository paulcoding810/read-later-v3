import { useState, useEffect } from 'react'
import closeIcon from '../assets/close.svg'
import copyIcon from '../assets/copy.svg'
import checkIcon from '../assets/check.svg'
import { createTab, getIcon } from '../utils/tabs'

export default function Tab({ title, url, onRemove }) {
  const [isCopied, setIsCopied] = useState(false)
  const [icon, setIcon] = useState('')

  useEffect(() => {
    getIcon(url).then(setIcon)
  }, [url])

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

  return (
    <div
      className="relative flex flex-row items-center gap-2 p-2 mb-1 text-black transition-colors bg-white border border-gray-200 rounded-sm cursor-pointer group hover:bg-gray-50 hover:border-gray-300 active:bg-blue-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:active:bg-blue-950/40"
      onClick={handleClick}
    >
      <img className="shrink-0 w-6 h-6" src={icon} alt="" />
      <div className="flex-1 min-w-0">
        <div
          title={title}
          className="overflow-hidden text-sm font-medium text-gray-900 text-ellipsis whitespace-nowrap dark:text-gray-100"
        >
          {title}
        </div>
        <div className="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap dark:text-gray-300">
          {url}
        </div>
      </div>
      <div className="absolute flex gap-1 opacity-0 top-1 right-1 group-hover:opacity-100">
        <button
          className="p-1 text-gray-400 transition-all bg-white border border-gray-200 rounded-sm shadow-sm hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-900 dark:border-gray-700 dark:text-blue-300 dark:hover:bg-blue-950/60 dark:hover:border-blue-800"
          onClick={handleCopy}
        >
          {isCopied ? (
            <img className="w-4 h-4" src={checkIcon} alt="Copied" title="Copied" />
          ) : (
            <img className="w-4 h-4" src={copyIcon} alt="Copy URL" title="Copy URL" />
          )}
        </button>
        <button
          className="p-1 text-gray-400 transition-all bg-white border border-gray-200 rounded-sm shadow-sm hover:bg-red-50 hover:text-red-600 dark:bg-gray-900 dark:border-gray-700 dark:text-red-300 dark:hover:bg-red-950/60 dark:hover:border-red-800"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <img className="w-4 h-4" src={closeIcon} alt="Remove Tab" title="Remove Tab" />
        </button>
      </div>
    </div>
  )
}
