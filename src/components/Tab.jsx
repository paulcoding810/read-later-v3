import { createTab, getIcon } from '../utils/tabs'
import closeIcon from '../assets/close.svg';

export default function Tab({ title, url, onRemove }) {
  const handleClick = (event) => {
    createTab(url, false)
    if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) {
      onRemove()
    }
  }
  return (
    <div
      className="flex flex-row items-center gap-1 p-2 mb-1 text-black border rounded cursor-pointer hover:bg-blue-200 active:bg-blue-500"
      onClick={handleClick}
    >
      <img className="w-8 h-8" src={getIcon(url)} alt={title} />
      <span className="flex-1  overflow-hidden text-ellipsis break-words text-[8px] line-clamp-2 text-black">
        {title}
      </span>
      <button
        className="p-1 ml-auto text-red-500 rounded cursor-default hover:bg-red-200 active:bg-red-500"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
         <img src={closeIcon} alt="Remove Tab" title='Remove Tab'/>
      </button>
    </div>
  )
}
