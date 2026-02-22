import { useState } from 'react'
import closeIcon from '../assets/close.svg'
import copyIcon from '../assets/copy.svg'
import checkIcon from '../assets/check.svg'
import { createTab, getIcon } from '../utils/tabs'

export default function Tab({ title, url, onRemove }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleClick = (event) => {
    createTab(url, false, event.shiftKey)
    if (event.altKey || event.metaKey || event.ctrlKey) {
      onRemove()
    }
  }

  const handleCopy = async () => {
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
      className="flex flex-row items-center gap-1 p-2 mb-1 text-black border rounded cursor-pointer hover:bg-blue-200 active:bg-blue-500"
      onClick={handleClick}
    >
      <img className="w-8 h-8" src={getIcon(url)} alt={title} />
      <span className="flex-1 overflow-hidden text-ellipsis break-words text-[8px] line-clamp-2 text-black">
        {title}
      </span>
      <button
        className="p-1 text-blue-500 rounded cursor-default hover:bg-blue-200 active:bg-blue-500"
        onClick={(e) => {
          e.stopPropagation()
          handleCopy()
        }}
      >
        {isCopied ? (
          <img className="text-green-500" src={checkIcon} alt="Copied" title="Copied" />
        ) : (
          <img src={copyIcon} alt="Copy URL" title="Copy URL" />
        )}
      </button>
      <button
        className="p-1 text-red-500 rounded cursor-default hover:bg-red-200 active:bg-red-500"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <img src={closeIcon} alt="Remove Tab" title="Remove Tab" />
      </button>
    </div>
  )
}
