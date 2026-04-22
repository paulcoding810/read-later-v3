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
      className="relative flex flex-row items-center gap-2 p-2 mb-1 text-black transition-colors border rounded cursor-pointer group hover:bg-gray-100 active:bg-blue-500"
      onClick={handleClick}
    >
      <img className="flex-shrink-0 w-6 h-6" src={icon} alt="" />
      <div className="flex-1 min-w-0">
        <div
          title={title}
          className="overflow-hidden text-sm font-medium text-gray-900 text-ellipsis whitespace-nowrap"
        >
          {title}
        </div>
        <div className="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap">
          {url}
        </div>
      </div>
      <div className="absolute flex gap-1 opacity-0 top-1 right-1 group-hover:opacity-100">
        <button
          className="p-1 text-gray-400 transition-all bg-white rounded hover:bg-blue-100 hover:text-blue-600"
          onClick={handleCopy}
        >
          {isCopied ? (
            <img className="w-4 h-4" src={checkIcon} alt="Copied" title="Copied" />
          ) : (
            <img className="w-4 h-4" src={copyIcon} alt="Copy URL" title="Copy URL" />
          )}
        </button>
        <button
          className="p-1 text-gray-400 transition-all bg-white rounded hover:bg-red-100 hover:text-red-600"
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
